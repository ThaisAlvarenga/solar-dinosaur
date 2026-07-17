import * as THREE from 'three'
import { yearProgress } from '../constants/timeline'
import { loadBuildingPositions } from '../data/mapLayout'
import { applyCo2Camera, loadCo2Camera } from './co2Camera'
import { getGlobalElapsedTime } from './sceneAnimation'
import { addLights, createCamera, createRenderer, fitTopDownCamera, isBuildingActive, scaleBuildingByMetric, commitSceneBuildings } from './shared'
import { Building, updateBuildingThemeMatcap } from '../components/building/index.js'

const BUILDING_SCALE = 0.18
const MAP_BASE_ROTATION = (-3 * Math.PI) / 4
const MAX_DRAG_DISTANCE = 1.0

// Lightweight building-to-building physics. Buildings are treated as unit
// mass, so these are accelerations rather than raw forces — tune to taste.
const HOME_SPRING_STRENGTH = 14 // pulls a non-dragged building back toward its original map slot
const COLLISION_STRENGTH = 90 // repulsion strength applied per unit of overlap between two buildings
const VELOCITY_DAMPING_PER_SECOND = 6 // higher = settles faster / feels less bouncy
const MAX_PHYSICS_SPEED = 6 // clamp so heavily overlapping buildings don't launch on first contact
const COLLISION_RADIUS = 0.6 // world-unit footprint radius at building scale = 1; tune to match Building's visual size

function formatSavings(dollars) {
  if (!dollars || dollars <= 0) {
    return '$0'
  }

  if (dollars >= 1_000_000) {
    return `$${(dollars / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })}M`
  }

  if (dollars >= 1000) {
    return `$${(dollars / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}K`
  }

  return `$${Math.round(dollars).toLocaleString()}`
}

/**
 * Saving scene — right triptych panel.
 * Building map driven by solar-cost.xlsx via mapSavingYearData().
 */
