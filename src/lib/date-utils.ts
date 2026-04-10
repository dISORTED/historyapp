const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function toLocalDateValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function parseStoredDate(value: string | null | undefined): Date | null {
  if (!value) return null

  if (DATE_ONLY_PATTERN.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export function toDateKey(value: Date | string | null | undefined): string {
  if (!value) return ''

  if (typeof value === 'string' && DATE_ONLY_PATTERN.test(value)) {
    return value
  }

  const parsed = value instanceof Date ? value : parseStoredDate(value)
  if (!parsed) return ''

  return toLocalDateValue(parsed)
}

export function toSortableTimestamp(value: string | null | undefined): number | null {
  const parsed = parseStoredDate(value)
  return parsed ? parsed.getTime() : null
}

export function toDateTimeLocalInputValue(value: string | null | undefined): string {
  const parsed = parseStoredDate(value)
  if (!parsed) return ''

  return `${toLocalDateValue(parsed)}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`
}

export function fromDateTimeLocalInputValue(value: string): string {
  if (!value) return ''

  const [datePart, timePart = '00:00'] = value.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes] = timePart.split(':').map(Number)

  return new Date(year, month - 1, day, hours || 0, minutes || 0, 0, 0).toISOString()
}

export function buildLocalDayRange(dateValue: string) {
  const parsed = parseStoredDate(dateValue)
  if (!parsed) return null

  const start = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 0, 0, 0, 0)
  const end = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), 23, 59, 59, 999)

  return {
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  }
}
