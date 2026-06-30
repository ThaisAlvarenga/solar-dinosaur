import * as THREE from 'three'
import { yearProgress } from '../constants/timeline'
import { loadBuildingPositions } from '../data/mapLayout'
import { applyCo2Camera, loadCo2Camera } from './co2Camera'
import { addLights, createCamera, createRenderer } from './shared'
import { createSunBuilding } from './createSunBuilding'

const BUILDING_SCALE = 0.091
/** Rotate map so county spread runs bottom-left → top-right on screen */
const MAP_BASE_ROTATION = (-3 * Math.PI) / 4

const CO2_CORE = 0x006aff
const CO2_EMISSIVE = 0x0047cc
const CO2_PARTICLE = 0x4d94ff
const CO2_ORBIT = 0x3388ff
const CO2_PARTICLE_SIZE = 0.045

function formatCo2Saved(lbs) {
  if (!lbs || lbs <= 0) {
    return '0 lbs CO₂ saved'
  }

  if (lbs >= 2000) {
    const tons = lbs / 2000
    return `${tons.toLocaleString(undefined, { maximumFractionDigits: 1 })} tons CO₂ saved`
  }

  return `${Math.round(lbs).toLocaleString()} lbs CO₂ saved`
}

function fitTopDownCamera(camera, bounds, margin = 1.22) {
  const width = bounds.xMax - bounds.xMin
  const depth = bounds.zMax - bounds.zMin
  const span = Math.max(width, depth) * margin
  const fovRad = (camera.fov * Math.PI) / 180
  const height = (span / 2) / Math.tan(fovRad / 2)

  camera.position.set(0, height, 0)
  camera.up.set(0, 0, -1)
  camera.lookAt(0, 0, 0)
  camera.updateProjectionMatrix()
}

/**
 * CO2 scene — center triptych panel.
 * Building map driven by DataTest.csv via mapCo2YearData().
 */
