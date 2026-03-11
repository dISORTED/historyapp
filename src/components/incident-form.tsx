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
  const [success, setSuccess] = useState(false)
  const [userName, setUserName] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState(false)

  const [formData, setFormData] = useState<CreateIncidentInput>({
    resolution_date: new Date().toISOString().split('T')[0],
    attention_datetime: new Date().toISOString(),
    attended_user: '',
    title: '',
    problem_description: '',
    actions_taken: '',
    affected_tool: '',
    responsible: '',
    observations: '',
  })

  useEffect(() => {
    const fetchUserName = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user && user.user_metadata && user.user_metadata.name) {
        setUserName(user.user_metadata.name)
        setFormData((prev) => ({
          ...prev,
          responsible: user.user_metadata.name,
        }))
      }
    }
    fetchUserName()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleResolutionDateChange = (date: Date | null) => {
    const dateString = date
      ? date.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
    setFormData((prev) => ({ ...prev, resolution_date: dateString }))
  }

  const handleAttentionDateTimeChange = (date: Date | null) => {
    if (!date) return
    setFormData((prev) => ({ ...prev, attention_datetime: date.toISOString() }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      if (!formData.attention_datetime) throw new Error('Falta la hora de atención.')
      if (!formData.attended_user.trim()) throw new Error('Falta el usuario atendido.')

      await createIncident(formData)

      setFormData({
        resolution_date: new Date().toISOString().split('T')[0],
        attention_datetime: new Date().toISOString(),
        attended_user: '',
        title: '',
        problem_description: '',
        actions_taken: '',
        affected_tool: '',
        responsible: userName,
        observations: '',
      })

      setSuccess(true)
      setIsExpanded(false)
      onSuccess()
      
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ marginBottom: '32px' }}>
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          paddingBottom: isExpanded ? '20px' : '0',
          borderBottom: isExpanded ? '1px solid var(--border-light)' : 'none',
          marginBottom: isExpanded ? '20px' : '0',
          transition: 'all var(--transition-normal)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            boxShadow: 'var(--shadow-glow)'
          }}>
            +
          </div>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: '18px', 
              fontWeight: 600 
            }}>
              Nuevo Registro
            </h2>
            <p style={{ 
              margin: '2px 0 0', 
              fontSize: '13px', 
              color: 'var(--text-secondary)' 
            }}>
              Registrar una nueva incidencia
            </p>
          </div>
        </div>
        <div style={{
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform var(--transition-fast)',
          color: 'var(--text-secondary)',
          fontSize: '20px'
        }}>
          ▼
        </div>
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="animate-fade-in">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            <div>
              <label>Fecha de cierre</label>
              <DatePicker
                selected={new Date(formData.resolution_date)}
                onChange={handleResolutionDateChange}
                dateFormat="yyyy-MM-dd"
                locale={es}
                className="custom-datepicker"
                calendarClassName="custom-calendar"
              />
            </div>

            <div>
              <label>Técnico asignado</label>
              <input
                type="text"
                value={formData.responsible}
                disabled
                style={{ cursor: 'not-allowed', opacity: 0.7, fontWeight: 600 }}
              />
            </div>

            <div>
              <label>Fecha y hora de atención *</label>
              <DatePicker
                selected={new Date(formData.attention_datetime)}
                onChange={handleAttentionDateTimeChange}
                dateFormat="yyyy-MM-dd HH:mm"
                locale={es}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                timeCaption="Hora"
                className="custom-datepicker"
                calendarClassName="custom-calendar"
              />
            </div>

            <div>
              <label>Usuario atendido *</label>
              <input
                type="text"
                name="attended_user"
                placeholder="Nombre del usuario"
                value={formData.attended_user}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Título breve *</label>
            <input
              type="text"
              name="title"
              placeholder="Resumen del problema"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Sistema afectado *</label>
            <input
              type="text"
              name="affected_tool"
              placeholder="Herramienta o sistema"
              value={formData.affected_tool}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Descripción del problema *</label>
            <textarea
              name="problem_description"
              placeholder="¿Cuál fue el problema?"
              value={formData.problem_description}
              onChange={handleChange}
              required
              rows={3}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Acciones realizadas *</label>
            <textarea
              name="actions_taken"
              placeholder="Pasos realizados para resolver"
              value={formData.actions_taken}
              onChange={handleChange}
              required
              rows={3}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label>Observaciones finales</label>
            <textarea
              name="observations"
              placeholder="Notas adicionales o recomendaciones"
              value={formData.observations}
              onChange={handleChange}
              rows={2}
            />
          </div>

          {error && (
            <div style={{ 
              color: 'var(--color-error)', 
              marginBottom: '16px', 
              fontSize: '13px',
              padding: '12px',
              background: 'var(--color-error-bg)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠</span> {error}
            </div>
          )}

          {success && (
            <div style={{ 
              color: 'var(--color-success)', 
              marginBottom: '16px', 
              fontSize: '13px',
              padding: '12px',
              background: 'var(--color-success-bg)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>✓</span> Incidencia registrada correctamente
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Guardando...' : 'Guardar incidencia'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
