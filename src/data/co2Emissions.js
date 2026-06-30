/**
 * CO₂ savings formula used in the Fulton County Excel workbooks:
 *
 *   CO₂ saved (lbs) = (kWh / 1000) × $AM$3
 *
 * `$AM$3` is an Excel absolute reference to cell AM3 on the "kWh" tab of the
 * savings workbook. That cell holds the EPA eGRID emission factor for the SRSO
 * subregion — pounds of CO₂ equivalent per megawatt-hour (lb/MWh).
 *
 * Dividing kWh by 1000 converts kilowatt-hours to megawatt-hours (MWh).
 * Multiplying by the lb/MWh rate gives pounds of CO₂ avoided.
 *
 * @see https://www.epa.gov/egrid/download-data
 */
export const DEFAULT_EMISSION_RATE_LB_PER_MWH = 1392.345

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
 * Read the $AM$3 emission factor from a workbook sheet (column AM = index 38, row 3 = index 2).
 *
 * @param {import('xlsx').WorkSheet | undefined} sheet
 * @returns {number | null}
 */
export function readEmissionRateCell(sheet) {
  if (!sheet) return null

  const am3 = sheet[XLSX_AM3_ADDRESS]?.v
  const parsed = Number(am3)
  if (Number.isFinite(parsed) && parsed > 10) {
    return parsed
  }

  return null
}

export const XLSX_AM3_ADDRESS = 'AM3'
