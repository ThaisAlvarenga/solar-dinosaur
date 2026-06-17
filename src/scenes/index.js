import * as THREE from 'three'
import { yearProgress } from '../constants/timeline'

/**
 * Three.js scene factories for solar-dinosaur.
 *
 * HOW THE TIMELINE CONNECTS TO SCENES
 * ---------------------------------
 * - App.jsx holds the selected `year` and passes it to each triptych ThreePanel.
 * - ThreePanel (src/components/ThreePanel.jsx) calls `applyYear(year)` whenever
 *   that prop changes — you do not wire the timeline inside this file.
 * - `yearProgress(year)` returns 0 at 2021 and 1 at 2026 (see constants/timeline.js).
 *
 * WHERE TO WORK IN EACH SCENE FACTORY
 * ---------------------------------
 * 1. DATA VISUALIZATION — build meshes, materials, groups, and lights (static setup).
 * 2. TIMELINE (applyYear) — map the selected year / progress to visual changes.
 * 3. ANIMATION (animate) — per-frame motion; read state.year if motion should follow the year.
 *
 * Register new scenes in `sceneFactories` at the bottom of this file.
 */

function createRenderer() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  return renderer
}

function createCamera() {
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100)
  camera.position.set(0, 0.5, 5)
  return camera
}

function addLights(scene, color = 0xffffff) {
  scene.add(new THREE.AmbientLight(color, 0.45))
  const key = new THREE.DirectionalLight(color, 1.1)
  key.position.set(3, 4, 5)
  scene.add(key)
}

function lerpColor(colorA, colorB, alpha) {
  return new THREE.Color(colorA).lerp(new THREE.Color(colorB), alpha)
}

