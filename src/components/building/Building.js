import * as THREE from 'three'
import { BUILDING_THEMES } from './themes.js'

const MATCAP_SIZE = 512

const ringTextureCache = new Map()
const sharedTextureLoader = new THREE.TextureLoader()

function hexToRgba(hex, alpha)
{
    const n = parseInt(hex.replace('#', ''), 16)
    const r = (n >> 16) & 255
    const g = (n >> 8) & 255
    const b = n & 255
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function drawBlob(ctx, x, y, radius, colorInner, colorOuter)
{
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, colorInner)
    gradient.addColorStop(1, colorOuter)
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
}

function loadRingTexture(themeName)
{
    if (!ringTextureCache.has(themeName))
    {
        const path = BUILDING_THEMES[themeName].ringTexture
        const texture = sharedTextureLoader.load(path)
        texture.colorSpace = THREE.SRGBColorSpace
        ringTextureCache.set(themeName, texture)
    }

    return ringTextureCache.get(themeName)
}

/**
 * Animated sphere + pulsing rings for Energy / CO2 / Savings scenes.
 *
 * @example
 * const building = new Building({ theme: 'energy', position: { x: 0, y: 0, z: 0 } })
 * scene.add(building.group)
 *
 * // In your animation loop:
 * buildings.forEach((building) => building.update(elapsedTime))
 */
export class Building
{
    constructor(options = {})
    {
        const {
            theme = 'energy',
            position = { x: 0, y: 0, z: 0 },
            scale = 1,
            animate = true,
            speed = 1.5,
            animateRings = true,
            ringDuration = 3,
            ringStagger = 1,
            data = null
        } = options

        this.themeName = theme
        this.colors = { ...BUILDING_THEMES[theme] }
        this.animate = animate
        this.speed = speed
        this.animateRings = animateRings
        this.ringDuration = ringDuration
        this.ringStagger = ringStagger
        this.data = data

        this.group = new THREE.Group()
        this.group.position.set(position.x, position.y, position.z)
        this.group.scale.setScalar(scale)

        this._createMatcapTexture()
        this._createMeshes()
        this._applyThemeTextures()
        this.updateMatcapTexture(0)
    }

    _createMatcapTexture()
    {
        this.matcapCanvas = document.createElement('canvas')
        this.matcapCanvas.width = MATCAP_SIZE
        this.matcapCanvas.height = MATCAP_SIZE
        this.matcapCtx = this.matcapCanvas.getContext('2d')

        this.matcapTexture = new THREE.CanvasTexture(this.matcapCanvas)
        this.matcapTexture.colorSpace = THREE.SRGBColorSpace
    }

