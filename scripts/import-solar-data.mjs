import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import {
  DEFAULT_EMISSION_RATE_LB_PER_MWH,
  readEmissionRateCell,
} from '../src/data/co2Emissions.js'
import { parseSolarWorkbookSheets } from '../src/data/parseSolarWorkbook.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const dataDir = join(root, 'public/data')
const inputPath = join(dataDir, 'solar-data.xlsx')
const outputPath = join(dataDir, 'solar-data.json')

function findEmissionRateLbPerMWh() {
  const savingsWorkbook = readdirSync(dataDir).find((name) =>
    /^Solar Monthly Savings.*\.xlsx$/i.test(name),
  )

  if (savingsWorkbook) {
    const workbook = XLSX.read(readFileSync(join(dataDir, savingsWorkbook)), { type: 'buffer' })
    const sheet = workbook.Sheets.kWh ?? workbook.Sheets[workbook.SheetNames[0]]
    const rate = readEmissionRateCell(sheet)
    if (rate) {
      console.log(`Emission rate ($AM$3) from ${savingsWorkbook}: ${rate} lb/MWh`)
      return rate
    }
  }

  console.log(`Emission rate ($AM$3): using default ${DEFAULT_EMISSION_RATE_LB_PER_MWH} lb/MWh`)
  return DEFAULT_EMISSION_RATE_LB_PER_MWH
}

const workbook = XLSX.read(readFileSync(inputPath), { type: 'buffer' })

const sheets = workbook.SheetNames.map((sheetName) => ({
  sheetName,
  rows: XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    defval: '',
  }),
}))

const dataset = {
  ...parseSolarWorkbookSheets(sheets),
  emissionRateLbPerMWh: findEmissionRateLbPerMWh(),
  emissionRateSource: 'Excel $AM$3 — eGRID SRSO CO₂ rate (lb/MWh)',
  sourceFile: 'solar-data.xlsx',
  importedAt: new Date().toISOString(),
  sheetNames: workbook.SheetNames,
}

writeFileSync(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8')

console.log(`Imported ${dataset.monthly.length} monthly rows across ${dataset.years.length} year(s): ${dataset.years.join(', ')}`)
console.log(`Buildings: ${dataset.buildings.length}`)
console.log(`Wrote ${outputPath}`)