export function createCo2Scene(initialYear) {
  const scene = new THREE.Scene()
  const camera = createCamera()

  const renderer = createRenderer()
  const state = {
    year: initialYear,
    data: { buildings: [] },
    clock: new THREE.Clock(),
    ready: false,
    mapBounds: null,
  }

  addLights(scene, 0xe8f2ff)
  const rim = new THREE.DirectionalLight(0x006aff, 0.4)
  rim.position.set(-2, 4, 3)
  scene.add(rim)

  const mapGroup = new THREE.Group()
  mapGroup.scale.x = -1
  scene.add(mapGroup)

  const buildingEntries = new Map()
  const buildingObjects = []
  let domElement = null
  let labelEl = null
  let hoveredId = null

  const updateHoverLabel = () => {
    if (!labelEl || !hoveredId) return

    const entry = buildingEntries.get(hoveredId)
    const stats = (state.data.buildings ?? []).find((building) => building.id === hoveredId)

    labelEl.replaceChildren()

    const nameEl = document.createElement('span')
    nameEl.className = 'co2-building-label__name'
    nameEl.textContent = entry?.name ?? ''
    labelEl.append(nameEl)

    const statEl = document.createElement('span')
    statEl.className = 'co2-building-label__stat'
    statEl.textContent = formatCo2Saved(stats?.cumulativeCo2Lbs ?? 0)
    labelEl.append(statEl)

    labelEl.hidden = false
  }

  const setHoveredBuilding = (id) => {
    if (id === hoveredId) return
    hoveredId = id

    if (!labelEl) {
      if (domElement) {
        domElement.style.cursor = id ? 'pointer' : ''
      }
      return
    }

    if (id) {
      updateHoverLabel()
    } else {
      labelEl.hidden = true
    }

    if (domElement) {
      domElement.style.cursor = id ? 'pointer' : ''
    }
  }

  const applyCameraSetup = async () => {
    const saved = await loadCo2Camera()
    if (saved) {
      applyCo2Camera(camera, saved)
      return
    }

    if (state.mapBounds) {
      fitTopDownCamera(camera, state.mapBounds)
    }
  }

  const applyYear = ({ year, data = {}, progress = yearProgress(year) }) => {
    state.year = year
    state.data = data

    if (!state.ready) {
      return
    }

    const statsById = new Map((data.buildings ?? []).map((building) => [building.id, building]))
    const maxAnnualKwh = Math.max(
      1,
      ...(data.buildings ?? []).filter((b) => b.active).map((b) => b.annualKwh),
    )

    buildingEntries.forEach((entry, id) => {
      const stats = statsById.get(id)
      const active = Boolean(stats?.active)

      entry.sun.group.visible = active
      if (!active) return

      entry.sun.mapCo2ToParticles(stats.cumulativeCo2Lbs)
      entry.sun.setAnnualIntensity(stats.annualKwh, maxAnnualKwh)

      const scaleBoost = 0.85 + Math.min(stats.annualKwh / maxAnnualKwh, 1) * 0.25
      entry.sun.setScale(BUILDING_SCALE * scaleBoost)
    })

    mapGroup.rotation.y = MAP_BASE_ROTATION + progress * 0.015 - 0.0075

    if (hoveredId) {
      const hoveredStats = statsById.get(hoveredId)
      if (!hoveredStats?.active) {
        setHoveredBuilding(null)
      } else {
        updateHoverLabel()
      }
    }
  }

  const initBuildings = async () => {
    try {
      const { buildings, bounds } = await loadBuildingPositions()
      state.mapBounds = bounds

      buildings.forEach((position) => {
        const sun = createSunBuilding({
          scale: BUILDING_SCALE,
          maxParticles: 80,
          coreColor: CO2_CORE,
          emissiveColor: CO2_EMISSIVE,
          particleColor: CO2_PARTICLE,
          orbitColor: CO2_ORBIT,
          particleSize: CO2_PARTICLE_SIZE,
          ringFaceCamera: true,
        })

        sun.group.position.set(position.x, 0, position.z)
        sun.group.visible = false
        mapGroup.add(sun.group)

        for (const mesh of [sun.core, sun.corona, sun.orbit]) {
          mesh.userData.co2BuildingId = position.id
        }

        const pickTarget = new THREE.Mesh(
          new THREE.SphereGeometry(1.15, 10, 10),
          new THREE.MeshBasicMaterial({ visible: false, depthWrite: false }),
        )
        pickTarget.userData.co2BuildingId = position.id
        sun.group.add(pickTarget)

        buildingEntries.set(position.id, {
          id: position.id,
          name: position.name,
          sun,
          pickTarget,
        })
        buildingObjects.push(...sun.disposeTargets, pickTarget)
      })

      state.ready = true
      applyYear({ year: state.year, data: state.data, progress: yearProgress(state.year) })
    } catch (error) {
      console.warn('[co2Scene] Failed to load building positions', error)
    }

    try {
      await applyCameraSetup()
    } catch (error) {
      console.warn('[co2Scene] Failed to apply camera', error)
    }
  }

  initBuildings()

  const pointer = new THREE.Vector2()
  const raycaster = new THREE.Raycaster()

  const getPickables = () => {
    const meshes = []
    buildingEntries.forEach((entry) => {
      if (!entry.sun.group.visible || !entry.pickTarget) return
      meshes.push(entry.pickTarget)
    })
    return meshes
  }

  const onPointerMove = (event) => {
    if (!domElement) return

    const rect = domElement.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return

    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(getPickables(), false)
    const hitId = hits[0]?.object?.userData?.co2BuildingId ?? null
    setHoveredBuilding(hitId)
  }

  const onPointerLeave = () => {
    setHoveredBuilding(null)
  }

  const setupInteraction = (element) => {
    domElement = element
    const panel = element.parentElement
    if (panel) {
      labelEl = document.createElement('div')
      labelEl.className = 'co2-building-label'
      labelEl.hidden = true
      panel.appendChild(labelEl)
    }

    element.addEventListener('pointermove', onPointerMove)
    element.addEventListener('pointerleave', onPointerLeave)
  }

  const disposeInteraction = () => {
    if (domElement) {
      domElement.removeEventListener('pointermove', onPointerMove)
      domElement.removeEventListener('pointerleave', onPointerLeave)
      domElement.style.cursor = ''
      domElement = null
    }

    labelEl?.remove()
    labelEl = null
    hoveredId = null
  }

  const animate = () => {
    const t = state.clock.getElapsedTime()
    const speed = 1 + yearProgress(state.year) * 0.5

    buildingEntries.forEach((entry) => {
      if (!entry.sun.group.visible) return
      entry.sun.animate(t, speed)
    })
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