export function createSavingScene(initialYear) {
  const scene = new THREE.Scene()
  const camera = createCamera()
  const renderer = createRenderer()
  const state = {
    year: initialYear,
    data: { buildings: [] },
    ready: false,
    mapBounds: null,
  }

  addLights(scene, 0xe8fff0)
  const rim = new THREE.DirectionalLight(0x22c55e, 0.35)
  rim.position.set(-2, 4, 3)
  scene.add(rim)

  const mapGroup = new THREE.Group()
  mapGroup.scale.x = -1
  mapGroup.visible = false
  scene.add(mapGroup)

  const buildingEntries = new Map()
  const buildingObjects = []
  let domElement = null
  let labelEl = null
  let selectedId = null
  let pendingYearPayload = null
  let activeBuildingIds = new Set()
  let dragState = null
  let suppressNextClick = false
  let lastPhysicsTime = null

  const getFocusedBuildingId = () => selectedId

  const hideBuildingLabel = () => {
    if (!labelEl) return
    labelEl.replaceChildren()
    labelEl.hidden = true
  }

  const updateBuildingLabel = (statsOverride) => {
    const focusedId = getFocusedBuildingId()
    if (!labelEl || !focusedId) return

    const entry = buildingEntries.get(focusedId)
    const stats =
      statsOverride ?? (state.data.buildings ?? []).find((building) => building.id === focusedId)

    if (!isBuildingActive(stats)) {
      hideBuildingLabel()
      return
    }

    labelEl.replaceChildren()

    const nameEl = document.createElement('span')
    nameEl.className = 'saving-building-label__name'
    nameEl.textContent = entry?.name ?? ''
    labelEl.append(nameEl)

    // const yearEl = document.createElement('span')
    // yearEl.className = 'saving-building-label__year'
    // yearEl.textContent = String(state.year)
    // labelEl.append(yearEl)

    const statEl = document.createElement('span')
    statEl.className = 'saving-building-label__stat'
    statEl.textContent = formatSavings(stats?.annualSavings ?? 0)
    labelEl.append(statEl)

    labelEl.hidden = false
  }

  const refreshBuildingLabel = () => {
    if (!getFocusedBuildingId()) {
      hideBuildingLabel()
      return
    }

    updateBuildingLabel()
  }

  const applyCameraSetup = async () => {
    if (state.mapBounds) {
      fitTopDownCamera(camera, state.mapBounds)
    }

    const saved = await loadCo2Camera()
    if (saved) {
      applyCo2Camera(camera, saved)
    }
  }

  const syncFocusAfterYear = (statsById) => {
    const focusedId = getFocusedBuildingId()

    if (!focusedId) {
      hideBuildingLabel()
      return
    }

    const stats = statsById.get(focusedId)
    if (!isBuildingActive(stats)) {
      if (selectedId === focusedId) selectedId = null
      hideBuildingLabel()
      return
    }

    updateBuildingLabel(stats)
  }

  const commitYear = ({ year, data = {}, progress = yearProgress(year) }) => {
    const statsById = new Map((data.buildings ?? []).map((building) => [building.id, building]))
    const transitionTime = getGlobalElapsedTime()

    activeBuildingIds = commitSceneBuildings(
      buildingEntries,
      statsById,
      year,
      {
        animationTime: transitionTime,
        buildingsList: data.buildings ?? [],
        getMetricValue: (building) => building.annualSavings,
        getScale: (stats, min, max) =>
          scaleBuildingByMetric(stats.annualSavings, min, max, BUILDING_SCALE),
      },
    )

    mapGroup.rotation.y = MAP_BASE_ROTATION + progress * 0.015 - 0.0075
    syncFocusAfterYear(statsById)
  }

  const applyYear = (payload) => {
    state.year = payload.year
    state.data = payload.data
    pendingYearPayload = payload

    if (!state.ready) {
      return
    }

    commitYear(payload)
  }

  const initBuildings = async () => {
    try {
      const { buildings, bounds } = await loadBuildingPositions()
      state.mapBounds = bounds

      buildings.forEach((position) => {
        const building = new Building({
          theme: 'savings',
          position: { x: position.x, y: 0, z: position.z },
          scale: BUILDING_SCALE,
        })

        building.group.visible = false
        mapGroup.add(building.group)

        for (const mesh of [building.sphere, building.ring1, building.ring2]) {
          mesh.userData.savingBuildingId = position.id
        }

        const pickTarget = new THREE.Mesh(
          new THREE.SphereGeometry(1.15, 10, 10),
          new THREE.MeshBasicMaterial({ visible: false, depthWrite: false }),
        )
        pickTarget.userData.savingBuildingId = position.id
        building.group.add(pickTarget)

        buildingEntries.set(position.id, {
          id: position.id,
          name: position.name,
          building,
          pickTarget,
          // Physics state: homeX/homeZ is the fixed map slot a building
          // springs back toward; physX/physZ + velX/velZ are the simulated
          // position/velocity used for collisions and the spring-back.
          homeX: position.x,
          homeZ: position.z,
          physX: position.x,
          physZ: position.z,
          velX: 0,
          velZ: 0,
        })
        buildingObjects.push(building.group, pickTarget)
      })

      await applyCameraSetup()

      state.ready = true
      commitYear(
        pendingYearPayload ?? {
          year: state.year,
          data: state.data,
          progress: yearProgress(state.year),
        },
      )
      mapGroup.visible = true
    } catch (error) {
      console.warn('[savingScene] Failed to load building positions', error)
    }
  }

  initBuildings()

  const pointer = new THREE.Vector2()
  const raycaster = new THREE.Raycaster()

  // Ground plane (y = 0, matching building position.y = 0) used to translate
  // screen-space pointer movement into world-space movement regardless of
  // camera framing. This is then converted into mapGroup's local space so
  // dragging is correct even though mapGroup is rotated ~-135° and mirrored
  // on X (scale.x = -1).
  const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  const dragPlaneHit = new THREE.Vector3()

  const getPickables = () => {
    const meshes = []
    buildingEntries.forEach((entry) => {
      if (!entry.building.group.visible || !entry.pickTarget) return
      meshes.push(entry.pickTarget)
    })
    return meshes
  }

  const setPointerFromEvent = (event) => {
    if (!domElement) return false

    const rect = domElement.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return false

    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    return true
  }

  const pickBuildingAt = (event) => {
    if (!setPointerFromEvent(event)) return null

    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(getPickables(), false)
    return hits[0]?.object?.userData?.savingBuildingId ?? null
  }

  /**
   * Casts the current pointer position onto the y=0 ground plane and returns
   * the hit point converted into mapGroup's local space. Using local space
   * (rather than raw screen deltas) keeps dragging aligned with the cursor
   * regardless of mapGroup's rotation/mirroring.
   */
  const getLocalPointOnGround = (event) => {
    if (!setPointerFromEvent(event)) return null

    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.ray.intersectPlane(dragPlane, dragPlaneHit)
    if (!hit) return null

    // Ensure mapGroup's world matrix reflects any rotation applied this
    // frame (e.g. from commitYear) before converting into its local space.
    mapGroup.updateMatrixWorld()
    return mapGroup.worldToLocal(dragPlaneHit.clone())
  }

  const clampDragDelta = (dx, dz) => {
    const distance = Math.hypot(dx, dz)

    if (distance <= MAX_DRAG_DISTANCE) {
      return new THREE.Vector3(dx, 0, dz)
    }

    const ratio = MAX_DRAG_DISTANCE / distance
    return new THREE.Vector3(dx * ratio, 0, dz * ratio)
  }

  // Approximate collision footprint for a building, scaled with however big
  // it's currently rendered (buildings resize based on annualSavings).
  // Adjust COLLISION_RADIUS if this doesn't match the buildings' visual size.
  const getCollisionRadius = (entry) => {
    const scale = entry.building.group.scale.x || 1
    return COLLISION_RADIUS * Math.abs(scale)
  }

  /**
   * Advances the building layout by dt seconds:
   *  - the actively-dragged building (if any) is kinematic: its physics
   *    position is just synced from wherever the pointer handlers put it,
   *    and it pushes everything else without being pushed back.
   *  - every other visible building is pulled toward its home slot by a
   *    spring, and repelled away from any building it overlaps.
   * Results are written back onto the building meshes at the end.
   */
  const stepBuildingPhysics = (dt) => {
    if (dt <= 0) return

    const entries = Array.from(buildingEntries.values()).filter((entry) =>
      entry.building.shouldRender(),
    )

    const draggedId = dragState?.buildingId ?? null

    // Sync the dragged building's physics position from its actual (pointer
    // driven) mesh position, and apply the home spring to everything else.
    entries.forEach((entry) => {
      if (entry.id === draggedId) {
        entry.physX = entry.building.group.position.x
        entry.physZ = entry.building.group.position.z
        entry.velX = 0
        entry.velZ = 0
        return
      }

      entry.velX += (entry.homeX - entry.physX) * HOME_SPRING_STRENGTH * dt
      entry.velZ += (entry.homeZ - entry.physZ) * HOME_SPRING_STRENGTH * dt
    })

    // Pairwise repulsion: any two overlapping circles push apart along the
    // line between their centers, proportional to how much they overlap.
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const a = entries[i]
        const b = entries[j]

        const dx = a.physX - b.physX
        const dz = a.physZ - b.physZ
        const dist = Math.hypot(dx, dz)
        const minDist = getCollisionRadius(a) + getCollisionRadius(b)

        if (dist === 0 || dist >= minDist) continue

        const overlap = minDist - dist
        const nx = dx / dist
        const nz = dz / dist
        const push = overlap * COLLISION_STRENGTH * dt

        if (a.id !== draggedId) {
          a.velX += nx * push
          a.velZ += nz * push
        }
        if (b.id !== draggedId) {
          b.velX -= nx * push
          b.velZ -= nz * push
        }
      }
    }

    // Integrate velocity into position, damping over time so the layout
    // settles instead of oscillating forever.
    const dampFactor = Math.exp(-VELOCITY_DAMPING_PER_SECOND * dt)

    entries.forEach((entry) => {
      if (entry.id === draggedId) return

      entry.velX *= dampFactor
      entry.velZ *= dampFactor

      const speed = Math.hypot(entry.velX, entry.velZ)
      if (speed > MAX_PHYSICS_SPEED) {
        const clampRatio = MAX_PHYSICS_SPEED / speed
        entry.velX *= clampRatio
        entry.velZ *= clampRatio
      }

      entry.physX += entry.velX * dt
      entry.physZ += entry.velZ * dt

      entry.building.targetX = entry.physX
      entry.building.targetZ = entry.physZ
      entry.building.setPosition(entry.physX, entry.building.group.position.y, entry.physZ)
    })
  }

  const onPointerDown = (event) => {
    const hitId = pickBuildingAt(event)
    if (!hitId || !domElement) return

    const entry = buildingEntries.get(hitId)
    if (!entry) return

    // Select immediately on press so the info UI shows right away — the
    // same press then continues below to seed drag state, so one mousedown
    // both opens the label and lets the user drag without a second click.
    selectedId = selectedId === hitId ? null : hitId
    refreshBuildingLabel()

    const startLocalPoint = getLocalPointOnGround(event)
    if (!startLocalPoint) return

    dragState = {
      buildingId: hitId,
      pointerId: event.pointerId,
      startLocalPoint,
      originPosition: entry.building.group.position.clone(),
      moved: false,
    }
    suppressNextClick = false
    event.preventDefault()
    domElement.setPointerCapture?.(event.pointerId)
  }

  const onPointerMove = (event) => {
    if (!dragState || event.pointerId !== dragState.pointerId) return

    const currentLocalPoint = getLocalPointOnGround(event)
    if (!currentLocalPoint) return

    const dx = currentLocalPoint.x - dragState.startLocalPoint.x
    const dz = currentLocalPoint.z - dragState.startLocalPoint.z
    const dragDelta = clampDragDelta(dx, dz)
    const movedDistance = Math.hypot(dragDelta.x, dragDelta.z)

    if (movedDistance > 0.03) {
      dragState.moved = true
    }

    const entry = buildingEntries.get(dragState.buildingId)
    if (!entry) return

    const nextX = dragState.originPosition.x + dragDelta.x
    const nextZ = dragState.originPosition.z + dragDelta.z
    entry.building.targetX = nextX
    entry.building.targetZ = nextZ
    entry.building.setPosition(nextX, entry.building.group.position.y, nextZ)
  }

  const onPointerUp = (event) => {
    if (!dragState || event.pointerId !== dragState.pointerId) return

    if (dragState.moved) {
      suppressNextClick = true
    }

    if (domElement) {
      domElement.releasePointerCapture?.(event.pointerId)
    }

    dragState = null
  }

  const onPointerLeave = () => {
    if (!dragState) return
  }

  const onPointerClick = (event) => {
    if (suppressNextClick) {
      suppressNextClick = false
      return
    }

    // Selection/label toggling for building hits is handled in onPointerDown
    // now, so the click handler only needs to clear selection when the
    // pointer comes up over empty space.
    const hitId = pickBuildingAt(event)
    if (hitId) return

    if (!selectedId) return
    selectedId = null
    refreshBuildingLabel()
  }

  const setupInteraction = (element) => {
    domElement = element
    const panel = element.parentElement
    if (panel) {
      labelEl = document.createElement('div')
      labelEl.className = 'saving-building-label'
      labelEl.hidden = true
      panel.appendChild(labelEl)
    }

    element.addEventListener('pointerdown', onPointerDown)
    element.addEventListener('pointermove', onPointerMove)
    element.addEventListener('pointerup', onPointerUp)
    element.addEventListener('pointerleave', onPointerLeave)
    element.addEventListener('click', onPointerClick)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
  }

  const disposeInteraction = () => {
    if (domElement) {
      domElement.removeEventListener('pointerdown', onPointerDown)
      domElement.removeEventListener('pointermove', onPointerMove)
      domElement.removeEventListener('pointerup', onPointerUp)
      domElement.removeEventListener('pointerleave', onPointerLeave)
      domElement.removeEventListener('click', onPointerClick)
      domElement.style.cursor = ''
      domElement = null
    }

    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerUp)

    labelEl?.remove()
    labelEl = null
    selectedId = null
    dragState = null
    suppressNextClick = false
  }

  const animate = () => {
    const speed = 1 + yearProgress(state.year) * 0.5
    const animationTime = getGlobalElapsedTime() * speed
    const transitionTime = getGlobalElapsedTime()

    const now = getGlobalElapsedTime()
    const dt = lastPhysicsTime === null ? 0 : Math.min(now - lastPhysicsTime, 0.05)
    lastPhysicsTime = now

    stepBuildingPhysics(dt)

    let visibleCount = 0

    buildingEntries.forEach((entry) => {
      if (!entry.building.shouldRender()) return
      visibleCount++
      entry.building.update(animationTime, transitionTime)
    })

    if (visibleCount > 0) {
      updateBuildingThemeMatcap('savings', animationTime, 1.5 * speed)
    }
  }

  applyYear({ year: initialYear, data: { buildings: [] }, progress: yearProgress(initialYear) })

  return {
    scene,
    camera,
    renderer,
    animate,
    applyYear,
    setupInteraction,
    disposeInteraction,
    objects: buildingObjects,
  }
}