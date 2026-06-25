import * as THREE from 'three'
import { addLights, createCamera, createRenderer } from './shared'

const PARTICLES_PER_ORB = 700
const PUSH_RADIUS = 1.1
const PUSH_STRENGTH = 0.022
const SPRING = 0.04
const DAMPING = 0.84

const PARTICLE_THEMES = {
  energy: 0xf0c4a8,
  co2: 0x9bafd4,
  money: 0x7ecf96,
}

const ORBS = [
  { position: new THREE.Vector3(-0.95, 0.35, 0.15), radius: 0.348, solar: true },
  { position: new THREE.Vector3(0.75, -0.15, -0.25), radius: 0.432, solar: true },
  { position: new THREE.Vector3(0.05, 0.55, 0.35), radius: 0.288, solar: false },
  { position: new THREE.Vector3(-0.15, -0.5, 0.05), radius: 0.372, solar: true },
]

function sampleOrbShell(orb, inner = 1.05, outer = 2.2) {
  const theta = Math.random() * Math.PI * 2
  const phi = Math.acos(2 * Math.random() - 1)
  const r = orb.radius * (inner + Math.random() * (outer - inner))

  return new THREE.Vector3(
    orb.position.x + r * Math.sin(phi) * Math.cos(theta),
    orb.position.y + r * Math.sin(phi) * Math.sin(theta),
    orb.position.z + r * Math.cos(phi),
  )
}

function createOrbGlow(radius, color, opacity) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 32),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
    }),
  )
}

function createOrbRing(radius, color, opacity) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(radius * 0.96, radius * 1.12, 64),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
  )
  ring.renderOrder = 2
  return ring
}

/**
 * Future scene — full-width Look Ahead view.
 * Wired in App.jsx as: <ThreePanel variant="future" /> (no timeline year / CSV).
 */
