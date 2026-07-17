import * as THREE from 'three'
import { yearProgress } from '../constants/timeline'
import {
  loadBuildingPositions,
  loadSolarDataset,
  mapCo2YearData,
  mapEnergyYearData,
  mapSavingYearData,
} from '../data'
import { applyCo2Camera, loadCo2Camera } from './co2Camera'
import { getGlobalElapsedTime } from './sceneAnimation'
import {
  addLights,
  createCamera,
  createRenderer,
  fitTopDownCamera,
  isBuildingActive,
  scaleBuildingByMetric,
  commitSceneBuildings,
} from './shared'
import { Building, updateBuildingThemeMatcap } from '../components/building/index.js'
import { createBuildingParticles, PARTICLE_METRIC } from './createBuildingParticles.js'
import { formatCo2Lbs, formatDollars, formatEnergyKwh } from '../utils/formatMetrics'

const LOOK_AHEAD_YEAR = 2026
const BUILDING_SCALE = 0.18
const MAP_BASE_ROTATION = (-3 * Math.PI) / 4
const MAX_DRAG_DISTANCE = 1.0
const RING_GREY = 0x9a9a9a

const HOME_SPRING_STRENGTH = 14
const COLLISION_STRENGTH = 90
const VELOCITY_DAMPING_PER_SECOND = 6
const MAX_PHYSICS_SPEED = 6
const COLLISION_RADIUS = 0.6

/**
 * Future / Look Ahead scene — same building map as the main 2026 view,
 * with grey (neutral) buildings and tab-colored particle clouds.
 */
