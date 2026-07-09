import * as THREE from 'three'
import { yearProgress } from '../constants/timeline'
import { loadBuildingPositions } from '../data/mapLayout'
import { applyCo2Camera, loadCo2Camera } from './co2Camera'
import { getGlobalElapsedTime } from './sceneAnimation'
import { addLights, createCamera, createRenderer, fitTopDownCamera, isBuildingActive, scaleBuildingByMetric, commitSceneBuildings } from './shared'
import { Building, updateBuildingThemeMatcap } from '../components/building/index.js'

const BUILDING_SCALE = 0.18
/** Rotate map so county spread runs bottom-left → top-right on screen */
const MAP_BASE_ROTATION = (-3 * Math.PI) / 4

function formatEnergyKwh(kwh) {
  if (!kwh || kwh <= 0) {
    return '0 kWh'
  }

  if (kwh >= 1_000_000) {
    return `${(kwh / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 2 })} GWh`
  }

  if (kwh >= 1000) {
    return `${(kwh / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} MWh`
  }

  return `${Math.round(kwh).toLocaleString()} kWh`
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
    ready: false,
    mapBounds: null,
  }

  addLights(scene, 0xfff4e0)
  const rim = new THREE.DirectionalLight(0xff9900, 0.35)
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
  let hoveredId = null
  let selectedId = null
  let pendingYearPayload = null
  let activeBuildingIds = new Set()

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

    // const yearEl = document.createElement('span')
    // yearEl.className = 'energy-building-label__year'
    // yearEl.textContent = String(state.year)
    // labelEl.append(yearEl)

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
      if (hoveredId === focusedId) hoveredId = null
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
        getMetricValue: (building) => building.annualKwh,
        getScale: (stats, min, max) =>
          scaleBuildingByMetric(stats.annualKwh, min, max, BUILDING_SCALE),
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
          theme: 'energy',
          position: { x: position.x, y: 0, z: position.z },
          scale: BUILDING_SCALE,
        })

        building.group.visible = false
        mapGroup.add(building.group)

        for (const mesh of [building.sphere, building.ring1, building.ring2]) {
          mesh.userData.energyBuildingId = position.id
        }

        const pickTarget = new THREE.Mesh(
          new THREE.SphereGeometry(1.15, 10, 10),
          new THREE.MeshBasicMaterial({ visible: false, depthWrite: false }),
        )
        pickTarget.userData.energyBuildingId = position.id
        building.group.add(pickTarget)

        buildingEntries.set(position.id, {
          id: position.id,
          name: position.name,
          building,
          pickTarget,
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
      console.warn('[energyScene] Failed to load building positions', error)
    }
  }

  initBuildings()

  const pointer = new THREE.Vector2()
  const raycaster = new THREE.Raycaster()

  const getPickables = () => {
    const meshes = []
    buildingEntries.forEach((entry) => {
      if (!entry.building.group.visible || !entry.pickTarget) return
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
    const speed = 1 + yearProgress(state.year) * 0.5
    const animationTime = getGlobalElapsedTime() * speed
    const transitionTime = getGlobalElapsedTime()

    let visibleCount = 0

    buildingEntries.forEach((entry) => {
      if (!entry.building.shouldRender()) return
      visibleCount++
      entry.building.update(animationTime, transitionTime)
    })

    if (visibleCount > 0) {
      updateBuildingThemeMatcap('energy', animationTime, 1.5 * speed)
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
