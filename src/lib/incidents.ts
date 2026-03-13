import { createClient } from './supabase-client'
import { AdminIncidentFilters, CreateIncidentInput, Incident } from './types'

function generateTicketCode() {
  const now = new Date()
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')
  const timePart = [
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('')
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase()

  return `TKT-${datePart}-${timePart}-${randomPart}`
}

export async function createIncident(incident: CreateIncidentInput) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const technicianName = user?.user_metadata?.name ? String(user.user_metadata.name).trim() : ''
  if (!technicianName) {
    throw new Error('Tu cuenta no tiene nombre de técnico configurado.')
  }

  // FORZAMOS responsible desde metadata (no desde el formulario)
  const payload = {
    ...incident,
    ticket_code: incident.ticket_code || generateTicketCode(),
    responsible: technicianName,
    user_id: user.id,
  }

  const { data, error } = await supabase.from('incidents').insert([payload]).select()

  if (error) throw error
  return data
}

export async function getIncidents(searchTerm = '', dateFrom: string | null = null, dateTo: string | null = null) {
  const supabase = createClient()

  let query = supabase.from('incidents').select('*').order('resolution_date', { ascending: false })

  if (searchTerm) {
    query = query.or(
      `ticket_code.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%,problem_description.ilike.%${searchTerm}%,actions_taken.ilike.%${searchTerm}%,affected_tool.ilike.%${searchTerm}%,responsible.ilike.%${searchTerm}%`
    )
  }

  if (dateFrom) query = query.gte('resolution_date', dateFrom)
  if (dateTo) query = query.lte('resolution_date', dateTo)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function updateIncident(id: string, incident: Partial<CreateIncidentInput>) {
  const supabase = createClient()

  // BLOQUEO: aunque la UI intente, no permitimos cambiar responsible desde cliente
  const safeUpdate = { ...incident }
  if ('responsible' in safeUpdate) {
    delete (safeUpdate as any).responsible
  }

  const { data, error } = await supabase.from('incidents').update(safeUpdate).eq('id', id).select()

  if (error) throw error
  return data
}

export async function deleteIncident(id: string) {
  const supabase = createClient()
  const { error } = await supabase.from('incidents').delete().eq('id', id)
  if (error) throw error
}

export interface IncidentByDate {
  date: string
  count: number
}

export async function getIncidentsByDate(): Promise<IncidentByDate[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('incidents')
    .select('resolution_date')
    .order('resolution_date', { ascending: true })

  if (error) throw error

  const countByDate: Record<string, number> = {}

  for (const incident of data || []) {
    if (incident.resolution_date) {
      const date = incident.resolution_date.split('T')[0]
      countByDate[date] = (countByDate[date] || 0) + 1
    }
  }

  return Object.entries(countByDate).map(([date, count]) => ({
    date,
    count,
  }))
}

export interface IncidentByTechnician {
  technician: string
  count: number
}

export async function getIncidentsByTechnician(): Promise<IncidentByTechnician[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('incidents')
    .select('responsible')
    .order('responsible', { ascending: true })

  if (error) throw error

  const countByTechnician: Record<string, number> = {}

  for (const incident of data || []) {
    if (incident.responsible) {
      countByTechnician[incident.responsible] = (countByTechnician[incident.responsible] || 0) + 1
    }
  }

  return Object.entries(countByTechnician)
    .map(([technician, count]) => ({ technician, count }))
    .sort((a, b) => b.count - a.count)
}

export interface IncidentsBySystem {
  system: string
  count: number
}

export async function getTopSystemsWithFailures(limit = 5): Promise<IncidentsBySystem[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('incidents')
    .select('affected_tool')

  if (error) throw error

  const counts: Record<string, number> = {}

  for (const incident of data || []) {
    const key = incident.affected_tool ? String(incident.affected_tool).trim() : ''
    if (!key) continue
    counts[key] = (counts[key] || 0) + 1
  }

  return Object.entries(counts)
    .map(([system, count]) => ({ system, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export async function getAdminIncidents(filters: AdminIncidentFilters = {}): Promise<Incident[]> {
  const supabase = createClient()

  let query = supabase
    .from('incidents')
    .select('*')
    .order('attention_datetime', { ascending: false, nullsFirst: false })

  if (filters.searchTerm) {
    query = query.or(
      `ticket_code.ilike.%${filters.searchTerm}%,title.ilike.%${filters.searchTerm}%,problem_description.ilike.%${filters.searchTerm}%,actions_taken.ilike.%${filters.searchTerm}%,affected_tool.ilike.%${filters.searchTerm}%,responsible.ilike.%${filters.searchTerm}%,attended_user.ilike.%${filters.searchTerm}%`
    )
  }

  if (filters.dateFrom) query = query.gte('resolution_date', filters.dateFrom)
  if (filters.dateTo) query = query.lte('resolution_date', filters.dateTo)
  if (filters.technician) query = query.eq('responsible', filters.technician)
  if (filters.affectedTool) query = query.eq('affected_tool', filters.affectedTool)

  const { data, error } = await query
  if (error) throw error
  return data || []
}
