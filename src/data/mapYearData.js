/**
 * Maps raw CSV rows → values each Three.js scene reads in applyYear().
 *
 * Flow: timeline year change → ThreePanel → loadSceneCsv() → mapSceneYearData() → applyYear({ data })
 */

import { mapDataTestCo2 } from './mapDataTestCo2'

function rowForYear(rows, year) {
  return rows.find((row) => Number(row.year) === year) ?? {}
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function isDataTestDataset(value) {
  return Boolean(value?.buildings && value?.monthly)
}

// PLEASE WORK HERE FOR ENERGY DATA MAPPING — shape CSV columns for the energy scene.
export function mapEnergyYearData(rows, year) {
  const row = rowForYear(rows, year)

  return {
    year,
    generationTwh: toNumber(row.generation_twh ?? row.generationTwh),
    capacityGw: toNumber(row.capacity_gw ?? row.capacityGw),
    raw: row,
  }
}

// CO2 scene — DataTest.csv wide-format dataset → per-building cumulative CO2 stats.
export function mapCo2YearData(datasetOrRows, year) {
  if (isDataTestDataset(datasetOrRows)) {
    return mapDataTestCo2(datasetOrRows, year)
  }

  const row = rowForYear(datasetOrRows, year)

  return {
    year,
    emissionsGt: toNumber(row.emissions_gt ?? row.emissionsGt),
    reductionPct: toNumber(row.reduction_pct ?? row.reductionPct),
    buildings: [],
    raw: row,
  }
}

// PLEASE WORK HERE FOR SAVING DATA MAPPING — shape CSV columns for the saving scene.
export function mapSavingYearData(rows, year) {
  const row = rowForYear(rows, year)

  return {
    year,
    savingsIndex: toNumber(row.savings_index ?? row.savingsIndex),
    hectaresRestored: toNumber(row.hectares_restored ?? row.hectaresRestored),
    raw: row,
  }
}

const mappers = {
  energy: mapEnergyYearData,
  co2: mapCo2YearData,
  saving: mapSavingYearData,
}

/**
 * @param {string} variant
 * @param {Record<string, string>[]} rows - All rows from the scene CSV
 * @param {number} year
 * @returns {Record<string, unknown>}
 */
export function mapSceneYearData(variant, rows, year) {
  const mapper = mappers[variant]
  if (!mapper) return { year }
  return mapper(rows, year)
}