export function createEnergyScene(initialYear) {
  const scene = new THREE.Scene()
  const camera = createCamera()
  const renderer = createRenderer()
  const state = { year: initialYear }

  addLights(scene, 0xfff4e0)

  // ── DATA VISUALIZATION (energy / left triptych panel) ──────────────────────
  // Build the energy scene here: geometries, materials, groups, helpers, etc.
  // Wired in App.jsx as: <ThreePanel variant="energy" year={year} />

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

  // ── TIMELINE (energy) ──────────────────────────────────────────────────────
  // Called when the user clicks a year. `progress` is 0 (2021) → 1 (2026).
  // Update materials, scales, positions, visibility, or data-driven values here.
  const applyYear = (year) => {
    state.year = year
    const progress = yearProgress(year)

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

  // ── ANIMATION (energy) ─────────────────────────────────────────────────────
  // Per-frame updates. Use state.year / yearProgress(state.year) for year-linked motion.
  const animate = () => {
    const speed = 1 + yearProgress(state.year) * 0.75

    energyCore.rotation.y += 0.008 * speed
    energyCore.rotation.x += 0.004 * speed
    energyCorona.rotation.y -= 0.003 * speed
    energyOrbit.rotation.z += 0.006 * speed
  }

  applyYear(initialYear)

  return {
    scene,
    camera,
    renderer,
    animate,
    applyYear,
    objects: [energyCore, energyCorona, energyOrbit],
  }
}

export function createCo2Scene(initialYear) {
  const scene = new THREE.Scene()
  const camera = createCamera()
  camera.position.set(0, 0.2, 4.5)
  const renderer = createRenderer()
  const state = { year: initialYear }

  addLights(scene, 0xf0e8ff)

  // ── DATA VISUALIZATION (CO2 / center triptych panel) ───────────────────────
  // Build the CO2 scene here: geometries, materials, groups, helpers, etc.
  // Wired in App.jsx as: <ThreePanel variant="co2" year={year} />

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

  // ── TIMELINE (CO2) ─────────────────────────────────────────────────────────
  // Called when the user clicks a year. `progress` is 0 (2021) → 1 (2026).
  // Update materials, scales, positions, visibility, or data-driven values here.
  const applyYear = (year) => {
    state.year = year
    const progress = yearProgress(year)

    const knotScale = 0.7 + progress * 0.45
    co2Knot.scale.setScalar(knotScale)

    co2KnotMaterial.color.copy(lerpColor(0x9b6bff, 0xff4d2e, progress))
    co2KnotMaterial.emissive.copy(lerpColor(0x4a1f99, 0x991a00, progress))
    co2KnotMaterial.emissiveIntensity = 0.25 + progress * 0.45

    const ringScale = 1.35 + progress * 0.45
    co2Ring.scale.set(ringScale / 1.55, ringScale / 1.55, 1)
    co2RingMaterial.color.copy(lerpColor(0xc084fc, 0xff7a59, progress))
  }

  // ── ANIMATION (CO2) ────────────────────────────────────────────────────────
  // Per-frame updates. Use state.year / yearProgress(state.year) for year-linked motion.
  const animate = () => {
    const speed = 1 + yearProgress(state.year) * 1.1

    co2Knot.rotation.x += 0.007 * speed
    co2Knot.rotation.y += 0.01 * speed
    co2Ring.rotation.z -= 0.005 * speed
  }

  applyYear(initialYear)

  return { scene, camera, renderer, animate, applyYear, objects: [co2Knot, co2Ring] }
}

function createSaving() {
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

export function createSavingScene(initialYear) {
  const scene = new THREE.Scene()
  const camera = createCamera()
  camera.position.set(0, 0.4, 5.5)
  const renderer = createRenderer()
  const state = { year: initialYear }

  addLights(scene, 0xe8fff0)

  // ── DATA VISUALIZATION (saving / right triptych panel) ───────────────────────
  // Build the saving scene here: geometries, materials, groups, helpers, etc.
  // Wired in App.jsx as: <ThreePanel variant="saving" year={year} />
  // createSaving() below is a helper for the figure mesh — extend or replace as needed.

  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x1f2937,
    roughness: 0.9,
  })

  const ground = new THREE.Mesh(new THREE.CircleGeometry(2.5, 48), groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.55
  scene.add(ground)

  const { saving, material, accent } = createSaving()
  scene.add(saving)

  // ── TIMELINE (saving) ──────────────────────────────────────────────────────
  // Called when the user clicks a year. `progress` is 0 (2021) → 1 (2026).
  // Update materials, scales, positions, visibility, or data-driven values here.
  const applyYear = (year) => {
    state.year = year
    const progress = yearProgress(year)

    const figureScale = 0.72 + progress * 0.38
    saving.scale.setScalar(figureScale)

    material.color.copy(lerpColor(0x6b9080, 0x4ade80, progress))
    accent.color.copy(lerpColor(0x1a3d2a, 0x166534, progress))
    groundMaterial.color.copy(lerpColor(0x1f2937, 0x2f5a40, progress))
  }

  // ── ANIMATION (saving) ─────────────────────────────────────────────────────
  // Per-frame updates. Use state.year / yearProgress(state.year) for year-linked motion.
  const animate = () => {
    const bob = 0.03 + yearProgress(state.year) * 0.02

    saving.rotation.y += 0.008
    saving.position.y = Math.sin(Date.now() * 0.002) * bob
  }

  applyYear(initialYear)

  return { scene, camera, renderer, animate, applyYear, objects: [ground, saving] }
}

export function createFutureScene() {
  const scene = new THREE.Scene()
  const camera = createCamera()
  camera.position.set(0, 0.3, 6)
  const renderer = createRenderer()

  addLights(scene, 0xe8f4ff)

  // ── DATA VISUALIZATION (future / full-width Look Ahead view) ─────────────────
  // Build the future scene here. This panel does NOT receive a timeline year.
  // Wired in App.jsx as: <ThreePanel variant="future" /> (no year prop).
  // applyYear below is a no-op — add timeline logic only if you change that wiring.

  const horizonMaterial = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.45,
    roughness: 0.2,
    metalness: 0.55,
    transparent: true,
    opacity: 0.85,
  })

  const futureCore = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 2), horizonMaterial)
  scene.add(futureCore)

  const futureWire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.45, 1),
    new THREE.MeshBasicMaterial({
      color: 0xc084fc,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    }),
  )
  scene.add(futureWire)

  const orbitGroup = new THREE.Group()
  const orbitMeshes = []
  for (let i = 0; i < 8; i++) {
    const node = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 16, 16),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x67e8f9,
        emissiveIntensity: 0.8,
      }),
    )
    const angle = (i / 8) * Math.PI * 2
    node.position.set(Math.cos(angle) * 2.1, Math.sin(angle) * 0.35, Math.sin(angle) * 2.1)
    orbitGroup.add(node)
    orbitMeshes.push(node)
  }
  scene.add(orbitGroup)

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.15, 0.02, 8, 96),
    new THREE.MeshStandardMaterial({
      color: 0xa78bfa,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.35,
      metalness: 0.7,
      roughness: 0.15,
    }),
  )
  ring.rotation.x = Math.PI / 2.2
  scene.add(ring)

  // ── TIMELINE (future) ────────────────────────────────────────────────────────
  // Intentionally empty — Future scene is not driven by the 2021–2026 timeline.
  const applyYear = () => {}

  // ── ANIMATION (future) ───────────────────────────────────────────────────────
  const animate = () => {
    const t = Date.now() * 0.001

    futureCore.rotation.y += 0.006
    futureCore.rotation.x = Math.sin(t * 0.5) * 0.12
    futureWire.rotation.y -= 0.004
    futureWire.rotation.z += 0.003
    orbitGroup.rotation.y += 0.009
    ring.rotation.z -= 0.005
  }

  return {
    scene,
    camera,
    renderer,
    animate,
    applyYear,
    objects: [futureCore, futureWire, orbitGroup, ring, ...orbitMeshes],
  }
}

// Scene registry — keys must match the `variant` prop passed to ThreePanel in App.jsx.
export const sceneFactories = {
  energy: createEnergyScene,
  co2: createCo2Scene,
  saving: createSavingScene,
  future: createFutureScene,
}
