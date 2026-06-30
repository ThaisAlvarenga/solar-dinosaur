import { calcCo2SavedLbs, DEFAULT_EMISSION_RATE_LB_PER_MWH } from './co2Emissions'
 * @param {ReturnType<import('./parseDataTest').parseDataTest>} dataset
 * @param {number} year
 */
export function mapDataTestCo2(dataset, year) {
  const { buildings, monthly, emissionRateLbPerMWh } = dataset

  const byBuilding = new Map(
    buildings.map((building) => [
      building.id,
      {
        id: building.id,
        name: building.name,
        annualKwh: 0,
        cumulativeKwh: 0,
        cumulativeCo2Lbs: 0,
        active: false,
      },
    ]),
  )

  for (const entry of monthly) {
    const record = byBuilding.get(entry.buildingId)
    if (!record) continue

    if (entry.year <= year) {
      record.cumulativeKwh += entry.kWh
    }

    if (entry.year === year) {
      record.annualKwh += entry.kWh
      if (entry.kWh > 0) {
        record.active = true
      }
    }
  }

  const buildingList = Array.from(byBuilding.values()).map((record) => ({
    ...record,
    annualCo2Lbs: calcCo2SavedLbs(record.annualKwh, emissionRateLbPerMWh),
    cumulativeCo2Lbs: calcCo2SavedLbs(record.cumulativeKwh, emissionRateLbPerMWh),
  }))

  return {
    year,
    emissionRateLbPerMWh,
    buildings: buildingList,
  }
}
