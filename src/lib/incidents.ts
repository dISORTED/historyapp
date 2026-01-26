import { createClient } from './supabase-client'
import { CreateIncidentInput } from './types'

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
      `title.ilike.%${searchTerm}%,problem_description.ilike.%${searchTerm}%,actions_taken.ilike.%${searchTerm}%,affected_tool.ilike.%${searchTerm}%,responsible.ilike.%${searchTerm}%`
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