export function createFutureScene() {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  const camera = createCamera()
  camera.position.set(0, 0.05, 5.2)
  camera.lookAt(0.05, 0, 0)

  const renderer = createRenderer()
  renderer.setClearColor(0x000000, 1)

  addLights(scene, 0xffe8cc)
  const rim = new THREE.DirectionalLight(0xffaa55, 0.65)
  rim.position.set(-2, 1.5, 4)
  scene.add(rim)

  const visualization = new THREE.Group()
  scene.add(visualization)

  const orbs = []
  const orbMeshes = []
  const glowMeshes = []
  const ringMeshes = []

  ORBS.forEach((config, index) => {
    const material = new THREE.MeshStandardMaterial({
      color: config.solar ? 0xffa040 : 0xb8bcc6,
      emissive: config.solar ? 0xff8800 : 0x1a1c22,
      emissiveIntensity: config.solar ? 1.05 : 0.12,
      metalness: config.solar ? 0.3 : 0.85,
      roughness: config.solar ? 0.22 : 0.18,
    })

    const mesh = new THREE.Mesh(new THREE.SphereGeometry(config.radius, 48, 48), material)
    mesh.position.copy(config.position)
    visualization.add(mesh)

    const glow = createOrbGlow(
      config.radius * 1.55,
      config.solar ? 0xffb347 : 0xc8ccd4,
      config.solar ? 0.1 : 0.05,
    )
    glow.position.copy(config.position)
    visualization.add(glow)

    const ring = createOrbRing(
      config.radius * 1.18,
      config.solar ? 0xffc766 : 0xd8dce4,
      config.solar ? 0.38 : 0.2,
    )
    ring.position.copy(config.position)
    ring.rotation.x = Math.PI / 2
    visualization.add(ring)

    orbs.push({
      mesh,
      glow,
      ring,
      base: config.position.clone(),
      radius: config.radius,
      solar: config.solar,
      phase: index * 1.7,
      velocity: new THREE.Vector3(),
    })
    orbMeshes.push(mesh)
    glowMeshes.push(glow)
    ringMeshes.push(ring)
  })

  const particleCount = ORBS.length * PARTICLES_PER_ORB
  const particlePositions = new Float32Array(particleCount * 3)
  const particleBase = new Float32Array(particleCount * 3)
  const particleVel = new Float32Array(particleCount * 3)
  const particleOrbIndex = new Uint8Array(particleCount)

  let particleIndex = 0
  ORBS.forEach((orbConfig, orbIndex) => {
    for (let i = 0; i < PARTICLES_PER_ORB; i++) {
      const point = sampleOrbShell(orbConfig)
      const offset = particleIndex * 3
      particleBase[offset] = point.x
      particleBase[offset + 1] = point.y
      particleBase[offset + 2] = point.z
      particlePositions[offset] = point.x
      particlePositions[offset + 1] = point.y
      particlePositions[offset + 2] = point.z
      particleOrbIndex[particleIndex] = orbIndex
      particleIndex += 1
    }
  })

  const particleGeometry = new THREE.BufferGeometry()
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))

  const particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      color: PARTICLE_THEMES.energy,
      size: 0.028,
      transparent: true,
      opacity: 0.78,
      sizeAttenuation: true,
      depthWrite: false,
    }),
  )
  visualization.add(particles)

  const particleColor = new THREE.Color(PARTICLE_THEMES.energy)
  const particleTargetColor = new THREE.Color(PARTICLE_THEMES.energy)

  const setParticleTheme = (theme) => {
    const hex = PARTICLE_THEMES[theme] ?? PARTICLE_THEMES.energy
    particleTargetColor.setHex(hex)
  }

  const pointer = new THREE.Vector2(2, 2)
  const pointerWorld = new THREE.Vector3()
  const raycaster = new THREE.Raycaster()
  const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
  const clock = new THREE.Clock()
  let domElement = null

  const updatePointerWorld = () => {
    raycaster.setFromCamera(pointer, camera)
    const hit = raycaster.ray.intersectPlane(interactionPlane, pointerWorld)
    if (!hit) {
      pointerWorld.set(999, 999, 0)
    }
  }

  const applyPointerForce = (x, y, strength = 1) => {
    const dx = x - pointerWorld.x
    const dy = y - pointerWorld.y
    const distSq = dx * dx + dy * dy
    if (distSq > PUSH_RADIUS * PUSH_RADIUS) return { x: 0, y: 0 }

    const dist = Math.sqrt(distSq) || 0.001
    const force = (1 - dist / PUSH_RADIUS) * PUSH_STRENGTH * strength
    return { x: (dx / dist) * force, y: (dy / dist) * force }
  }

  const onPointerMove = (event) => {
    if (!domElement) return
    const rect = domElement.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  const onPointerLeave = () => {
    pointer.set(2, 2)
  }

  const setupInteraction = (element) => {
    domElement = element
    element.addEventListener('pointermove', onPointerMove)
    element.addEventListener('pointerleave', onPointerLeave)
  }

  const disposeInteraction = () => {
    if (!domElement) return
    domElement.removeEventListener('pointermove', onPointerMove)
    domElement.removeEventListener('pointerleave', onPointerLeave)
    domElement = null
  }

  const applyYear = () => {}

  const animate = () => {
    const t = clock.getElapsedTime()
    updatePointerWorld()

    orbs.forEach((orb) => {
      const { mesh, glow, ring, base, solar, phase, velocity } = orb
      const floatX = Math.sin(t * 0.35 + phase) * 0.035
      const floatY = Math.cos(t * 0.28 + phase * 1.2) * 0.03
      const floatZ = Math.sin(t * 0.42 + phase) * 0.02
      const target = new THREE.Vector3(
        base.x + floatX,
        base.y + floatY,
        base.z + floatZ,
      )

      const push = applyPointerForce(mesh.position.x, mesh.position.y, 1.6)
      velocity.x += push.x
      velocity.y += push.y
      velocity.x += (target.x - mesh.position.x) * SPRING * 0.8
      velocity.y += (target.y - mesh.position.y) * SPRING * 0.8
      velocity.z += (target.z - mesh.position.z) * SPRING * 0.6
      velocity.multiplyScalar(DAMPING)
      mesh.position.add(velocity)

      glow.position.copy(mesh.position)
      ring.position.copy(mesh.position)
      ring.rotation.z = t * 0.15 + phase

      if (solar) {
        const pulse = 0.85 + Math.sin(t * 1.6 + phase) * 0.18
        mesh.material.emissiveIntensity = pulse
        glow.material.opacity = 0.07 + Math.sin(t * 1.2 + phase) * 0.05
        ring.material.opacity = 0.3 + Math.sin(t * 1.4 + phase) * 0.12
      }
    })

    const positionAttr = particleGeometry.attributes.position

    for (let i = 0; i < particleCount; i++) {
      const ix = i * 3
      const orbIndex = particleOrbIndex[i]
      const orb = orbs[orbIndex]
      const bx = particleBase[ix]
      const by = particleBase[ix + 1]
      const bz = particleBase[ix + 2]

      const relX = bx - ORBS[orbIndex].position.x
      const relY = by - ORBS[orbIndex].position.y
      const relZ = bz - ORBS[orbIndex].position.z

      const orbit = t * 0.22 + orb.phase + i * 0.01
      const targetX =
        orb.mesh.position.x +
        relX * Math.cos(orbit * 0.35) -
        relZ * Math.sin(orbit * 0.35) +
        Math.sin(t * 0.5 + i) * 0.006
      const targetY =
        orb.mesh.position.y + relY + Math.cos(t * 0.44 + i * 0.02) * 0.008
      const targetZ =
        orb.mesh.position.z +
        relX * Math.sin(orbit * 0.35) +
        relZ * Math.cos(orbit * 0.35) +
        Math.sin(t * 0.38 + i * 0.015) * 0.005

      const push = applyPointerForce(positionAttr.array[ix], positionAttr.array[ix + 1], 1.2)
      particleVel[ix] += push.x
      particleVel[ix + 1] += push.y

      particleVel[ix] += (targetX - positionAttr.array[ix]) * SPRING
      particleVel[ix + 1] += (targetY - positionAttr.array[ix + 1]) * SPRING
      particleVel[ix + 2] += (targetZ - positionAttr.array[ix + 2]) * SPRING * 0.7

      particleVel[ix] *= DAMPING
      particleVel[ix + 1] *= DAMPING
      particleVel[ix + 2] *= DAMPING

      positionAttr.array[ix] += particleVel[ix]
      positionAttr.array[ix + 1] += particleVel[ix + 1]
      positionAttr.array[ix + 2] += particleVel[ix + 2]
    }

    positionAttr.needsUpdate = true
    visualization.rotation.y = Math.sin(t * 0.05) * 0.03

    particleColor.lerp(particleTargetColor, 0.08)
    particles.material.color.copy(particleColor)
  }

  return {
    scene,
    camera,
    renderer,
    animate,
    applyYear,
    setParticleTheme,
    setupInteraction,
    disposeInteraction,
    objects: [particles, ...orbMeshes, ...glowMeshes, ...ringMeshes],
  }
}
