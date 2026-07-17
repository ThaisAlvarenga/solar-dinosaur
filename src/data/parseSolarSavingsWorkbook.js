import { resolveBuildingRecord } from './buildingRegistry.js'

/**
 * Cost savings from the Solar Monthly Savings workbook:
 *
 *   savings ($) = kWh × (Elec Rate − CS Rate)
 *
 * Sheets are column-aligned (same building in column B/C/… on each tab).
 * Years through 2025 use that month’s rates. 2026 uses December 2025 rates
 * applied to production rows from solar-data.xlsx.
 */

function excelYearMonth(serial, parseDateCode) {
  const parsed = parseDateCode(serial)
  if (!parsed) return null
  return { year: parsed.y, month: parsed.m }
}

function toNumber(value) {
  if (value === '' || value == null) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function isMetaHeader(value) {
  const label = String(value ?? '').toLowerCase()
  return (
    !label ||
    label.includes('average') ||
    label.includes('grand total') ||
    label.includes('total kwh') ||
    label.includes('co2') ||
    label.includes('egrid') ||
    label.includes('contract')
  )
}

function lastBuildingColumn(headerRow) {
  let last = 0
  for (let col = 1; col < headerRow.length; col++) {
    if (isMetaHeader(headerRow[col])) break
    last = col
  }
  return last
}

function indexRowsByYearMonth(rows, parseDateCode) {
  const index = new Map()
  for (let rowIndex = 2; rowIndex < rows.length; rowIndex++) {
    const serial = rows[rowIndex][0]
    if (typeof serial !== 'number') continue
    const ymd = excelYearMonth(serial, parseDateCode)
    if (!ymd) continue
    index.set(`${ymd.year}-${ymd.month}`, rowIndex)
  }
  return index
}

/**
 * @param {object} workbookSheets
 * @param {unknown[][]} workbookSheets.kWh
 * @param {unknown[][]} workbookSheets.elecRates
 * @param {unknown[][]} workbookSheets.csRates
 * @param {(serial: number) => { y: number, m: number, d: number } | null} parseDateCode
 * @param {Array<{ buildingId: string, year: number, month: number, kWh: number }>} [energyMonthly]
 */
export function calcSolarSavingsTotals(
  { kWh, elecRates, csRates },
  parseDateCode,
  energyMonthly = [],
) {
  const sharedLast = Math.min(
    lastBuildingColumn(kWh[1] ?? []),
    lastBuildingColumn(elecRates[1] ?? []),
    lastBuildingColumn(csRates[1] ?? []),
  )

  const kWhIndex = indexRowsByYearMonth(kWh, parseDateCode)
  const elecIndex = indexRowsByYearMonth(elecRates, parseDateCode)
  const csIndex = indexRowsByYearMonth(csRates, parseDateCode)
  const dec2025ElecRow = elecIndex.get('2025-12')
  const dec2025CsRow = csIndex.get('2025-12')

  const savingsByYear = {}

  const yearsInWorkbook = new Set()
  for (const key of kWhIndex.keys()) {
    yearsInWorkbook.add(Number(key.split('-')[0]))
  }

  for (const year of [...yearsInWorkbook].sort((a, b) => a - b)) {
    if (year >= 2026) continue

    let total = 0
    for (let month = 1; month <= 12; month++) {
      const key = `${year}-${month}`
      const kWhRow = kWhIndex.get(key)
      if (kWhRow == null) continue

      const elecRow = elecIndex.get(key) ?? dec2025ElecRow
      const csRow = csIndex.get(key) ?? dec2025CsRow

      for (let col = 1; col <= sharedLast; col++) {
        const kwh = toNumber(kWh[kWhRow][col])
        if (kwh == null || kwh <= 0) continue

        let elec = elecRow != null ? toNumber(elecRates[elecRow][col]) : null
        let cs = csRow != null ? toNumber(csRates[csRow][col]) : null
        if (elec == null && dec2025ElecRow != null) {
          elec = toNumber(elecRates[dec2025ElecRow][col])
        }
        if (cs == null && dec2025CsRow != null) {
          cs = toNumber(csRates[dec2025CsRow][col])
        }
        if (elec == null || cs == null) continue

        total += kwh * (elec - cs)
      }
    }

    savingsByYear[year] = total
  }

  // 2026: energy monthly kWh × December 2025 rates
  if (dec2025ElecRow != null && dec2025CsRow != null && energyMonthly.length) {
    const colByBuildingId = new Map()
    for (let col = 1; col <= sharedLast; col++) {
      const record = resolveBuildingRecord(String(kWh[1][col] ?? ''))
      colByBuildingId.set(record.id, col)
    }

    let total2026 = 0
    for (const entry of energyMonthly) {
      if (entry.year !== 2026 || !(entry.kWh > 0)) continue
      const col = colByBuildingId.get(entry.buildingId)
      if (col == null) continue

      const elec = toNumber(elecRates[dec2025ElecRow][col])
      const cs = toNumber(csRates[dec2025CsRow][col])
      if (elec == null || cs == null) continue

      total2026 += entry.kWh * (elec - cs)
    }

    if (total2026 > 0) {
      savingsByYear[2026] = total2026
    }
  }

  const totalSavings = Math.round(
    Object.values(savingsByYear).reduce((sum, value) => sum + value, 0),
  )

  const roundedByYear = Object.fromEntries(
    Object.entries(savingsByYear)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([year, value]) => [year, Math.round(value)]),
  )

  return {
    savingsByYear: roundedByYear,
    totalSavings,
    savingsFormula: 'kWh × (Elec Rate − CS Rate); 2026 uses December 2025 rates',
  }
}
