import * as THREE from 'three'
import { yearProgress } from '../constants/timeline'
import { addLights, createCamera, createRenderer } from './shared'

/**
 * Energy scene — left triptych panel.
 * Wired in App.jsx as: <ThreePanel variant="energy" year={year} />
 *
 * CSV file: public/data/energy.csv
 * Data mapping: src/data/mapYearData.js → mapEnergyYearData()
 */
export function createEnergyScene(initialYear) {
  const scene = new THREE.Scene()
  const camera = createCamera()
  const renderer = createRenderer()
  const state = { year: initialYear, data: {} }

  addLights(scene, 0xfff4e0)

  // PLEASE WORK HERE FOR ENERGY — build your Three.js visualization (meshes, materials, groups).
  const energyCoreMaterial = new THREE.MeshStandardMaterial({
    color: 0xffb347,
    emissive: 0xff6600,
    emissiveIntensity: 0.55,
    roughness: 0.35,
    metalness: 0.1,
  })

  const energyCore = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 1), energyCoreMaterial)
  scene.add(energyCore)

  const energyCoronaMaterial = new THREE.MeshBasicMaterial({
    color: 0xffaa33,
    transparent: true,
    opacity: 0.12,
  })

  const energyCorona = new THREE.Mesh(new THREE.SphereGeometry(1.45, 32, 32), energyCoronaMaterial)
  scene.add(energyCorona)

  const energyOrbitMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd27f,
    emissive: 0xff9900,
    emissiveIntensity: 0.25,
  })

  const energyOrbit = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.03, 8, 64), energyOrbitMaterial)
  energyOrbit.rotation.x = Math.PI / 2.5
  scene.add(energyOrbit)

  // PLEASE WORK HERE FOR ENERGY — apply CSV data when the timeline year changes.
  // `data` is loaded from CSV via ThreePanel; `progress` is 0 (2021) → 1 (2026).
  // Demo below uses `progress` like the original scene — swap in `data` fields when ready.
  const applyYear = ({ year, data = {}, progress = yearProgress(year) }) => {
    state.year = year
    state.data = data

    const energyCoreScale = 0.82 + progress * 0.38
    energyCore.scale.setScalar(energyCoreScale)
    energyCoreMaterial.emissiveIntensity = 0.3 + progress * 0.55
    energyCoreMaterial.color.lerpColors(
      new THREE.Color(0xffa040),
      new THREE.Color(0xffdd55),
      progress,
    )

    energyCoronaMaterial.opacity = 0.06 + progress * 0.16
    const energyCoronaScale = 1.35 + progress * 0.35
    energyCorona.scale.setScalar(energyCoronaScale / 1.45)

    const energyOrbitScale = 1.55 + progress * 0.55
    energyOrbit.scale.set(energyOrbitScale / 1.8, energyOrbitScale / 1.8, 1)
    energyOrbitMaterial.emissiveIntensity = 0.15 + progress * 0.35
  }

  // PLEASE WORK HERE FOR ENERGY — per-frame animation (optional; can read state.data / state.year).
  const animate = () => {
    const speed = 1 + yearProgress(state.year) * 0.75

    energyCore.rotation.y += 0.008 * speed
    energyCore.rotation.x += 0.004 * speed
    energyCorona.rotation.y -= 0.003 * speed
    energyOrbit.rotation.z += 0.006 * speed
  }

  applyYear({ year: initialYear, data: {}, progress: yearProgress(initialYear) })

  return {
    scene,
    camera,
    renderer,
    animate,
    applyYear,
    objects: [energyCore, energyCorona, energyOrbit],
  }
}
