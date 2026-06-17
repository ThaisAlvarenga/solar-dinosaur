/**
 * Minimal CSV parser (no extra dependencies).
 * Handles quoted fields and comma-separated values.
 *
 * @param {string} text - Raw CSV file contents
 * @returns {Record<string, string>[]} Rows as objects keyed by header names
 */
export function parseCsv(text) {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)

  if (lines.length === 0) return []

  const headers = splitCsvLine(lines[0]).map((header) => header.trim())

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line)
    return headers.reduce((row, header, index) => {
      row[header] = (values[index] ?? '').trim()
      return row
    }, {})
  })
}

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
