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

// Convierte Date -> value para <input type="datetime-local"> en horario local
function toDatetimeLocalValue(date: Date) {
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm
}

export default function IncidentForm({ onSuccess }: IncidentFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')

  const [formData, setFormData] = useState<CreateIncidentInput>({
    // Se mantiene por compatibilidad (si lo ocupas como "fecha de cierre")
    resolution_date: new Date().toISOString().split('T')[0],

    // NUEVOS
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

  const handleAttentionDatetimeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const v = e.target.value // YYYY-MM-DDTHH:mm (local)
    if (!v) return
    const iso = new Date(v).toISOString()
    setFormData((prev) => ({ ...prev, attention_datetime: iso }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
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

      onSuccess()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginBottom: '30px',
        background: 'var(--bg-card)',
        padding: '20px',
        borderRadius: '10px',
        border: '1px solid var(--border-color)',
      }}
    >
      <style jsx global>{`
        /* === Base look para inputs (consistente con el resto de la UI) === */
        .ti-input,
        .ti-textarea,
        .ti-datetime {
          width: 100%;
          padding: 10px 12px;
          box-sizing: border-box;
          background: var(--bg-card);
          color: var(--text-main, var(--text-primary));
          border: 1px solid var(--border-default, var(--border-color));
          border-radius: 8px;
          outline: none;
          font-size: 13px;
          transition: border-color 120ms ease, box-shadow 120ms ease, background 120ms ease;
          min-height: 40px;
        }

        .ti-textarea {
          min-height: auto;
          resize: vertical;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          font-size: 12.5px;
          line-height: 1.4;
        }

        .ti-input:focus,
        .ti-textarea:focus,
        .ti-datetime:focus,
        .custom-datepicker:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(46, 229, 157, 0.18);
        }

        .ti-input::placeholder,
        .ti-textarea::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }

        /* DatePicker ocupa todo el ancho */
        .react-datepicker-wrapper,
        .react-datepicker__input-container {
          width: 100%;
        }

        /* Estilo del input del DatePicker */
        .custom-datepicker {
          width: 100%;
          padding: 10px 12px;
          box-sizing: border-box;
          background: var(--bg-card);
          color: var(--text-main, var(--text-primary));
          border: 1px solid var(--border-default, var(--border-color));
          border-radius: 8px;
          outline: none;
          font-size: 13px;
          min-height: 40px;
        }

        /* datetime-local: algunos navegadores ponen fondo raro al ícono */
        .ti-datetime::-webkit-calendar-picker-indicator {
          opacity: 0.85;
          cursor: pointer;
          filter: invert(1);
        }

        /* Quita estilos “claros” por autofill */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: var(--text-main, var(--text-primary));
          -webkit-box-shadow: 0 0 0px 1000px var(--bg-card) inset;
          transition: background-color 9999s ease-in-out 0s;
        }
      `}</style>

      <h2 style={{ marginBottom: '14px' }}>Nuevo Registro de Incidencia</h2>

      {/* BLOQUE SUPERIOR: FECHA + HORA + USUARIO + TÉCNICO */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '14px',
        }}
      >
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Fecha de cierre (opcional)
          </label>
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
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Técnico asignado
          </label>
          <input
            type="text"
            value={formData.responsible}
            disabled
            className="ti-input"
            style={{ cursor: 'not-allowed', opacity: 1, fontWeight: 600 }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Hora de atención
          </label>
          <input
            type="datetime-local"
            value={toDatetimeLocalValue(new Date(formData.attention_datetime))}
            onChange={handleAttentionDatetimeChange}
            required
            className="ti-datetime"
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            Usuario atendido
          </label>
          <input
            type="text"
            name="attended_user"
            placeholder="Nombre del usuario atendido"
            value={formData.attended_user}
            onChange={handleChange}
            required
            className="ti-input"
          />
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          Título breve
        </label>
        <input
          type="text"
          name="title"
          placeholder="Descripción corta del problema"
          value={formData.title}
          onChange={handleChange}
          required
          className="ti-input"
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          Sistema afectado
        </label>
        <input
          type="text"
          name="affected_tool"
          placeholder="Herramienta o sistema"
          value={formData.affected_tool}
          onChange={handleChange}
          required
          className="ti-input"
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          Descripción del problema
        </label>
        <textarea
          name="problem_description"
          placeholder="¿Cuál fue el problema?"
          value={formData.problem_description}
          onChange={handleChange}
          required
          rows={3}
          className="ti-textarea"
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          Acciones realizadas
        </label>
        <textarea
          name="actions_taken"
          placeholder="Pasos específicos realizados para resolver"
          value={formData.actions_taken}
          onChange={handleChange}
          required
          rows={3}
          className="ti-textarea"
        />
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          Observaciones finales
        </label>
        <textarea
          name="observations"
          placeholder="Notas adicionales o recomendaciones"
          value={formData.observations}
          onChange={handleChange}
          rows={2}
          className="ti-textarea"
        />
      </div>

      {error && (
        <div style={{ color: 'var(--color-error)', marginBottom: '12px', fontSize: '13px' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '10px 18px',
          background: 'var(--accent-primary)',
          color: 'var(--bg-main)',
          border: 'none',
          borderRadius: '10px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 800,
          fontSize: '13px',
        }}
      >
        {loading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  )
}
