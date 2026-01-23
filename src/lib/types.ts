export interface Incident {
  id: string
  created_at: string
  resolution_date: string
  title: string
  problem_description: string
  actions_taken: string
  affected_tool: string
  responsible: string
  observations: string
  user_id: string
}

export interface CreateIncidentInput {
  resolution_date: string
  title: string
  problem_description: string
  actions_taken: string
  affected_tool: string
  responsible: string
  observations: string
}
