import { createClient } from './supabase-client'
import { CreateIncidentInput } from './types'

export async function createIncident(incident: CreateIncidentInput) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('incidents')
    .insert([
      {
        ...incident,
        user_id: user.id,
      },
    ])
    .select()

  if (error) throw error
  return data
}

export async function getIncidents(searchTerm = '', dateFrom: string | null = null, dateTo: string | null = null) {
  const supabase = createClient()

  let query = supabase
    .from('incidents')
    .select('*')
    .order('resolution_date', { ascending: false })

  if (searchTerm) {
    query = query.or(
      `title.ilike.%${searchTerm}%,problem_description.ilike.%${searchTerm}%,actions_taken.ilike.%${searchTerm}%,affected_tool.ilike.%${searchTerm}%,responsible.ilike.%${searchTerm}%`
    )
  }

  if (dateFrom) {
    query = query.gte('resolution_date', dateFrom)
  }

  if (dateTo) {
    query = query.lte('resolution_date', dateTo)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function updateIncident(id: string, incident: Partial<CreateIncidentInput>) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('incidents')
    .update(incident)
    .eq('id', id)
    .select()

  if (error) throw error
  return data
}

export async function deleteIncident(id: string) {
  const supabase = createClient()

  const { error } = await supabase.from('incidents').delete().eq('id', id)

  if (error) throw error
}
