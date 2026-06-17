import { parseCsv } from './parseCsv'

/** Scene keys that load CSV data from public/data/{variant}.csv */
export const DATA_SCENES = ['energy', 'co2', 'saving']

const csvCache = new Map()

/**
 * Loads and parses a scene CSV from public/data/.
 * Files are cached in memory after the first fetch.
 *
 * Expected layout: public/data/energy.csv, public/data/co2.csv, public/data/saving.csv
 * Each file should include a `year` column plus your data columns.
 *
 * @param {string} variant - Scene key (energy | co2 | saving)
 * @returns {Promise<Record<string, string>[]>}
 */
export async function loadSceneCsv(variant) {
  if (!DATA_SCENES.includes(variant)) {
    return []
  }

  if (csvCache.has(variant)) {
    return csvCache.get(variant)
  }

  const response = await fetch(`/data/${variant}.csv`)

  if (!response.ok) {
    console.warn(`[data] Missing or unreadable CSV: /data/${variant}.csv`)
    csvCache.set(variant, [])
    return []
  }

  const text = await response.text()
  const rows = parseCsv(text)
  csvCache.set(variant, rows)
  return rows
}

/**
 * Returns all CSV rows for a given scene and timeline year.
 *
 * @param {string} variant
 * @param {number} year
 * @returns {Promise<Record<string, string>[]>}
 */
export async function loadSceneYearRows(variant, year) {
  const rows = await loadSceneCsv(variant)
  return rows.filter((row) => Number(row.year) === year)
}
