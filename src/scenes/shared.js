import * as THREE from 'three'

export function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  return renderer
}

export function createCamera() {
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
  camera.position.set(0, 0.5, 5)
  return camera
}

export function fitTopDownCamera(camera, bounds, margin = 1.22) {
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

export function addLights(scene, color = 0xffffff) {
  scene.add(new THREE.AmbientLight(color, 0.45))
  const key = new THREE.DirectionalLight(color, 1.1)
  key.position.set(3, 4, 5)
  scene.add(key)
}

export function lerpColor(colorA, colorB, alpha) {
  return new THREE.Color(colorA).lerp(new THREE.Color(colorB), alpha)
}

/** Whether a building has solar data for the selected timeline year. */
export function isBuildingActive(stats) {
  return Boolean(stats?.active)
}

/**
 * Min/max of a numeric metric across active buildings.
 * @param {Array<{ active?: boolean }>} buildings
 * @param {(building: object) => number} getValue
 */
export function activeMetricRange(buildings, getValue) {
  const values = (buildings ?? [])
    .filter(isBuildingActive)
    .map(getValue)
    .filter((value) => Number.isFinite(value) && value > 0)

  if (values.length === 0) {
    return { min: 0, max: 1 }
  }

  return { min: Math.min(...values), max: Math.max(...values) }
}

/**
 * Scale a building from its data metric. The smallest producer uses baseScale;
 * the largest uses maxScale.
 */
export function scaleBuildingByMetric(value, minValue, maxValue, baseScale, maxScale = 0.5) {
  if (!Number.isFinite(value) || value <= 0) {
    return baseScale
  }

  if (maxValue <= minValue) {
    return baseScale
  }

  const t = Math.min(1, Math.max(0, (value - minValue) / (maxValue - minValue)))
  return baseScale + t * (maxScale - baseScale)
}

/**
 * @typedef {object} YearUpdate
 * @property {number} year
 * @property {Record<string, unknown>} data - Mapped CSV values from mapYearData.js
 * @property {number} progress - 0 (first timeline year) → 1 (last timeline year)
 */
