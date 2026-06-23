// import * as THREE from 'three'
// import { yearProgress } from '../constants/timeline'
// import { addLights, createCamera, createRenderer } from './shared'

// /**
//  * Energy scene — left triptych panel.
//  * Wired in App.jsx as: <ThreePanel variant="energy" year={year} />
//  *
//  * CSV file: public/data/energy.csv
//  * Data mapping: src/data/mapYearData.js → mapEnergyYearData()
//  */
// export function createEnergyScene(initialYear) {
//   const scene = new THREE.Scene()
//   const camera = createCamera()
//   const renderer = createRenderer()
//   const state = { year: initialYear, data: {} }

//   addLights(scene, 0xfff4e0)

//   // PLEASE WORK HERE FOR ENERGY — build your Three.js visualization (meshes, materials, groups).
//   const energyCoreMaterial = new THREE.MeshStandardMaterial({
//     color: 0xffb347,
//     emissive: 0xff6600,
//     emissiveIntensity: 0.55,
//     roughness: 0.35,
//     metalness: 0.1,
//   })

//   const energyCore = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 1), energyCoreMaterial)
//   scene.add(energyCore)

//   const energyCoronaMaterial = new THREE.MeshBasicMaterial({
//     color: 0xffaa33,
//     transparent: true,
//     opacity: 0.12,
//   })

//   const energyCorona = new THREE.Mesh(new THREE.SphereGeometry(1.45, 32, 32), energyCoronaMaterial)
//   scene.add(energyCorona)

//   const energyOrbitMaterial = new THREE.MeshStandardMaterial({
//     color: 0xffd27f,
//     emissive: 0xff9900,
//     emissiveIntensity: 0.25,
//   })

//   const energyOrbit = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.03, 8, 64), energyOrbitMaterial)
//   energyOrbit.rotation.x = Math.PI / 2.5
//   scene.add(energyOrbit)

//   // PLEASE WORK HERE FOR ENERGY — apply CSV data when the timeline year changes.
//   // `data` is loaded from CSV via ThreePanel; `progress` is 0 (2021) → 1 (2026).
//   // Demo below uses `progress` like the original scene — swap in `data` fields when ready.
//   const applyYear = ({ year, data = {}, progress = yearProgress(year) }) => {
//     state.year = year
//     state.data = data

//     const energyCoreScale = 0.82 + progress * 0.38
//     energyCore.scale.setScalar(energyCoreScale)
//     energyCoreMaterial.emissiveIntensity = 0.3 + progress * 0.55
//     energyCoreMaterial.color.lerpColors(
//       new THREE.Color(0xffa040),
//       new THREE.Color(0xffdd55),
//       progress,
//     )

//     energyCoronaMaterial.opacity = 0.06 + progress * 0.16
//     const energyCoronaScale = 1.35 + progress * 0.35
//     energyCorona.scale.setScalar(energyCoronaScale / 1.45)

//     const energyOrbitScale = 1.55 + progress * 0.55
//     energyOrbit.scale.set(energyOrbitScale / 1.8, energyOrbitScale / 1.8, 1)
//     energyOrbitMaterial.emissiveIntensity = 0.15 + progress * 0.35
//   }

//   // PLEASE WORK HERE FOR ENERGY — per-frame animation (optional; can read state.data / state.year).
//   const animate = () => {
//     const speed = 1 + yearProgress(state.year) * 0.75

//     energyCore.rotation.y += 0.008 * speed
//     energyCore.rotation.x += 0.004 * speed
//     energyCorona.rotation.y -= 0.003 * speed
//     energyOrbit.rotation.z += 0.006 * speed
//   }

//   applyYear({ year: initialYear, data: {}, progress: yearProgress(initialYear) })

//   return { scene, camera, renderer, animate, applyYear, objects: [energyCore, energyCorona, energyOrbit] }

//   // return {
//   //   scene,
//   //   camera,
//   //   renderer,
//   //   animate,
//   //   applyYear,
//   //   objects: [energyCore, energyCorona, energyOrbit],
//   // }
// }

//** DK VERSION */ 
//**FYI I USED CLAUDE FOR THIS. This is exploration, I am still trying to get a hold of this. ALSO YOUR DOCUMENTATION IS FABULOUS */
import * as THREE from 'three'
import { yearProgress } from '../constants/timeline'
import { addLights, createCamera, createRenderer } from './shared'

