import * as THREE from 'three'

const CO2_CAMERA_STORAGE_KEY = 'solar-dinosaur.co2-camera'
const CO2_CAMERA_URL = '/data/co2-camera.json'

/**
 * @typedef {{ position: number[], target: number[], up: number[] }} Co2CameraState
 */

/**
 * @returns {Promise<Co2CameraState | null>}
 */
export async function loadCo2Camera() {
  try {
    const response = await fetch(CO2_CAMERA_URL)
    if (response.ok) {
      const data = await response.json()
      if (data?.position && data?.target) {
        return data
      }
    }
  } catch {
    // fall through to localStorage override for local tweaks
  }

  try {
    const raw = localStorage.getItem(CO2_CAMERA_STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (data?.position && data?.target) {
        return data
      }
    }
  } catch {
    return null
  }

  return null
}

/**
 * @param {Co2CameraState} state
 */
export function saveCo2Camera(state) {
  const payload = JSON.stringify(state, null, 2)
  localStorage.setItem(CO2_CAMERA_STORAGE_KEY, payload)
  console.info(
    '[co2Scene] Camera saved to localStorage. Paste into public/data/co2-camera.json to persist in the repo:\n',
    payload,
  )
}

/**
 * @param {import('three').PerspectiveCamera} camera
 * @param {Co2CameraState} state
 */
export function applyCo2Camera(camera, state) {
  const target = new THREE.Vector3().fromArray(state.target)
  camera.position.fromArray(state.position)
  if (state.up?.length === 3) {
    camera.up.fromArray(state.up)
  }
  camera.lookAt(target)
  camera.updateProjectionMatrix()
}

export { CO2_CAMERA_STORAGE_KEY }
