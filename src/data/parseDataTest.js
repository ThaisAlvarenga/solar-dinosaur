import { getBuildingDisplayName, resolveBuildingId, slugifyBuildingName } from './buildingRegistry.js'

const MONTH_ROW_RE = /^[A-Za-z]{3}-\d{2}$/
const DEFAULT_EMISSION_RATE = 1.392345

const SUMMARY_COLUMNS = new Set([
  'Month',
  'Total kWh Produced',
  'GRAND TOTAL',
  'CO2e savings (lbs)',
  'CO2e savings (lbs)*',
])

/**
 * Normalize a building name to a stable slug id.
 * @param {string} name
 */
export { slugifyBuildingName } from './buildingRegistry.js'

function splitCsvLine(line) {
  const values = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
      continue
    }

    current += char
  }

  values.push(current)
  return values
}

function parseKwh(value) {
  if (!value || typeof value !== 'string') return 0
  const cleaned = value.replace(/,/g, '').trim()
  if (!cleaned || Number.isNaN(Number(cleaned))) return 0
  return Number(cleaned)
}

function parseMonthLabel(label) {
  const match = label.trim().match(/^([A-Za-z]{3})-(\d{2})$/)
  if (!match) return null

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = monthNames.findIndex((name) => name.toLowerCase() === match[1].toLowerCase()) + 1
  if (month === 0) return null

  const year = 2000 + Number(match[2])
  return { year, month }
}

function extractEmissionRate(lines) {
  for (const line of lines.slice(0, 5)) {
    const values = splitCsvLine(line)
    const rateIndex = values.findIndex((value) =>
      value.includes('eGRID') && value.includes('lb/MWh'),
    )
    if (rateIndex === -1) continue

    const rateValue = values[rateIndex + 1] ?? values.find((value) => /^\d+\.\d+$/.test(value.trim()))
    const parsed = parseKwh(rateValue ?? '')
    if (parsed > 0) return parsed
  }

  return DEFAULT_EMISSION_RATE
}

/**
 * Parse the wide-format DataTest.csv into building metadata and monthly kWh rows.
 * @param {string} text
 */
export function parseDataTest(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  if (lines.length < 3) {
    return {
      emissionRateLbPerMWh: DEFAULT_EMISSION_RATE,
      buildings: [],
      monthly: [],
    }
  }

  const headerLine = lines.find((line) => splitCsvLine(line)[0]?.trim() === 'Month') ?? lines[1]
  const headers = splitCsvLine(headerLine).map((header) => header.trim())

  const buildingColumns = []
  headers.forEach((header, index) => {
    if (index === 0) return
    if (!header || SUMMARY_COLUMNS.has(header)) return
    if (header.startsWith('eGRID')) return

    const id = resolveBuildingId(header)
    buildingColumns.push({ id, name: getBuildingDisplayName(id), columnIndex: index })
  })

  const emissionRateLbPerMWh = extractEmissionRate(lines)
  const monthly = []

  for (const line of lines) {
    const values = splitCsvLine(line)
    const monthLabel = values[0]?.trim() ?? ''
    if (!MONTH_ROW_RE.test(monthLabel)) continue

    const parsedMonth = parseMonthLabel(monthLabel)
    if (!parsedMonth) continue

    for (const building of buildingColumns) {
      const kWh = parseKwh(values[building.columnIndex] ?? '')
      if (kWh <= 0) continue

      monthly.push({
        buildingId: building.id,
        year: parsedMonth.year,
        month: parsedMonth.month,
        kWh,
      })
    }
  }

  return {
    emissionRateLbPerMWh,
    buildings: buildingColumns.map(({ id, name }) => ({ id, name })),
    monthly,
  }
}
