export interface Incident {
  id: string
  ticket_code: string | null
  legacy_ticket_code?: string | null
  created_at: string

  // Campo existente (lo mantenemos por compatibilidad)
  resolution_date: string

  // NUEVOS campos
  attention_datetime: string | null
  attended_user: string | null

  title: string
  problem_description: string
  actions_taken: string
  affected_tool: string
  responsible: string
  observations: string
  user_id: string
}

export interface CreateIncidentInput {
  ticket_code?: string
  // Campo existente (lo mantenemos por compatibilidad)
  resolution_date: string

  // NUEVOS campos
  attention_datetime: string
  attended_user: string

  title: string
  problem_description: string
  actions_taken: string
  affected_tool: string
  responsible: string
  observations: string
}

export interface AdminIncidentFilters {
  searchTerm?: string
  dateFrom?: string | null
  dateTo?: string | null
  technician?: string
  affectedTool?: string
}

export interface AdminKpiMetrics {
  totalIncidents: number
  incidentsToday: number
  uniqueTechnicians: number
  uniqueAffectedTools: number
  busiestHourLabel: string
}

