'use client'

import { useState } from 'react'
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
  const [formData, setFormData] = useState<Partial<CreateIncidentInput>>({
    resolution_date: incident.resolution_date,
    title: incident.title,
    problem_description: incident.problem_description,
    actions_taken: incident.actions_taken,
    affected_tool: incident.affected_tool,
    responsible: incident.responsible,
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
    if (!confirm('¿Eliminar esta incidencia? No se puede deshacer.')) return

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
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '30px',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Detalles de Incidencia</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            ✕
          </button>
        </div>

        {isEditing ? (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label>Fecha de resolución</label>
              <input
                type="date"
                name="resolution_date"
                value={formData.resolution_date}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label>Título</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label>Responsable</label>
              <input
                type="text"
                name="responsible"
                value={formData.responsible}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label>Sistema afectado</label>
              <input
                type="text"
                name="affected_tool"
                value={formData.affected_tool}
                onChange={handleChange}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label>Descripción del problema</label>
              <textarea
                name="problem_description"
                value={formData.problem_description}
                onChange={handleChange}
                rows={4}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', fontFamily: 'monospace', fontSize: '13px' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label>Acciones realizadas</label>
              <textarea
                name="actions_taken"
                value={formData.actions_taken}
                onChange={handleChange}
                rows={4}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', fontFamily: 'monospace', fontSize: '13px' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label>Observaciones</label>
              <textarea
                name="observations"
                value={formData.observations}
                onChange={handleChange}
                rows={2}
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box', fontFamily: 'monospace', fontSize: '13px' }}
              />
            </div>

            {error && <div style={{ color: 'red', marginBottom: '12px' }}>{error}</div>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: 'var(--color-success)',
                  color: 'var(--bg-main)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: '15px', fontSize: '13px', lineHeight: '1.8' }}>
              <p>
                <strong>Fecha:</strong> {new Date(incident.resolution_date).toLocaleDateString('es-ES')}
              </p>
              <p>
                <strong>Título:</strong> {incident.title}
              </p>
              <p>
                <strong>Responsable:</strong> {incident.responsible}
              </p>
              <p>
                <strong>Sistema:</strong> {incident.affected_tool}
              </p>
              <p style={{ marginTop: '10px' }}>
                <strong>Problema:</strong>
                <br />
                <span style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12px' }}>
                  {incident.problem_description}
                </span>
              </p>
              <p style={{ marginTop: '10px' }}>
                <strong>Acciones realizadas:</strong>
                <br />
                <span style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12px' }}>
                  {incident.actions_taken}
                </span>
              </p>
              {incident.observations && (
                <p style={{ marginTop: '10px' }}>
                  <strong>Observaciones:</strong>
                  <br />
                  <span style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '12px' }}>
                    {incident.observations}
                  </span>
                </p>
              )}
              <p style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                Creado: {new Date(incident.created_at).toLocaleString('es-ES')}
              </p>
            </div>

            {error && <div style={{ color: 'var(--color-error)', marginBottom: '12px', fontSize: '12px' }}>{error}</div>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--bg-main)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Editar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: 'var(--color-error)',
                  color: 'var(--bg-main)',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