export function createFutureScene() {
  const scene = new THREE.Scene()
  const camera = createCamera()
  const renderer = createRenderer()
  const state = {
    year: LOOK_AHEAD_YEAR,
    data: { buildings: [] },
    metricsById: new Map(),
    particleTheme: 'energy',
    ready: false,
    mapBounds: null,
  }

  addLights(scene, 0xfff4e0)
  const rim = new THREE.DirectionalLight(0xb0b0b0, 0.35)
  rim.position.set(-2, 4, 3)
  scene.add(rim)

  const mapGroup = new THREE.Group()
  mapGroup.scale.x = -1
  mapGroup.visible = false
  scene.add(mapGroup)

  const buildingEntries = new Map()
  const buildingObjects = []
  let domElement = null
  let selectedId = null
  let buildingSelectHandler = null
  let dragState = null
  let suppressNextClick = false
  let lastPhysicsTime = null

  const getFocusedBuildingId = () => selectedId

  const getSelectedBuildingPayload = () => {
    const focusedId = getFocusedBuildingId()
    if (!focusedId) return null

    const entry = buildingEntries.get(focusedId)
    const metrics = state.metricsById.get(focusedId) ?? {}
    const stats = (state.data.buildings ?? []).find((building) => building.id === focusedId)

    if (!isBuildingActive(stats)) return null

    return {
      id: focusedId,
      name: entry?.name ?? stats?.name ?? '',
      annualKwh: metrics.annualKwh ?? stats?.annualKwh ?? 0,
      annualCo2Lbs: metrics.annualCo2Lbs ?? 0,
      annualSavings: metrics.annualSavings ?? 0,
      energyLabel: formatEnergyKwh(metrics.annualKwh ?? stats?.annualKwh ?? 0),
      co2Label: formatCo2Lbs(metrics.annualCo2Lbs ?? 0),
      moneyLabel: formatDollars(metrics.annualSavings ?? 0),
    }
  }

  const notifyBuildingSelect = () => {
    buildingSelectHandler?.(getSelectedBuildingPayload())
  }

  const clearBuildingSelection = () => {
    selectedId = null
    notifyBuildingSelect()
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

  const syncParticlesForEntry = (entry) => {
    const metrics = state.metricsById.get(entry.id) ?? {}
    const theme = PARTICLE_METRIC[state.particleTheme] ?? PARTICLE_METRIC.energy
    entry.particles.setColor(theme.color)
    entry.particles.setCountFromMetric(metrics[theme.field] ?? 0, theme.perParticle)
  }

  const syncAllParticles = () => {
    buildingEntries.forEach((entry) => {
      if (!entry.building.shouldRender()) {
        entry.particles.setCount(0)
        return
      }
      syncParticlesForEntry(entry)
    })
  }

  const commitYear = ({ year, data = {}, progress = yearProgress(year) }) => {
    const statsById = new Map((data.buildings ?? []).map((building) => [building.id, building]))
    const transitionTime = getGlobalElapsedTime()

    commitSceneBuildings(buildingEntries, statsById, year, {
      animationTime: transitionTime,
      buildingsList: data.buildings ?? [],
      getMetricValue: (building) => building.annualKwh,
      getScale: (stats, min, max) =>
        scaleBuildingByMetric(stats.annualKwh, min, max, BUILDING_SCALE),
    })

    mapGroup.rotation.y = MAP_BASE_ROTATION + progress * 0.015 - 0.0075
    syncAllParticles()

    const focusedId = getFocusedBuildingId()
    if (!focusedId) {
      notifyBuildingSelect()
      return
    }
    const stats = statsById.get(focusedId)
    if (!isBuildingActive(stats)) {
      clearBuildingSelection()
      return
    }
    notifyBuildingSelect()
  }

  const applyYear = (payload) => {
    // Look Ahead is locked to 2026 baseline; ignore timeline year changes.
    if (!state.ready) return
    commitYear({
      year: LOOK_AHEAD_YEAR,
      data: state.data,
      progress: yearProgress(LOOK_AHEAD_YEAR),
    })
  }

  const setParticleTheme = (theme) => {
    if (!PARTICLE_METRIC[theme]) return
    state.particleTheme = theme
    syncAllParticles()
  }

  const setBuildingSelectHandler = (handler) => {
    buildingSelectHandler = typeof handler === 'function' ? handler : null
    notifyBuildingSelect()
  }

  const initBuildings = async () => {
    try {
      const [{ buildings, bounds }, dataset] = await Promise.all([
        loadBuildingPositions(),
        loadSolarDataset(),
      ])
      state.mapBounds = bounds

      const energyData = mapEnergyYearData(dataset, LOOK_AHEAD_YEAR)
      const co2Data = mapCo2YearData(dataset, LOOK_AHEAD_YEAR)
      const savingData = mapSavingYearData(dataset, LOOK_AHEAD_YEAR)

      const co2ById = new Map((co2Data.buildings ?? []).map((b) => [b.id, b]))
      const savingById = new Map((savingData.buildings ?? []).map((b) => [b.id, b]))

      state.data = energyData
      state.metricsById = new Map(
        (energyData.buildings ?? []).map((building) => {
          const co2 = co2ById.get(building.id)
          const saving = savingById.get(building.id)
          return [
            building.id,
            {
              annualKwh: building.annualKwh ?? 0,
              annualCo2Lbs: co2?.annualCo2Lbs ?? 0,
              annualSavings: saving?.annualSavings ?? 0,
            },
          ]
        }),
      )

      buildings.forEach((position) => {
        const building = new Building({
          theme: 'neutral',
          position: { x: position.x, y: 0, z: position.z },
          scale: BUILDING_SCALE,
        })

        building.ring1Material.color.setHex(RING_GREY)
        building.ring2Material.color.setHex(RING_GREY)
        building.group.visible = false
        mapGroup.add(building.group)

        const particles = createBuildingParticles({
          color: PARTICLE_METRIC.energy.color,
        })
        building.group.add(particles.points)

        for (const mesh of [building.sphere, building.ring1, building.ring2]) {
          mesh.userData.futureBuildingId = position.id
        }

        const pickTarget = new THREE.Mesh(
          new THREE.SphereGeometry(1.15, 10, 10),
          new THREE.MeshBasicMaterial({ visible: false, depthWrite: false }),
        )
        pickTarget.userData.futureBuildingId = position.id
        building.group.add(pickTarget)

        buildingEntries.set(position.id, {
          id: position.id,
          name: position.name,
          building,
          particles,
          pickTarget,
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
      commitYear({
        year: LOOK_AHEAD_YEAR,
        data: state.data,
        progress: yearProgress(LOOK_AHEAD_YEAR),
      })
      mapGroup.visible = true
    } catch (error) {
      console.warn('[futureScene] Failed to load Look Ahead buildings', error)
    }
  }

  initBuildings()

  const pointer = new THREE.Vector2()
  const raycaster = new THREE.Raycaster()
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
    return hits[0]?.object?.userData?.futureBuildingId ?? null
  }

  const getLocalPointOnGround = (event) => {
    if (!setPointerFromEvent(event)) return null
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.ray.intersectPlane(dragPlane, dragPlaneHit)
    if (!hit) return null
    mapGroup.updateMatrixWorld()
    return mapGroup.worldToLocal(dragPlaneHit.clone())
  }

  const clampDragDelta = (dx, dz) => {
    const distance = Math.hypot(dx, dz)
    if (distance <= MAX_DRAG_DISTANCE) return new THREE.Vector3(dx, 0, dz)
    const ratio = MAX_DRAG_DISTANCE / distance
    return new THREE.Vector3(dx * ratio, 0, dz * ratio)
  }

  const getCollisionRadius = (entry) => {
    const scale = entry.building.group.scale.x || 1
    return COLLISION_RADIUS * Math.abs(scale)
  }

  const stepBuildingPhysics = (dt) => {
    if (dt <= 0) return

    const entries = Array.from(buildingEntries.values()).filter((entry) =>
      entry.building.shouldRender(),
    )
    const draggedId = dragState?.buildingId ?? null

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

    selectedId = selectedId === hitId ? null : hitId
    notifyBuildingSelect()

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
    if (Math.hypot(dragDelta.x, dragDelta.z) > 0.03) dragState.moved = true

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
    if (dragState.moved) suppressNextClick = true
    domElement?.releasePointerCapture?.(event.pointerId)
    dragState = null
  }

  const onPointerLeave = () => {}

  const onPointerClick = (event) => {
    if (suppressNextClick) {
      suppressNextClick = false
      return
    }
    const hitId = pickBuildingAt(event)
    if (hitId) return
    if (!selectedId) return
    clearBuildingSelection()
  }

  const setupInteraction = (element) => {
    domElement = element
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
    selectedId = null
    dragState = null
    suppressNextClick = false
    buildingSelectHandler?.(null)

    buildingEntries.forEach((entry) => {
      entry.particles.dispose()
    })
  }

  const animate = () => {
    const speed = 1 + yearProgress(LOOK_AHEAD_YEAR) * 0.5
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
      entry.particles.animate(speed)
    })

    if (visibleCount > 0) {
      updateBuildingThemeMatcap('neutral', animationTime, 1.5 * speed)
    }
  }

  return {
    scene,
    camera,
    renderer,
    animate,
    applyYear,
    setParticleTheme,
    setBuildingSelectHandler,
    setupInteraction,
    disposeInteraction,
    objects: buildingObjects,
  }
}
