import * as THREE from 'three'

const MIN_PARTICLES = 4

/**
 * Orbiting particle cloud attached to a building group (from the old sun-building look).
 */
export function createBuildingParticles({
  maxParticles = 100,
  color = 0xf0c4a8,
  size = 0.032,
} = {}) {
  const positions = new Float32Array(maxParticles * 3)
  for (let i = 0; i < maxParticles; i++) {
    const r = 2.2 + Math.random() * 1.0
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setDrawRange(0, 0)

  const material = new THREE.PointsMaterial({
    color,
    size,
    transparent: true,
    opacity: 0.72,
    sizeAttenuation: true,
    depthWrite: false,
  })

  const points = new THREE.Points(geometry, material)
  points.visible = false

  let count = 0
  const targetColor = new THREE.Color(color)
  const currentColor = new THREE.Color(color)

  const setCount = (next) => {
    count = Math.max(0, Math.min(maxParticles, Math.round(next)))
    geometry.setDrawRange(0, count)
    points.visible = count > 0
  }

  const setCountFromMetric = (value, perParticle) => {
    if (!value || value <= 0 || !perParticle) {
      setCount(0)
      return
    }
    setCount(Math.max(MIN_PARTICLES, value / perParticle))
  }

  const setColor = (hex) => {
    targetColor.setHex(hex)
  }

  const animate = (speed = 1) => {
    currentColor.lerp(targetColor, 0.08)
    material.color.copy(currentColor)
    points.rotation.y += 0.0012 * speed
    points.rotation.x += 0.0006 * speed
  }

  const dispose = () => {
    geometry.dispose()
    material.dispose()
  }

  return {
    points,
    setCount,
    setCountFromMetric,
    setColor,
    animate,
    dispose,
  }
}

export const PARTICLE_METRIC = {
  energy: { color: 0xf0c4a8, perParticle: 2000, field: 'annualKwh' },
  co2: { color: 0x9bafd4, perParticle: 7500, field: 'annualCo2Lbs' },
  money: { color: 0x7ecf96, perParticle: 75, field: 'annualSavings' },
}
