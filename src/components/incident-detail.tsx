'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Incident } from '@/lib/types'
import { deleteIncident, updateIncident } from '@/lib/incidents'
import { CreateIncidentInput } from '@/lib/types'

interface IncidentDetailProps {
  incident: Incident
  onClose: () => void
  onUpdate: () => void
}

export default function IncidentDetail({ incident, onClose, onUpdate }: IncidentDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        const user = session?.user
        if (user) {
          setIsOwner(user.user_metadata?.name === incident.responsible)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        if (/abort/i.test(message)) return
      }
    }
    fetchUser()
  }, [incident.responsible])

  const [formData, setFormData] = useState<Partial<CreateIncidentInput>>({
    resolution_date: incident.resolution_date,
    title: incident.title,
    problem_description: incident.problem_description,
    actions_taken: incident.actions_taken,
    affected_tool: incident.affected_tool,
    observations: incident.observations,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setError(null)
    setIsSaving(true)

    try {
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
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px',
          maxWidth: '640px',
          maxHeight: '85vh',
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
            marginBottom: '24px',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--border-light)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              📋
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
              {isEditing ? 'Editar incidencia' : 'Detalles de incidencia'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '4px',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {isEditing ? (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '20px',
              }}
            >
              <div>
                <label>Fecha de resolución</label>
                <input type="date" name="resolution_date" value={formData.resolution_date} onChange={handleChange} />
              </div>

              <div>
                <label>Responsable</label>
                <input type="text" value={incident.responsible} disabled style={{ opacity: 0.7, cursor: 'not-allowed' }} />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label>Título</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label>Sistema afectado</label>
              <input type="text" name="affected_tool" value={formData.affected_tool} onChange={handleChange} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label>Descripción del problema</label>
              <textarea name="problem_description" value={formData.problem_description} onChange={handleChange} rows={4} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label>Acciones realizadas</label>
              <textarea name="actions_taken" value={formData.actions_taken} onChange={handleChange} rows={4} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label>Observaciones</label>
              <textarea name="observations" value={formData.observations} onChange={handleChange} rows={2} />
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>⚠</span> {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Ticket
                </p>
                <p style={{ margin: 0, fontWeight: 500 }}>{incident.ticket_code || incident.id.slice(0, 8).toUpperCase()}</p>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Fecha
                </p>
                <p style={{ margin: 0, fontWeight: 500 }}>{new Date(incident.resolution_date).toLocaleDateString('es-CL')}</p>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Sistema
                </p>
                <p style={{ margin: 0, fontWeight: 500 }}>{incident.affected_tool}</p>
              </div>

              <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Responsable
                </p>
                <p style={{ margin: 0, fontWeight: 500 }}>{incident.responsible}</p>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600 }}>{incident.title}</h3>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label>Problema</label>
              <div
                style={{
                  padding: '16px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.6,
                }}
              >
                {incident.problem_description}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label>Acciones realizadas</label>
              <div
                style={{
                  padding: '16px',
                  background: 'var(--bg-elevated)',
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
              <div style={{ marginBottom: '24px' }}>
                <label>Observaciones</label>
                <div
                  style={{
                    padding: '16px',
                    background: 'var(--bg-elevated)',
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>⚠</span> {error}
              </div>
            )}

            {showDeleteConfirm ? (
              <div
                style={{
                  padding: '20px',
                  background: 'var(--color-error-bg)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-error)',
                  marginBottom: '20px',
                }}
              >
                <p style={{ margin: '0 0 16px', fontSize: '14px', textAlign: 'center' }}>
                  ¿Estás seguro de que deseas eliminar esta incidencia? Esta acción no se puede deshacer.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button onClick={handleDelete} disabled={isDeleting} className="btn btn-danger">
                    {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {!isOwner && (
                  <div
                    style={{
                      padding: '12px 16px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: 'var(--text-secondary)',
                      fontSize: '13px',
                    }}
                  >
                    <span>ℹ️</span>
                    Solo {incident.responsible} puede editar esta incidencia
                  </div>
                )}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
