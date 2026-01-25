'use client'

import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { es } from 'date-fns/locale'
import { createIncident } from '@/lib/incidents'
import { CreateIncidentInput } from '@/lib/types'
import { createClient } from '@/lib/supabase-client'

interface IncidentFormProps {
  onSuccess: () => void
}

export default function IncidentForm({ onSuccess }: IncidentFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateIncidentInput>({
    resolution_date: new Date().toISOString().split('T')[0],
    title: '',
    problem_description: '',
    actions_taken: '',
    affected_tool: '',
    responsible: '',
    observations: '',
  })
  const [userName, setUserName] = useState<string>('')

  // Obtener el nombre del usuario autenticado al montar el componente
  useEffect(() => {
    const fetchUserName = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user && user.user_metadata && user.user_metadata.name) {
        setUserName(user.user_metadata.name)
        setFormData((prev) => ({ ...prev, responsible: user.user_metadata.name }))
      }
    }
    fetchUserName()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (date: Date | null) => {
    const dateString = date ? date.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    setFormData((prev) => ({ ...prev, resolution_date: dateString }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await createIncident(formData)
      setFormData({
        resolution_date: new Date().toISOString().split('T')[0],
        title: '',
        problem_description: '',
        actions_taken: '',
        affected_tool: '',
        responsible: userName, // restaurar el nombre del técnico
        observations: '',
      })
      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '30px', background: 'var(--bg-card)', padding: '20px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
      <h2>Nuevo Registro de Incidencia</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label>Fecha de resolución </label>
          <DatePicker
            selected={new Date(formData.resolution_date)}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            locale={es}
            className="custom-datepicker"
            calendarClassName="custom-calendar"
            required
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '4px', color: 'var(--text-secondary)' }}>Técnico Asignado</label>
          <input
            type="text"
            name="responsible"
            value={formData.responsible}
            disabled
            required
            style={{
              width: '100%',
              padding: '8px',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-default)',
              borderRadius: '4px',
              fontWeight: 500,
              fontSize: '15px',
              marginBottom: '2px',
              minHeight: '38px',
              letterSpacing: '0.5px',
              userSelect: 'text',
              opacity: 1,
              cursor: 'not-allowed',
            }}
            placeholder="Nombre del responsable"
          />
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label>Título breve</label>
        <input
          type="text"
          name="title"
          placeholder="Descripción corta del problema"
          value={formData.title}
          onChange={handleChange}
          required
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label>Sistema afectado</label>
          <input
            type="text"
            name="affected_tool"
            placeholder="Herramienta o sistema"
            value={formData.affected_tool}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label>Descripción del problema</label>
        <textarea
          name="problem_description"
          placeholder="¿Cuál fue el problema?"
          value={formData.problem_description}
          onChange={handleChange}
          required
          rows={3}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box', fontFamily: 'monospace', fontSize: '13px' }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label>Acciones realizadas</label>
        <textarea
          name="actions_taken"
          placeholder="Pasos específicos realizados para resolver"
          value={formData.actions_taken}
          onChange={handleChange}
          required
          rows={3}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box', fontFamily: 'monospace', fontSize: '13px' }}
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label>Observaciones finales</label>
        <textarea
          name="observations"
          placeholder="Notas adicionales o recomendaciones"
          value={formData.observations}
          onChange={handleChange}
          rows={2}
          style={{ width: '100%', padding: '8px', boxSizing: 'border-box', fontFamily: 'monospace', fontSize: '13px' }}
        />
      </div>

      {error && <div style={{ color: 'red', marginBottom: '12px' }}>{error}</div>}

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: 'var(--accent-primary)',
          color: 'var(--bg-main)',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        {loading ? 'Guardando...' : 'Registrar Incidencia'}
      </button>
    </form>
  )
}
