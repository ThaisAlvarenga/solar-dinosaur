import * as THREE from 'three'
import { yearProgress } from '../constants/timeline'
import { addLights, createCamera, createRenderer, lerpColor } from './shared'

/**
 * CO2 scene — center triptych panel.
 * Wired in App.jsx as: <ThreePanel variant="co2" year={year} />
 *
 * CSV file: public/data/co2.csv
 * Data mapping: src/data/mapYearData.js → mapCo2YearData()
 */
export function createCo2Scene(initialYear) {
  const scene = new THREE.Scene()
  const camera = createCamera()
  camera.position.set(0, 0.2, 4.5)
  const renderer = createRenderer()
  const state = { year: initialYear, data: {} }

  addLights(scene, 0xf0e8ff)

  // PLEASE WORK HERE FOR CO2 — build your Three.js visualization (meshes, materials, groups).
  const co2KnotMaterial = new THREE.MeshStandardMaterial({
    color: 0xaa3bff,
    emissive: 0x5b1f99,
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.45,
  })

  const co2Knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.75, 0.22, 128, 16),
    co2KnotMaterial,
  )
  scene.add(co2Knot)

  const co2RingMaterial = new THREE.MeshStandardMaterial({
    color: 0xc084fc,
    emissive: 0x7c3aed,
    emissiveIntensity: 0.2,
    metalness: 0.6,
    roughness: 0.2,
  })

  const co2Ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.55, 0.025, 12, 96),
    co2RingMaterial,
  )
  co2Ring.rotation.x = Math.PI / 2
  scene.add(co2Ring)

  // PLEASE WORK HERE FOR CO2 — apply CSV data when the timeline year changes.
  const applyYear = ({ year, data = {}, progress = yearProgress(year) }) => {
    state.year = year
    state.data = data

    const knotScale = 0.7 + progress * 0.45
    co2Knot.scale.setScalar(knotScale)

    co2KnotMaterial.color.copy(lerpColor(0x9b6bff, 0xff4d2e, progress))
    co2KnotMaterial.emissive.copy(lerpColor(0x4a1f99, 0x991a00, progress))
    co2KnotMaterial.emissiveIntensity = 0.25 + progress * 0.45

    const ringScale = 1.35 + progress * 0.45
    co2Ring.scale.set(ringScale / 1.55, ringScale / 1.55, 1)
    co2RingMaterial.color.copy(lerpColor(0xc084fc, 0xff7a59, progress))
  }

  // PLEASE WORK HERE FOR CO2 — per-frame animation.
  const animate = () => {
    const speed = 1 + yearProgress(state.year) * 1.1

    co2Knot.rotation.x += 0.007 * speed
    co2Knot.rotation.y += 0.01 * speed
    co2Ring.rotation.z -= 0.005 * speed
  }

  applyYear({ year: initialYear, data: {}, progress: yearProgress(initialYear) })

  return { scene, camera, renderer, animate, applyYear, objects: [co2Knot, co2Ring] }
}