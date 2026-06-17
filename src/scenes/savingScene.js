import * as THREE from 'three'
import { yearProgress } from '../constants/timeline'
import { addLights, createCamera, createRenderer, lerpColor } from './shared'

function createSavingFigure() {
  const saving = new THREE.Group()
  const material = new THREE.MeshStandardMaterial({
    color: 0x4ade80,
    roughness: 0.55,
    metalness: 0.05,
  })
  const accent = new THREE.MeshStandardMaterial({
    color: 0x166534,
    roughness: 0.6,
  })

  const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.7, 0.8), material)
  body.position.y = 0.2
  saving.add(body)

  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.35), material)
  neck.position.set(0.75, 0.55, 0)
  neck.rotation.z = -0.45
  saving.add(neck)

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.4, 0.45), material)
  head.position.set(1.05, 0.85, 0)
  saving.add(head)

  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), accent)
  eye.position.set(1.28, 0.92, 0.14)
  saving.add(eye)

  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 0.3), material)
  tail.position.set(-1.05, 0.35, 0)
  tail.rotation.z = 0.25
  saving.add(tail)

  const legGeometry = new THREE.BoxGeometry(0.22, 0.55, 0.22)
  ;[
    [0.45, -0.25, 0.22],
    [0.45, -0.25, -0.22],
    [-0.45, -0.25, 0.22],
    [-0.45, -0.25, -0.22],
  ].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeometry, accent)
    leg.position.set(x, y, z)
    saving.add(leg)
  })

  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.55), accent)
  spine.position.set(0, 0.62, 0)
  saving.add(spine)

  return { saving, material, accent }
}

/**
 * Saving scene — right triptych panel.
 * Wired in App.jsx as: <ThreePanel variant="saving" year={year} />
 *
 * CSV file: public/data/saving.csv
 * Data mapping: src/data/mapYearData.js → mapSavingYearData()
 */
export function createSavingScene(initialYear) {
  const scene = new THREE.Scene()
  const camera = createCamera()
  camera.position.set(0, 0.4, 5.5)
  const renderer = createRenderer()
  const state = { year: initialYear, data: {} }

  addLights(scene, 0xe8fff0)

  // PLEASE WORK HERE FOR SAVING — build your Three.js visualization (meshes, materials, groups).
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.9,
  })

  const ground = new THREE.Mesh(new THREE.CircleGeometry(2.5, 48), groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.55
  scene.add(ground)

  const { saving, material, accent } = createSavingFigure()
  scene.add(saving)

  // PLEASE WORK HERE FOR SAVING — apply CSV data when the timeline year changes.
  const applyYear = ({ year, data = {}, progress = yearProgress(year) }) => {
    state.year = year
    state.data = data

    const figureScale = 0.72 + progress * 0.38
    saving.scale.setScalar(figureScale)

    material.color.copy(lerpColor(0x6b9080, 0x4ade80, progress))
    accent.color.copy(lerpColor(0x1a3d2a, 0x166534, progress))
    groundMaterial.color.copy(lerpColor(0x1f2937, 0x2f5a40, progress))
  }

  // PLEASE WORK HERE FOR SAVING — per-frame animation.
  const animate = () => {
    const bob = 0.03 + yearProgress(state.year) * 0.02

    saving.rotation.y += 0.008
    saving.position.y = Math.sin(Date.now() * 0.002) * bob
  }

  applyYear({ year: initialYear, data: {}, progress: yearProgress(initialYear) })

  return { scene, camera, renderer, animate, applyYear, objects: [ground, saving] }
}
