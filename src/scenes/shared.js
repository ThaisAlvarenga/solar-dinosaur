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

export function addLights(scene, color = 0xffffff) {
  scene.add(new THREE.AmbientLight(color, 0.45))
  const key = new THREE.DirectionalLight(color, 1.1)
  key.position.set(3, 4, 5)
  scene.add(key)
}

export function lerpColor(colorA, colorB, alpha) {
  return new THREE.Color(colorA).lerp(new THREE.Color(colorB), alpha)
}

/**
 * @typedef {object} YearUpdate
 * @property {number} year
 * @property {Record<string, unknown>} data - Mapped CSV values from mapYearData.js
 * @property {number} progress - 0 (first timeline year) → 1 (last timeline year)
 */