export function createEnergyScene(initialYear) {
  const scene = new THREE.Scene()
  const camera = createCamera()
  const renderer = createRenderer()
  const state = { year: initialYear, data: {}, clock: new THREE.Clock() }

  addLights(scene, 0xfff4e0)

  // --- Core icosahedron ---
  const energyCoreMaterial = new THREE.MeshStandardMaterial({
    color: 0xffb347,
    emissive: 0xff6600,
    emissiveIntensity: 0.55,
    roughness: 0.35,
    metalness: 0.1,
  })
  const energyCore = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), energyCoreMaterial)
  scene.add(energyCore)

  // --- Corona sphere ---
  const energyCoronaMaterial = new THREE.MeshBasicMaterial({
    color: 0xffaa33,
    transparent: true,
    opacity: 0.12,
  })
  const energyCorona = new THREE.Mesh(new THREE.SphereGeometry(1.0, 15, 15), energyCoronaMaterial)
  scene.add(energyCorona)

  // --- Pulsating ring ---
  const energyOrbitMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd27f,
    emissive: 0xff9900,
    emissiveIntensity: 0.25,
    transparent: true,   // needed for opacity pulsation
    opacity: 1.0,
  })
  const energyOrbit = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.03, 8, 64), energyOrbitMaterial)
  //energyOrbit.rotation.y = Math.PI / 2.5
  energyOrbit.rotation.z = Math.PI / 2.5
  scene.add(energyOrbit)

  // Base scale set by applyYear; pulsation is additive on top in animate()
  let orbitBaseScale = 1.0

  // --- Particle system ---
  const MAX_PARTICLES = 300
  const particlePositions = new Float32Array(MAX_PARTICLES * 3)

  // Pre-build all positions in a spherical shell (r = 2.2–3.2)
  for (let i = 0; i < MAX_PARTICLES; i++) {
    const r = 2.2 + Math.random() * 1.0
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    particlePositions[i * 3]     = r * Math.sin(phi) * Math.cos(theta)
    particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    particlePositions[i * 3 + 2] = r * Math.cos(phi)
  }

  const particleGeometry = new THREE.BufferGeometry()
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))
  // Start with 0 visible particles; applyYear will grow this
  particleGeometry.setDrawRange(0, 0)

  const particleMaterial = new THREE.PointsMaterial({
    color: 0xffcc66,
    size: 0.06,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
  })

  const particles = new THREE.Points(particleGeometry, particleMaterial)
  scene.add(particles)

  // --- applyYear ---
  const applyYear = ({ year, data = {}, progress = yearProgress(year) }) => {
    state.year = year
    state.data = data

    // Core
    const energyCoreScale = 0.82 + progress * 0.38
    energyCore.scale.setScalar(energyCoreScale)
    energyCoreMaterial.emissiveIntensity = 0.3 + progress * 0.55
    energyCoreMaterial.color.lerpColors(
      new THREE.Color(0xffa040),
      new THREE.Color(0xffdd55),
      progress,
    )

    // Corona
    energyCoronaMaterial.opacity = 0.06 + progress * 0.16
    const energyCoronaScale = 1.35 + progress * 0.35
    energyCorona.scale.setScalar(energyCoronaScale / 1.45)

    // Ring — store base scale; animate() adds pulsation on top
    orbitBaseScale = (1.55 + progress * 0.55) / 1.8
    energyOrbitMaterial.emissiveIntensity = 0.15 + progress * 0.35

    // Particles — grow count with progress (data-driven quantity)
    const visibleCount = Math.floor(progress * MAX_PARTICLES)
    particleGeometry.setDrawRange(0, visibleCount)
  }

  // --- animate (per-frame) ---
  const animate = () => {
    const t = state.clock.getElapsedTime()
    const speed = 1 + yearProgress(state.year) * 0.75

    // Core rotation
    energyCore.rotation.y += 0.008 * speed
    energyCore.rotation.x += 0.004 * speed
    energyCorona.rotation.y -= 0.003 * speed

    // Ring: slow axial rotation + pulsation
    energyOrbit.rotation.z += 0.006 * speed

    // Pulsation: sine wave on a ~2 s period
    const pulse = Math.sin(t * Math.PI)          // 0 → 1 → 0, period = 2 s
    const pulseScale = orbitBaseScale + pulse * 0.18
    energyOrbit.scale.set(pulseScale, pulseScale, 1)
    // Opacity: full at rest, fades as ring expands
    energyOrbitMaterial.opacity = 1.0 - pulse * 0.85

    // Particles: slow drift rotation
    particles.rotation.y += 0.001 * speed
    particles.rotation.x += 0.0005 * speed
  }

  applyYear({ year: initialYear, data: {}, progress: yearProgress(initialYear) })

  return {
    scene,
    camera,
    renderer,
    animate,
    applyYear,
    objects: [energyCore, energyCorona, energyOrbit, particles],
  }
}