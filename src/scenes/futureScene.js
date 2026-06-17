import * as THREE from 'three'
import { addLights, createCamera, createRenderer } from './shared'

/**
 * Future scene — full-width Look Ahead view.
 * Wired in App.jsx as: <ThreePanel variant="future" /> (no timeline year / CSV).
 */
export function createFutureScene() {
  const scene = new THREE.Scene()
  const camera = createCamera()
  camera.position.set(0, 0.3, 6)
  const renderer = createRenderer()

  addLights(scene, 0xe8f4ff)

  // PLEASE WORK HERE FOR FUTURE — build your Three.js visualization.
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

  const applyYear = () => {}

  // PLEASE WORK HERE FOR FUTURE — per-frame animation.
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
