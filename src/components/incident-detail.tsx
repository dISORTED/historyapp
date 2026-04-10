'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { fromDateTimeLocalInputValue, parseStoredDate, toDateTimeLocalInputValue } from '@/lib/date-utils'
import { Incident } from '@/lib/types'
import { deleteIncident, updateIncident } from '@/lib/incidents'
import { CreateIncidentInput } from '@/lib/types'

interface IncidentDetailProps {
  incident: Incident
  onClose: () => void
  onUpdate: () => void
}

function createInitialFormData(incident: Incident): Partial<CreateIncidentInput> {
  return {
    resolution_date: incident.resolution_date,
    attention_datetime: incident.attention_datetime || '',
    attended_user: incident.attended_user || '',
    title: incident.title,
    problem_description: incident.problem_description,
    actions_taken: incident.actions_taken,
    affected_tool: incident.affected_tool,
    observations: incident.observations,
  }
}

export default function IncidentDetail({ incident, onClose, onUpdate }: IncidentDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [formData, setFormData] = useState<Partial<CreateIncidentInput>>(() => createInitialFormData(incident))

  useEffect(() => {
    setFormData(createInitialFormData(incident))
    setIsEditing(false)
    setShowDeleteConfirm(false)
    setError(null)
  }, [incident])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const user = session?.user
        if (user) setIsOwner(user.id === incident.user_id)
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        if (/abort/i.test(message)) return
      }
    }
    fetchUser()
  }, [incident.user_id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setError(null)
    setIsSaving(true)

    try {
      if (!formData.attention_datetime) throw new Error('Falta la fecha y hora de atencion.')
      if (!formData.attended_user?.trim()) throw new Error('Falta el usuario atendido.')

      await updateIncident(incident.id, formData)
      setIsEditing(false)
      onUpdate()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setError(null)
    setIsDeleting(true)

    try {
      await deleteIncident(incident.id)
      onUpdate()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(16, 34, 58, 0.42)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-xl)',
          padding: '26px',
          maxWidth: '700px',
          maxHeight: '88vh',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-lg)',
          width: '100%',
        }}
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in"
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '16px',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div>
            <p style={{ margin: 0 }} className="badge badge-info">
              Detalle de incidencia
            </p>
            <h2 style={{ margin: '10px 0 0', fontSize: '20px', fontWeight: 800 }}>
              {isEditing ? 'Editar incidencia' : 'Revision del caso'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}
          >
            X
          </button>
        </div>

        {isEditing ? (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '18px',
                marginBottom: '20px',
              }}
            >
              <div>
                <label>Fecha de resolucion</label>
                <input type="date" name="resolution_date" value={formData.resolution_date} onChange={handleChange} />
              </div>

              <div>
                <label>Fecha y hora de atencion</label>
                <input
                  type="datetime-local"
                  value={toDateTimeLocalInputValue(formData.attention_datetime)}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, attention_datetime: fromDateTimeLocalInputValue(e.target.value) }))
                  }
                />
              </div>

              <div>
                <label>Responsable</label>
                <input type="text" value={incident.responsible} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
              </div>

              <div>
                <label>Usuario atendido</label>
                <input type="text" name="attended_user" value={formData.attended_user} onChange={handleChange} />
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label>Titulo</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label>Sistema afectado</label>
              <input type="text" name="affected_tool" value={formData.affected_tool} onChange={handleChange} />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label>Descripcion del problema</label>
              <textarea name="problem_description" value={formData.problem_description} onChange={handleChange} rows={4} />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label>Acciones realizadas</label>
              <textarea name="actions_taken" value={formData.actions_taken} onChange={handleChange} rows={4} />
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label>Observaciones</label>
              <textarea name="observations" value={formData.observations} onChange={handleChange} rows={3} />
            </div>

            {error && (
              <div
                style={{
                  color: 'var(--color-error)',
                  marginBottom: '16px',
                  fontSize: '13px',
                  padding: '12px',
                  background: 'var(--color-error-bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #f2c6ca',
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setIsEditing(false)} className="btn btn-secondary">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={isSaving} className="btn btn-primary">
                {isSaving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                marginBottom: '20px',
              }}
            >
              <div className="card" style={{ padding: '14px', background: 'var(--bg-elevated)', boxShadow: 'none' }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ticket</p>
                <p style={{ margin: 0, fontWeight: 700 }}>{incident.ticket_code || incident.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="card" style={{ padding: '14px', background: 'var(--bg-elevated)', boxShadow: 'none' }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Fecha</p>
                <p style={{ margin: 0, fontWeight: 700 }}>
                  {parseStoredDate(incident.attention_datetime || incident.resolution_date)?.toLocaleDateString('es-CL') || '-'}
                </p>
              </div>
              <div className="card" style={{ padding: '14px', background: 'var(--bg-elevated)', boxShadow: 'none' }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hora</p>
                <p style={{ margin: 0, fontWeight: 700 }}>
                  {incident.attention_datetime
                    ? parseStoredDate(incident.attention_datetime)?.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) ||
                      '-'
                    : '-'}
                </p>
              </div>
              <div className="card" style={{ padding: '14px', background: 'var(--bg-elevated)', boxShadow: 'none' }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sistema</p>
                <p style={{ margin: 0, fontWeight: 700 }}>{incident.affected_tool}</p>
              </div>
              <div className="card" style={{ padding: '14px', background: 'var(--bg-elevated)', boxShadow: 'none' }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Responsable</p>
                <p style={{ margin: 0, fontWeight: 700 }}>{incident.responsible}</p>
              </div>
              <div className="card" style={{ padding: '14px', background: 'var(--bg-elevated)', boxShadow: 'none' }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Usuario atendido
                </p>
                <p style={{ margin: 0, fontWeight: 700 }}>{incident.attended_user || '-'}</p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800 }}>{incident.title}</h3>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label>Problema</label>
              <div
                style={{
                  padding: '14px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                }}
              >
                {incident.problem_description}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label>Acciones realizadas</label>
              <div
                style={{
                  padding: '14px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                }}
              >
                {incident.actions_taken}
              </div>
            </div>

            {incident.observations && (
              <div style={{ marginBottom: '20px' }}>
                <label>Observaciones</label>
                <div
                  style={{
                    padding: '14px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '14px',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                  }}
                >
                  {incident.observations}
                </div>
              </div>
            )}

            {error && (
              <div
                style={{
                  color: 'var(--color-error)',
                  marginBottom: '16px',
                  fontSize: '13px',
                  padding: '12px',
                  background: 'var(--color-error-bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #f2c6ca',
                }}
              >
                {error}
              </div>
            )}

            {showDeleteConfirm ? (
              <div
                style={{
                  padding: '18px',
                  background: 'var(--color-error-bg)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid #f2c6ca',
                  marginBottom: '16px',
                }}
              >
                <p style={{ margin: '0 0 14px', fontSize: '14px', textAlign: 'center' }}>
                  Esta accion eliminara la incidencia de forma permanente.
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button onClick={handleDelete} disabled={isDeleting} className="btn btn-danger">
                    {isDeleting ? 'Eliminando...' : 'Si, eliminar'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {!isOwner && (
                  <div
                    style={{
                      padding: '12px 14px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)',
                      marginBottom: '16px',
                      color: 'var(--text-secondary)',
                      fontSize: '13px',
                    }}
                  >
                    Solo el propietario original puede editar esta incidencia.
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-danger" disabled={!isOwner}>
                    Eliminar
                  </button>
                  <button onClick={() => setIsEditing(true)} className="btn btn-primary" disabled={!isOwner}>
                    Editar
                  </button>
                  <button onClick={onClose} className="btn btn-secondary">
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
