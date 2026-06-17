export const TIMELINE_YEARS = [2021, 2022, 2023, 2024, 2025, 2026]

export const DEFAULT_YEAR = 2021

export function yearProgress(year) {
  const start = TIMELINE_YEARS[0]
  const end = TIMELINE_YEARS[TIMELINE_YEARS.length - 1]
  return (year - start) / (end - start)
}
