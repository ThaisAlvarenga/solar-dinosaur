const MASK_URL = '/assets/map-placement-mask.png'
const WORLD_WIDTH = 5.5
const MIN_ALPHA = 24
const WHITE_CHANNEL_MIN = 238

let maskState = null

function isValidPlacementPixel(data, px, py, width) {
  const index = (py * width + px) * 4
  const r = data[index]
  const g = data[index + 1]
  const b = data[index + 2]
  const a = data[index + 3]

  if (a < MIN_ALPHA) return false
  if (r >= WHITE_CHANNEL_MIN && g >= WHITE_CHANNEL_MIN && b >= WHITE_CHANNEL_MIN) return false

  return true
}

function computeContentBounds(data, width, height) {
  let pxMin = width
  let pxMax = 0
  let pyMin = height
  let pyMax = 0
  let found = false

  for (let py = 0; py < height; py += 1) {
    for (let px = 0; px < width; px += 1) {
      if (!isValidPlacementPixel(data, px, py, width)) continue
      found = true
      pxMin = Math.min(pxMin, px)
      pxMax = Math.max(pxMax, px)
      pyMin = Math.min(pyMin, py)
      pyMax = Math.max(pyMax, py)
    }
  }

  if (!found) {
    return { pxMin: 0, pxMax: width - 1, pyMin: 0, pyMax: height - 1 }
  }

  return { pxMin, pxMax, pyMin, pyMax }
}

function deriveSceneBounds(contentBounds) {
  const contentWidth = Math.max(1, contentBounds.pxMax - contentBounds.pxMin)
  const contentHeight = Math.max(1, contentBounds.pyMax - contentBounds.pyMin)
  const aspect = contentHeight / contentWidth
  const worldDepth = WORLD_WIDTH * aspect

  return {
    xMin: -WORLD_WIDTH / 2,
    xMax: WORLD_WIDTH / 2,
    zMin: -worldDepth / 2,
    zMax: worldDepth / 2,
  }
}

function pixelToScene(px, py, mask) {
  const { pxMin, pxMax, pyMin, pyMax } = mask.contentBounds
  const u = (px - pxMin) / Math.max(1, pxMax - pxMin)
  const v = (py - pyMin) / Math.max(1, pyMax - pyMin)
  const { xMin, xMax, zMin, zMax } = mask.sceneBounds

  return {
    x: xMin + u * (xMax - xMin),
    z: zMax - v * (zMax - zMin),
  }
}

function sceneToPixel(x, z, mask) {
  const { xMin, xMax, zMin, zMax } = mask.sceneBounds
  const u = (x - xMin) / (xMax - xMin)
  const v = 1 - (z - zMin) / (zMax - zMin)
  const { pxMin, pxMax, pyMin, pyMax } = mask.contentBounds

  return {
    px: Math.round(pxMin + u * (pxMax - pxMin)),
    py: Math.round(pyMin + v * (pyMax - pyMin)),
  }
}

function findNearestValidPixel(px, py, mask, maxRadius = 160) {
  const { width, height, data } = mask

  if (
    px >= 0 &&
    py >= 0 &&
    px < width &&
    py < height &&
    isValidPlacementPixel(data, px, py, width)
  ) {
    return { px, py }
  }

  for (let radius = 1; radius <= maxRadius; radius += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      for (let dy = -radius; dy <= radius; dy += 1) {
        if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue

        const sampleX = px + dx
        const sampleY = py + dy
        if (sampleX < 0 || sampleY < 0 || sampleX >= width || sampleY >= height) continue

        if (isValidPlacementPixel(data, sampleX, sampleY, width)) {
          return { px: sampleX, py: sampleY }
        }
      }
    }
  }

  return { px, py }
}

/**
 * Map normalized position (0–1 within county map) to scene coordinates.
 * @param {number} u - 0 west → 1 east
 * @param {number} v - 0 north → 1 south
 */
export function uvToScene(u, v, mask) {
  if (!mask) return { x: 0, z: 0 }

  const { pxMin, pxMax, pyMin, pyMax } = mask.contentBounds
  const px = Math.round(pxMin + u * (pxMax - pxMin))
  const py = Math.round(pyMin + v * (pyMax - pyMin))
  const snapped = findNearestValidPixel(px, py, mask)
  return pixelToScene(snapped.px, snapped.py, mask)
}

/**
 * Load the colored county map for placement validation.
 */
export async function loadMapMask() {
  if (maskState) {
    return maskState
  }

  const image = new Image()
  image.src = MASK_URL

  await new Promise((resolve, reject) => {
    image.onload = resolve
    image.onerror = reject
  })

  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  context.drawImage(image, 0, 0)

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const contentBounds = computeContentBounds(imageData.data, canvas.width, canvas.height)
  const sceneBounds = deriveSceneBounds(contentBounds)

  maskState = {
    width: canvas.width,
    height: canvas.height,
    data: imageData.data,
    contentBounds,
    sceneBounds,
    aspect: (sceneBounds.zMax - sceneBounds.zMin) / (sceneBounds.xMax - sceneBounds.xMin),
  }

  return maskState
}

/**
 * Clamp a scene position to the nearest valid colored pixel on the map.
 */
export function clampToMask(x, z, mask) {
  if (!mask) return { x, z }

  const { px, py } = sceneToPixel(x, z, mask)
  const snapped = findNearestValidPixel(px, py, mask)
  return pixelToScene(snapped.px, snapped.py, mask)
}

/**
 * @returns {Promise<{ bounds: object, aspect: number, buildings: Array }>}
 */
export async function loadBuildingPositions() {
  const response = await fetch('/data/building-positions.json')
  if (!response.ok) {
    throw new Error('Failed to load building positions')
  }

  const payload = await response.json()
  const mask = await loadMapMask()

  const buildings = payload.buildings.map((building) => {
    if (typeof building.u === 'number' && typeof building.v === 'number') {
      const scene = uvToScene(building.u, building.v, mask)
      return { ...building, x: scene.x, z: scene.z }
    }

    const clamped = clampToMask(building.x, building.z, mask)
    return { ...building, x: clamped.x, z: clamped.z }
  })

  return {
    bounds: mask.sceneBounds,
    aspect: mask.aspect,
    buildings,
  }
}
