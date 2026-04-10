import { parseStoredDate, toDateKey, toLocalDateValue } from './date-utils'
import { Incident } from './types'

export interface AnalyticsFilters {
  searchTerm: string
  dateFrom: string
  dateTo: string
  technician: string
  affectedTool: string
}

export interface AnalyticsKpiMetrics {
  totalIncidents: number
  incidentsToday: number
  uniqueTechnicians: number
  uniqueAffectedTools: number
  busiestHourLabel: string
  currentPeriodCount: number
  previousPeriodCount: number
  variationPercent: number
  variationDirection: 'up' | 'down' | 'flat'
}

export interface AnalyticsTrendPoint {
  date: string
  count: number
  movingAverage: number
}

export interface AnalyticsBreakdownPoint {
  label: string
  count: number
}

export interface AnalyticsDonutPoint {
  name: string
  value: number
}

export interface AnalyticsHeatmapCell {
  dayIndex: number
  slotIndex: number
  count: number
  intensity: number
}

export interface AnalyticsHeatmapData {
  dayLabels: string[]
  slotLabels: string[]
  cells: AnalyticsHeatmapCell[]
  maxCount: number
}

export interface AnalyticsInsightItem {
  title: string
  description: string
  action: string
}

export const ANALYTICS_DAY_LABELS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']
export const ANALYTICS_SLOT_LABELS = ['00-05', '06-09', '10-13', '14-17', '18-21', '22-23']

function getTimelineValue(incident: Incident) {
  return incident.attention_datetime || incident.resolution_date
}

function normalizeText(value: string | null | undefined) {
  return value ? value.trim() : ''
}

