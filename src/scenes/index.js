import * as THREE from 'three'

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

export function createSolarScene() {
  const scene = new THREE.Scene()
  const camera = createCamera()
  const renderer = createRenderer()

  addLights(scene, 0xfff4e0)

  const sun = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.1, 1),
    new THREE.MeshStandardMaterial({
      color: 0xffb347,
      emissive: 0xff6600,
      emissiveIntensity: 0.55,
      roughness: 0.35,
      metalness: 0.1,
    }),
  )
  scene.add(sun)

  const corona = new THREE.Mesh(
    new THREE.SphereGeometry(1.45, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xffaa33,
      transparent: true,
      opacity: 0.12,
    }),
  )
  scene.add(corona)

  const orbit = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.03, 8, 64),
    new THREE.MeshStandardMaterial({
      color: 0xffd27f,
      emissive: 0xff9900,
      emissiveIntensity: 0.25,
    }),
  )
  orbit.rotation.x = Math.PI / 2.5
  scene.add(orbit)

  const animate = () => {
    sun.rotation.y += 0.008
    sun.rotation.x += 0.004
    corona.rotation.y -= 0.003
    orbit.rotation.z += 0.006
  }

  return { scene, camera, renderer, animate, objects: [sun, corona, orbit] }
}

export function createCrystalScene() {
  const scene = new THREE.Scene()
  const camera = createCamera()
  camera.position.set(0, 0.2, 4.5)
  const renderer = createRenderer()

  addLights(scene, 0xf0e8ff)

  const knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(0.75, 0.22, 128, 16),
    new THREE.MeshStandardMaterial({
      color: 0xaa3bff,
      emissive: 0x5b1f99,
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.45,
    }),
  )
  scene.add(knot)

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.55, 0.025, 12, 96),
    new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      emissive: 0x7c3aed,
      emissiveIntensity: 0.2,
      metalness: 0.6,
      roughness: 0.2,
    }),
  )
  ring.rotation.x = Math.PI / 2
  scene.add(ring)

  const animate = () => {
    knot.rotation.x += 0.007
    knot.rotation.y += 0.01
    ring.rotation.z -= 0.005
  }

  return { scene, camera, renderer, animate, objects: [knot, ring] }
}

function createDinosaur() {
  const dino = new THREE.Group()
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
  dino.add(body)

  const neck = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.55, 0.35), material)
  neck.position.set(0.75, 0.55, 0)
  neck.rotation.z = -0.45
  dino.add(neck)

  const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.4, 0.45), material)
  head.position.set(1.05, 0.85, 0)
  dino.add(head)

  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), accent)
  eye.position.set(1.28, 0.92, 0.14)
  dino.add(eye)

  const tail = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 0.3), material)
  tail.position.set(-1.05, 0.35, 0)
  tail.rotation.z = 0.25
  dino.add(tail)

  const legGeometry = new THREE.BoxGeometry(0.22, 0.55, 0.22)
  ;[
    [0.45, -0.25, 0.22],
    [0.45, -0.25, -0.22],
    [-0.45, -0.25, 0.22],
    [-0.45, -0.25, -0.22],
  ].forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(legGeometry, accent)
    leg.position.set(x, y, z)
    dino.add(leg)
  })

  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.55), accent)
  spine.position.set(0, 0.62, 0)
  dino.add(spine)

  dino.scale.setScalar(0.95)
  return dino
}

export function createDinosaurScene() {
  const scene = new THREE.Scene()
  const camera = createCamera()
  camera.position.set(0, 0.4, 5.5)
  const renderer = createRenderer()

  addLights(scene, 0xe8fff0)

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(2.5, 48),
    new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.9,
    }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.55
  scene.add(ground)

  const dino = createDinosaur()
  scene.add(dino)

  const animate = () => {
    dino.rotation.y += 0.008
    dino.position.y = Math.sin(Date.now() * 0.002) * 0.04
  }

  return { scene, camera, renderer, animate, objects: [ground, dino] }
}

export const sceneFactories = {
  solar: createSolarScene,
  crystal: createCrystalScene,
  dinosaur: createDinosaurScene,
}