    _createMeshes()
    {
        this.sphereMaterial = new THREE.MeshMatcapMaterial()
        this.sphereMaterial.matcap = this.matcapTexture

        this.ring1Material = new THREE.MeshMatcapMaterial()
        this.ring1Material.transparent = true
        this.ring1Material.depthWrite = false

        this.ring2Material = this.ring1Material.clone()

        this.sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 64, 64),
            this.sphereMaterial
        )

        this.ring1 = new THREE.Mesh(
            new THREE.TorusGeometry(0.8, 0.02, 64, 128),
            this.ring1Material
        )
        this.ring1.rotation.x = Math.PI / 2

        this.ring2 = new THREE.Mesh(
            new THREE.TorusGeometry(1, 0.005, 64, 128),
            this.ring2Material
        )
        this.ring2.rotation.x = Math.PI / 2

        this.rings = [
            { mesh: this.ring1, material: this.ring1Material, offset: 0 },
            { mesh: this.ring2, material: this.ring2Material, offset: this.ringStagger }
        ]

        this.group.add(this.ring1, this.ring2, this.sphere)
    }

    _applyThemeTextures()
    {
        const ringTexture = loadRingTexture(this.themeName)
        this.ring1Material.matcap = ringTexture
        this.ring2Material.matcap = ringTexture
    }

    setTheme(themeName)
    {
        if (!BUILDING_THEMES[themeName])
        {
            throw new Error(`Unknown building theme "${themeName}". Use: ${Object.keys(BUILDING_THEMES).join(', ')}`)
        }

        this.themeName = themeName
        this.colors = { ...BUILDING_THEMES[themeName] }
        this._applyThemeTextures()
        this.updateMatcapTexture(0)
    }

    setPosition(x, y, z)
    {
        this.group.position.set(x, y, z)
    }

    setScale(scale)
    {
        this.group.scale.setScalar(scale)
    }

    updateMatcapTexture(time = 0)
    {
        const size = MATCAP_SIZE
        const cx = size / 2
        const cy = size / 2
        const r = size / 2
        const ctx = this.matcapCtx
        const colors = this.colors

        ctx.clearRect(0, 0, size, size)
        ctx.fillStyle = colors.baseColor
        ctx.fillRect(0, 0, size, size)

        const t = time * this.speed
        const driftA = { x: Math.sin(t) * size * 0.03, y: Math.cos(t * 0.8) * size * 0.2 }
        const driftB = { x: Math.cos(t * 0.9) * size * 0.025, y: Math.sin(t * 1.1) * size * 0.2 }
        const driftC = { x: Math.sin(t * 0.6) * size * 0.02, y: Math.cos(t * 0.7) * size * 0.1 }

        drawBlob(
            ctx,
            cx - size * 0.05 + driftA.x, cy + size * 0.06 + driftA.y, size * 0.46,
            hexToRgba(colors.shadowColor, 0.55), hexToRgba(colors.shadowColor, 0)
        )

        drawBlob(
            ctx,
            cx - size * 0.16 + driftB.x, cy + size * 0.02 + driftB.y, size * 0.30,
            hexToRgba(colors.coreColor, 0.65), hexToRgba(colors.coreColor, 0)
        )

        drawBlob(
            ctx,
            cx + size * 0.02 + driftC.x, cy - size * 0.22 + driftC.y, size * 0.42,
            hexToRgba(colors.highlightColor, 0.9), hexToRgba(colors.highlightColor, 0)
        )

        drawBlob(
            ctx,
            cx - size * 0.08 + driftC.x * 0.6, cy - size * 0.28 + driftC.y * 0.6, size * 0.14,
            hexToRgba(colors.highlightColor, 0.95), hexToRgba(colors.highlightColor, 0)
        )

        drawBlob(
            ctx,
            cx + size * 0.30 - driftA.x, cy + size * 0.28 - driftA.y, size * 0.30,
            'rgba(255, 255, 255, 0.35)', 'rgba(255, 255, 255, 0)'
        )

        const rimWidth = size * 0.02
        const rimGradient = ctx.createRadialGradient(cx, cy, r - rimWidth * 2.2, cx, cy, r)
        rimGradient.addColorStop(0, hexToRgba(colors.rimColor, 0))
        rimGradient.addColorStop(0.65, hexToRgba(colors.rimColor, 0.55))
        rimGradient.addColorStop(0.85, 'rgba(255, 255, 255, 0.95)')
        rimGradient.addColorStop(1, hexToRgba(colors.rimColor, 0.15))
        ctx.fillStyle = rimGradient
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fill()

        this.matcapTexture.needsUpdate = true
    }

    _updateRings(time)
    {
        const cycle = Math.max(this.ringDuration, 0.001)

        this.rings.forEach((ring) =>
        {
            const localTime = (time + ring.offset) % cycle
            const t = localTime / cycle
            const scaleT = 1 - Math.pow(1 - t, 3)
            ring.mesh.scale.setScalar(scaleT)
            ring.material.opacity = Math.sin(Math.PI * t)
        })
    }

    update(time)
    {
        if (this.animate)
        {
            this.updateMatcapTexture(time)
        }

        if (this.animateRings)
        {
            this._updateRings(time)
        }
    }

    dispose()
    {
        this.group.remove(this.ring1, this.ring2, this.sphere)

        this.sphere.geometry.dispose()
        this.ring1.geometry.dispose()
        this.ring2.geometry.dispose()

        this.sphereMaterial.dispose()
        this.ring1Material.dispose()
        this.ring2Material.dispose()
        this.matcapTexture.dispose()
    }
}

/**
 * Build many buildings for one scene theme from data records.
 *
 * @param {Array<object>} records - Each record can include position, scale, and any custom fields.
 * @param {'energy'|'co2'|'savings'} theme
 * @param {(record: object, index: number) => object} [mapOptions] - Extra Building constructor options per record.
 */
export function createBuildingArray(records, theme, mapOptions = () => ({}))
{
    return records.map((record, index) =>
    {
        const { position, scale, ...data } = record

        return new Building({
            theme,
            position,
            scale,
            data,
            ...mapOptions(record, index)
        })
    })
}
