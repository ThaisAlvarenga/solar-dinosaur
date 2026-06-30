import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import {
  DEFAULT_EMISSION_RATE_LB_PER_MWH,
  readEmissionRateCell,
} from '../src/data/co2Emissions.js'
import { getBuildingDisplayName } from '../src/data/buildingRegistry.js'
import { parseSolarCostSheet } from '../src/data/parseSolarCostWorkbook.js'
import { parseSolarWorkbookSheets } from '../src/data/parseSolarWorkbook.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const dataDir = join(root, 'public/data')
const energyInputPath = join(dataDir, 'solar-data.xlsx')
const costInputPath = join(dataDir, 'solar-cost.xlsx')
const outputPath = join(dataDir, 'solar-data.json')

function mergeBuildingCatalog(energyBuildings, costBuildings) {
  const buildingMap = new Map()

  for (const building of [...energyBuildings, ...costBuildings]) {
    if (!buildingMap.has(building.id)) {
      buildingMap.set(building.id, {
        id: building.id,
        name: getBuildingDisplayName(building.id),
        rawName: building.rawName ?? building.name,
      })
      continue
    }

    const existing = buildingMap.get(building.id)
    if (!existing.rawName && building.rawName) {
      existing.rawName = building.rawName
    }
  }

  return Array.from(buildingMap.values()).sort((a, b) => a.name.localeCompare(b.name))
}

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

const energyWorkbook = XLSX.read(readFileSync(energyInputPath), { type: 'buffer' })
const energySheets = energyWorkbook.SheetNames.map((sheetName) => ({
  sheetName,
  rows: XLSX.utils.sheet_to_json(energyWorkbook.Sheets[sheetName], {
    header: 1,
    defval: '',
  }),
}))

const energyData = parseSolarWorkbookSheets(energySheets)

let costData = { buildings: [], monthlyCost: [], costYears: [] }
try {
  const costWorkbook = XLSX.read(readFileSync(costInputPath), { type: 'buffer' })
  const costSheetName = costWorkbook.SheetNames.find((name) => name !== 'Report Overview') ?? costWorkbook.SheetNames[0]
  const costRows = XLSX.utils.sheet_to_json(costWorkbook.Sheets[costSheetName], {
    header: 1,
    defval: '',
  })
  costData = parseSolarCostSheet(costRows)
} catch (error) {
  console.warn('[import-data] Could not read solar-cost.xlsx — savings data will be empty.', error.message)
}

const dataset = {
  ...energyData,
  buildings: mergeBuildingCatalog(energyData.buildings, costData.buildings),
  monthlyCost: costData.monthlyCost,
  costYears: costData.costYears,
  emissionRateLbPerMWh: findEmissionRateLbPerMWh(),
  emissionRateSource: 'Excel $AM$3 — eGRID SRSO CO₂ rate (lb/MWh)',
  sourceFiles: {
    energy: 'solar-data.xlsx',
    cost: 'solar-cost.xlsx',
    emissionRate: 'Solar Monthly Savings *.xlsx',
  },
  importedAt: new Date().toISOString(),
  sheetNames: energyWorkbook.SheetNames,
}

writeFileSync(outputPath, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8')

console.log(`Imported ${dataset.monthly.length} energy rows across ${dataset.years.length} year(s): ${dataset.years.join(', ')}`)
console.log(`Imported ${dataset.monthlyCost.length} cost rows across ${dataset.costYears.length} year(s): ${dataset.costYears.join(', ')}`)
console.log(`Buildings: ${dataset.buildings.length}`)
console.log(`Wrote ${outputPath}`)
