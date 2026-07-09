import * as THREE from 'three'

/** Shared across Energy / CO₂ / Savings panels so motion stays in phase. */
const globalClock = new THREE.Clock()

/** building id → { type: 'enter' | 'exit', startTime: number } */
const transitionByBuildingId = new Map()

/** Shared active set so async panel updates don't desync wasActive. */
const sharedActiveBuildingIds = new Set()
let lastCommitYear = null
let yearCommitSnapshot = null

export const ENTRANCE_STAGGER = 0.07

export function getGlobalElapsedTime() {
  return globalClock.getElapsedTime()
}

/** Snapshot once per timeline year before any panel commits building state. */
export function beginBuildingCommitForYear(year) {
  if (year !== lastCommitYear) {
    yearCommitSnapshot = new Set(sharedActiveBuildingIds)
    lastCommitYear = year
  }
  return yearCommitSnapshot
}

export function finishBuildingCommitForYear(nextActiveIds) {
  sharedActiveBuildingIds.clear()
  for (const id of nextActiveIds) {
    sharedActiveBuildingIds.add(id)
  }
}

/**
 * Register a fade/float transition shared across scene panels.
 * `startTime` uses monotonic global elapsed time (not year-scaled).
 * @param {boolean} [force=false] - restart timing even when the same type is already registered
 * @returns {{ type: 'enter' | 'exit', startTime: number }}
 */
export function registerTransition(buildingId, type, animationTime, staggerIndex = 0, force = false) {
  const existing = transitionByBuildingId.get(buildingId)
  if (existing?.type === type && !force) {
    return existing
  }

  const transition = {
    type,
    startTime: animationTime + (type === 'enter' ? staggerIndex * ENTRANCE_STAGGER : 0),
  }
  transitionByBuildingId.set(buildingId, transition)
  return transition
}

export function getTransition(buildingId) {
  return transitionByBuildingId.get(buildingId)
}

export function clearTransition(buildingId) {
  transitionByBuildingId.delete(buildingId)
}
