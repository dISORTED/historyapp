export interface Incident {
  id: string
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

