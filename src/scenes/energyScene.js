import * as THREE from 'three'
import { yearProgress } from '../constants/timeline'
import { loadBuildingPositions } from '../data/mapLayout'
import { applyCo2Camera, loadCo2Camera } from './co2Camera'
import { addLights, createCamera, createRenderer, isBuildingActive } from './shared'
import { createSunBuilding } from './createSunBuilding'

const BUILDING_SCALE = 0.091
/** Rotate map so county spread runs bottom-left → top-right on screen */
const MAP_BASE_ROTATION = (-3 * Math.PI) / 4

const ENERGY_CORE = 0xffb347
const ENERGY_EMISSIVE = 0xff6600
const ENERGY_PARTICLE = 0xffcc66
const ENERGY_ORBIT = 0xffd27f
const ENERGY_PARTICLE_SIZE = 0.045
const KWH_PER_PARTICLE = 2500

function formatEnergyKwh(kwh) {
  if (!kwh || kwh <= 0) {
    return '0 kWh generated'
  }

  if (kwh >= 1_000_000) {
    return `${(kwh / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })} GWh generated`
  }

  if (kwh >= 1000) {
    return `${(kwh / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} MWh generated`
  }

  return `${Math.round(kwh).toLocaleString()} kWh generated`
}

function kWhToParticleCount(kwh, maxParticles = 80) {
  if (kwh <= 0) return 0
  return Math.min(maxParticles, Math.max(4, Math.round(kwh / KWH_PER_PARTICLE)))
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
 * Energy scene — left triptych panel.
 * Building map driven by solar-data.xlsx via mapEnergyYearData().
 */
export function createEnergyScene(initialYear) {
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

  addLights(scene, 0xfff4e0)
  const rim = new THREE.DirectionalLight(0xff9900, 0.35)
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
  let selectedId = null
  let pendingYearPayload = null

  const getFocusedBuildingId = () => selectedId ?? hoveredId

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
    nameEl.className = 'energy-building-label__name'
    nameEl.textContent = entry?.name ?? ''
    labelEl.append(nameEl)

    const yearEl = document.createElement('span')
    yearEl.className = 'energy-building-label__year'
    yearEl.textContent = String(state.year)
    labelEl.append(yearEl)

    const statEl = document.createElement('span')
    statEl.className = 'energy-building-label__stat'
    statEl.textContent = formatEnergyKwh(stats?.annualKwh ?? 0)
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

  const setHoveredBuilding = (id) => {
    if (id === hoveredId) return
    hoveredId = id

    refreshBuildingLabel()

    if (domElement) {
      domElement.style.cursor = id || selectedId ? 'pointer' : ''
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

  const syncFocusAfterYear = (statsById) => {
    const focusedId = getFocusedBuildingId()

    if (!focusedId) {
      hideBuildingLabel()
      return
    }

    const stats = statsById.get(focusedId)
    if (!isBuildingActive(stats)) {
      if (selectedId === focusedId) selectedId = null
      if (hoveredId === focusedId) hoveredId = null
      hideBuildingLabel()
      return
    }

    updateBuildingLabel(stats)
  }

  const commitYear = ({ year, data = {}, progress = yearProgress(year) }) => {
    const statsById = new Map((data.buildings ?? []).map((building) => [building.id, building]))
    const maxAnnualKwh = Math.max(
      1,
      ...(data.buildings ?? []).filter((b) => isBuildingActive(b)).map((b) => b.annualKwh),
    )

    buildingEntries.forEach((entry, id) => {
      const stats = statsById.get(id)
      const active = isBuildingActive(stats)

      entry.sun.group.visible = active
      if (!active) {
        entry.sun.setParticleCount(0)
        return
      }

      entry.sun.setParticleCount(kWhToParticleCount(stats.annualKwh, 80))
      entry.sun.setAnnualIntensity(stats.annualKwh, maxAnnualKwh)

      const scaleBoost = 0.85 + Math.min(stats.annualKwh / maxAnnualKwh, 1) * 0.25
      entry.sun.setScale(BUILDING_SCALE * scaleBoost)
    })

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
        const sun = createSunBuilding({
          scale: BUILDING_SCALE,
          maxParticles: 80,
          coreColor: ENERGY_CORE,
          emissiveColor: ENERGY_EMISSIVE,
          particleColor: ENERGY_PARTICLE,
          orbitColor: ENERGY_ORBIT,
          particleSize: ENERGY_PARTICLE_SIZE,
          ringFaceCamera: true,
        })

        sun.group.position.set(position.x, 0, position.z)
        sun.group.visible = false
        mapGroup.add(sun.group)

        for (const mesh of [sun.core, sun.corona, sun.orbit]) {
          mesh.userData.energyBuildingId = position.id
        }

        const pickTarget = new THREE.Mesh(
          new THREE.SphereGeometry(1.15, 10, 10),
          new THREE.MeshBasicMaterial({ visible: false, depthWrite: false }),
        )
        pickTarget.userData.energyBuildingId = position.id
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
      commitYear(
        pendingYearPayload ?? {
          year: state.year,
          data: state.data,
          progress: yearProgress(state.year),
        },
      )
    } catch (error) {
      console.warn('[energyScene] Failed to load building positions', error)
    }

    try {
      await applyCameraSetup()
    } catch (error) {
      console.warn('[energyScene] Failed to apply camera', error)
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

  const pickBuildingAt = (event) => {
    if (!domElement) return null

    const rect = domElement.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return null

    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(getPickables(), false)
    return hits[0]?.object?.userData?.energyBuildingId ?? null
  }

  const onPointerMove = (event) => {
    setHoveredBuilding(pickBuildingAt(event))
  }

  const onPointerLeave = () => {
    hoveredId = null
    refreshBuildingLabel()
    if (domElement) {
      domElement.style.cursor = selectedId ? 'pointer' : ''
    }
  }

  const onPointerClick = (event) => {
    const hitId = pickBuildingAt(event)
    if (hitId) {
      selectedId = selectedId === hitId ? null : hitId
      refreshBuildingLabel()
      if (domElement) {
        domElement.style.cursor = 'pointer'
      }
      return
    }

    if (!selectedId) return
    selectedId = null
    refreshBuildingLabel()
    if (domElement) {
      domElement.style.cursor = hoveredId ? 'pointer' : ''
    }
  }

  const setupInteraction = (element) => {
    domElement = element
    const panel = element.parentElement
    if (panel) {
      labelEl = document.createElement('div')
      labelEl.className = 'energy-building-label'
      labelEl.hidden = true
      panel.appendChild(labelEl)
    }

    element.addEventListener('pointermove', onPointerMove)
    element.addEventListener('pointerleave', onPointerLeave)
    element.addEventListener('click', onPointerClick)
  }

  const disposeInteraction = () => {
    if (domElement) {
      domElement.removeEventListener('pointermove', onPointerMove)
      domElement.removeEventListener('pointerleave', onPointerLeave)
      domElement.removeEventListener('click', onPointerClick)
      domElement.style.cursor = ''
      domElement = null
    }

    labelEl?.remove()
    labelEl = null
    hoveredId = null
    selectedId = null
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
