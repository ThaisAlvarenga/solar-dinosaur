/**
 * CO₂ savings formula from the Solar Monthly Savings workbook:
 *
 *   CO₂ saved (lbs) = (kWh / 1000) × $AM$3
 *
 * `$AM$3` is an Excel absolute reference to cell **AM3** on the **kWh** tab.
 * That cell stores the EPA eGRID 2023 SRSO emission rate: **1392.345 lb/MWh**
 * (pounds of CO₂ equivalent per megawatt-hour).
 *
 * Dividing kWh by 1000 converts to MWh; multiplying by the rate gives lbs CO₂ avoided.
 *
 * @see https://www.epa.gov/egrid/download-data
 */
export const DEFAULT_EMISSION_RATE_LB_PER_MWH = 1392.345

export const XLSX_AM3_ADDRESS = 'AM3'

/**
 * @param {number} kWh
 * @param {number} [emissionRateLbPerMWh]
 * @returns {number} CO₂ saved in pounds
 */
export function calcCo2SavedLbs(kWh, emissionRateLbPerMWh = DEFAULT_EMISSION_RATE_LB_PER_MWH) {
  if (!kWh || kWh <= 0) return 0
  return (kWh / 1000) * emissionRateLbPerMWh
}

/**
 * Build rounded per-year and all-time CO₂ totals from kWh totals.
 *
 * @param {Record<string|number, number>} kwhByYear
 * @param {number} [emissionRateLbPerMWh]
 */
export function summarizeCo2Totals(kwhByYear, emissionRateLbPerMWh = DEFAULT_EMISSION_RATE_LB_PER_MWH) {
  const co2ByYear = {}
  let totalKwh = 0

  for (const [year, kwh] of Object.entries(kwhByYear ?? {}).sort(
    ([a], [b]) => Number(a) - Number(b),
  )) {
    const kwhValue = Number(kwh) || 0
    totalKwh += kwhValue
    co2ByYear[year] = Math.round(calcCo2SavedLbs(kwhValue, emissionRateLbPerMWh))
  }

  return {
    co2ByYear,
    totalCo2SavedLbs: Math.round(calcCo2SavedLbs(totalKwh, emissionRateLbPerMWh)),
  }
}

/**
 * Read the $AM$3 emission factor from the Savings workbook kWh sheet.
 *
 * @param {import('xlsx').WorkSheet | undefined} sheet
 * @returns {number | null}
 */
export function readEmissionRateCell(sheet) {
  if (!sheet) return null

  const parsed = Number(sheet[XLSX_AM3_ADDRESS]?.v)
  if (Number.isFinite(parsed) && parsed > 10) {
    return parsed
  }

  return null
}