function toSearchableString(incident: Incident) {
  return [
    incident.ticket_code,
    incident.legacy_ticket_code,
    incident.title,
    incident.problem_description,
    incident.actions_taken,
    incident.affected_tool,
    incident.responsible,
    incident.attended_user,
    incident.observations,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function toDateParts(value: string) {
  const parsed = parseStoredDate(value)
  if (!parsed) return null

  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

function diffDaysInclusive(from: string, to: string) {
  const fromDate = toDateParts(from)
  const toDate = toDateParts(to)
  if (!fromDate || !toDate) return 1

  const diffMs = toDate.getTime() - fromDate.getTime()
  const rawDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return Math.max(1, rawDays + 1)
}

function addDays(dateKey: string, amount: number) {
  const base = toDateParts(dateKey)
  if (!base) return dateKey

  base.setDate(base.getDate() + amount)
  return toLocalDateValue(base)
}

function isDateInRange(dateKey: string, from: string, to: string) {
  return dateKey >= from && dateKey <= to
}

function getSortedDateKeys(incidents: Incident[]) {
  return incidents
    .map((incident) => toDateKey(getTimelineValue(incident)))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
}

function countIncidentsInDateRange(incidents: Incident[], from: string, to: string) {
  let count = 0

  for (const incident of incidents) {
    const key = toDateKey(getTimelineValue(incident))
    if (!key) continue
    if (isDateInRange(key, from, to)) count += 1
  }

  return count
}

function getSlotIndex(hour: number) {
  if (hour <= 5) return 0
  if (hour <= 9) return 1
  if (hour <= 13) return 2
  if (hour <= 17) return 3
  if (hour <= 21) return 4
  return 5
}

export function extractAnalyticsFilterOptions(incidents: Incident[]) {
  const technicians = Array.from(new Set(incidents.map((item) => normalizeText(item.responsible)).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, 'es')
  )

  const affectedTools = Array.from(new Set(incidents.map((item) => normalizeText(item.affected_tool)).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, 'es')
  )

  return { technicians, affectedTools }
}

export function applyAnalyticsFilters(incidents: Incident[], filters: AnalyticsFilters) {
  const normalizedSearch = filters.searchTerm.trim().toLowerCase()

  return incidents.filter((incident) => {
    if (normalizedSearch && !toSearchableString(incident).includes(normalizedSearch)) return false
    if (filters.technician && incident.responsible !== filters.technician) return false
    if (filters.affectedTool && incident.affected_tool !== filters.affectedTool) return false

    const timelineKey = toDateKey(getTimelineValue(incident))
    if (filters.dateFrom && (!timelineKey || timelineKey < filters.dateFrom)) return false
    if (filters.dateTo && (!timelineKey || timelineKey > filters.dateTo)) return false

    return true
  })
}

export function buildAnalyticsKpis(currentIncidents: Incident[], scopedIncidents: Incident[], filters: AnalyticsFilters): AnalyticsKpiMetrics {
  const todayKey = toLocalDateValue(new Date())
  const incidentsToday = currentIncidents.filter((item) => toDateKey(getTimelineValue(item)) === todayKey).length

  const uniqueTechnicians = new Set(currentIncidents.map((item) => normalizeText(item.responsible)).filter(Boolean)).size
  const uniqueAffectedTools = new Set(currentIncidents.map((item) => normalizeText(item.affected_tool)).filter(Boolean)).size

  const byHour: Record<string, number> = {}
  for (const incident of currentIncidents) {
    const parsed = parseStoredDate(incident.attention_datetime)
    if (!parsed) continue

    const key = `${String(parsed.getHours()).padStart(2, '0')}:00`
    byHour[key] = (byHour[key] || 0) + 1
  }

  const busiestHourLabel = Object.entries(byHour).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Sin datos'

  const scopedDateKeys = getSortedDateKeys(scopedIncidents)
  const firstScopedDate = scopedDateKeys[0] || ''
  const lastScopedDate = scopedDateKeys[scopedDateKeys.length - 1] || ''

  let currentStart = ''
  let currentEnd = ''
  let windowDays = 14

  if (filters.dateFrom || filters.dateTo) {
    currentStart = filters.dateFrom || firstScopedDate || todayKey
    currentEnd = filters.dateTo || lastScopedDate || todayKey
    if (currentStart > currentEnd) {
      const swap = currentStart
      currentStart = currentEnd
      currentEnd = swap
    }
    windowDays = diffDaysInclusive(currentStart, currentEnd)
  } else if (lastScopedDate) {
    currentEnd = lastScopedDate
    currentStart = addDays(currentEnd, -(windowDays - 1))
  } else {
    currentEnd = todayKey
    currentStart = addDays(currentEnd, -(windowDays - 1))
  }

  const previousEnd = addDays(currentStart, -1)
  const previousStart = addDays(previousEnd, -(windowDays - 1))

  const currentPeriodCount = countIncidentsInDateRange(scopedIncidents, currentStart, currentEnd)
  const previousPeriodCount = countIncidentsInDateRange(scopedIncidents, previousStart, previousEnd)

  const variationPercent =
    previousPeriodCount === 0
      ? currentPeriodCount === 0
        ? 0
        : 100
      : ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100

  const variationDirection: AnalyticsKpiMetrics['variationDirection'] =
    Math.abs(variationPercent) < 0.5 ? 'flat' : variationPercent > 0 ? 'up' : 'down'

  return {
    totalIncidents: currentIncidents.length,
    incidentsToday,
    uniqueTechnicians,
    uniqueAffectedTools,
    busiestHourLabel,
    currentPeriodCount,
    previousPeriodCount,
    variationPercent,
    variationDirection,
  }
}

export function buildTrendSeries(incidents: Incident[]): AnalyticsTrendPoint[] {
  const countByDate: Record<string, number> = {}

  for (const incident of incidents) {
    const key = toDateKey(getTimelineValue(incident))
    if (!key) continue
    countByDate[key] = (countByDate[key] || 0) + 1
  }

  const keys = Object.keys(countByDate).sort((a, b) => a.localeCompare(b))
  if (keys.length === 0) return []

  const start = keys[0]
  const end = keys[keys.length - 1]
  const series: AnalyticsTrendPoint[] = []
  const movingWindow: number[] = []

  for (let cursor = start; cursor <= end; cursor = addDays(cursor, 1)) {
    const count = countByDate[cursor] || 0
    movingWindow.push(count)
    if (movingWindow.length > 7) movingWindow.shift()

    const average = movingWindow.reduce((sum, value) => sum + value, 0) / movingWindow.length
    series.push({
      date: cursor,
      count,
      movingAverage: Number(average.toFixed(2)),
    })
  }

  return series
}

export function buildBreakdownSeries(
  incidents: Incident[],
  field: 'affected_tool' | 'responsible' | 'attended_user',
  fallbackLabel: string,
  limit = 8
): AnalyticsBreakdownPoint[] {
  const countByLabel: Record<string, number> = {}

  for (const incident of incidents) {
    const key = normalizeText(incident[field]) || fallbackLabel
    countByLabel[key] = (countByLabel[key] || 0) + 1
  }

  return Object.entries(countByLabel)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export function buildTechnicianDonutSeries(incidents: Incident[], limit = 6): AnalyticsDonutPoint[] {
  const countByTechnician: Record<string, number> = {}

  for (const incident of incidents) {
    const key = normalizeText(incident.responsible) || 'Sin tecnico'
    countByTechnician[key] = (countByTechnician[key] || 0) + 1
  }

  const sorted = Object.entries(countByTechnician)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  if (sorted.length <= limit) return sorted

  const fixed = sorted.slice(0, Math.max(1, limit - 1))
  const othersValue = sorted.slice(Math.max(1, limit - 1)).reduce((sum, item) => sum + item.value, 0)

  return [...fixed, { name: 'Otros', value: othersValue }]
}

export function buildHeatmapSeries(incidents: Incident[]): AnalyticsHeatmapData {
  const dayCount = ANALYTICS_DAY_LABELS.length
  const slotCount = ANALYTICS_SLOT_LABELS.length
  const matrix: number[][] = Array.from({ length: dayCount }, () => Array.from({ length: slotCount }, () => 0))

  for (const incident of incidents) {
    const parsed = parseStoredDate(incident.attention_datetime)
    if (!parsed) continue

    const dayIndex = (parsed.getDay() + 6) % 7
    const slotIndex = getSlotIndex(parsed.getHours())
    matrix[dayIndex][slotIndex] += 1
  }

  const maxCount = Math.max(0, ...matrix.flat())
  const cells: AnalyticsHeatmapCell[] = []

  for (let dayIndex = 0; dayIndex < dayCount; dayIndex += 1) {
    for (let slotIndex = 0; slotIndex < slotCount; slotIndex += 1) {
      const count = matrix[dayIndex][slotIndex]
      cells.push({
        dayIndex,
        slotIndex,
        count,
        intensity: maxCount === 0 ? 0 : count / maxCount,
      })
    }
  }

  return {
    dayLabels: ANALYTICS_DAY_LABELS,
    slotLabels: ANALYTICS_SLOT_LABELS,
    cells,
    maxCount,
  }
}

interface BuildInsightsInput {
  kpis: AnalyticsKpiMetrics
  systemBreakdown: AnalyticsBreakdownPoint[]
  technicianBreakdown: AnalyticsBreakdownPoint[]
  heatmap: AnalyticsHeatmapData
}

export function buildDidacticInsights({ kpis, systemBreakdown, technicianBreakdown, heatmap }: BuildInsightsInput): AnalyticsInsightItem[] {
  const topSystem = systemBreakdown[0]
  const topTechnician = technicianBreakdown[0]
  const busiestHeatmapCell = [...heatmap.cells].sort((a, b) => b.count - a.count)[0]

  const slotLabel =
    busiestHeatmapCell && busiestHeatmapCell.count > 0
      ? `${heatmap.dayLabels[busiestHeatmapCell.dayIndex]} ${heatmap.slotLabels[busiestHeatmapCell.slotIndex]}`
      : 'Sin concentracion marcada'

  const trendSummary =
    kpis.variationDirection === 'flat'
      ? 'El volumen se mantiene estable respecto al periodo anterior.'
      : kpis.variationDirection === 'up'
        ? `El volumen subio ${kpis.variationPercent.toFixed(1)}% frente al periodo anterior.`
        : `El volumen bajo ${Math.abs(kpis.variationPercent).toFixed(1)}% frente al periodo anterior.`

  return [
    {
      title: 'Foco principal',
      description: topSystem
        ? `${topSystem.label} concentra ${topSystem.count} incidencias en el filtro activo.`
        : 'No hay un sistema dominante en el periodo seleccionado.',
      action: 'Prioriza checklist preventivo en el sistema con mayor carga y revisa causas repetitivas.',
    },
    {
      title: 'Carga por franja',
      description:
        slotLabel === 'Sin concentracion marcada'
          ? 'Aun no hay datos de horario suficientes para detectar una franja dominante.'
          : `La mayor concentracion operativa ocurre en ${slotLabel}.`,
      action: 'Ajusta cobertura de atencion y ventanas de mantencion segun esta franja.',
    },
    {
      title: 'Ritmo del servicio',
      description: topTechnician
        ? `${trendSummary} El tecnico con mayor participacion es ${topTechnician.label} (${topTechnician.count} casos).`
        : trendSummary,
      action: 'Usa esta senal para balancear carga y anticipar recursos para la siguiente semana.',
    },
  ]
}
