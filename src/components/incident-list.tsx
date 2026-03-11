'use client'

import { useState, useEffect, useMemo } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { es } from 'date-fns/locale'
import { Incident } from '@/lib/types'
import { getIncidents } from '@/lib/incidents'
import IncidentDetail from './incident-detail'

interface IncidentListProps {
  refreshTrigger: number
}

type SortDir = 'desc' | 'asc'

function toTime(value: string | null | undefined): number | null {
  if (!value) return null
  const t = new Date(value).getTime()
  return Number.isFinite(t) ? t : null
}

function formatDate(value: string | null | undefined) {
  if (!value) return '-'
  const d = new Date(value)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('es-CL')
}

function formatTime(value: string | null | undefined) {
  if (!value) return '-'
  const d = new Date(value)
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

export default function IncidentList({ refreshTrigger }: IncidentListProps) {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState<Date | null>(null)
  const [dateTo, setDateTo] = useState<Date | null>(null)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const loadIncidents = async () => {
    setLoading(true)
    setListError(null)
    try {
      const data = await getIncidents(
        searchTerm,
        dateFrom ? dateFrom.toISOString().split('T')[0] : null,
        dateTo ? dateTo.toISOString().split('T')[0] : null
      )
      setIncidents(data || [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar incidencias'
      setListError(msg)
      setIncidents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIncidents()
  }, [searchTerm, dateFrom, dateTo, refreshTrigger])

  const orderedIncidents = useMemo(() => {
    const copy = [...incidents]
    copy.sort((a, b) => {
      const ta = toTime(a.attention_datetime)
      const tb = toTime(b.attention_datetime)

      if (ta === null && tb === null) return 0
      if (ta === null) return 1
      if (tb === null) return -1

      return sortDir === 'desc' ? tb - ta : ta - tb
    })
    return copy
  }, [incidents, sortDir])

  const clearFilters = () => {
    setSearchTerm('')
    setDateFrom(null)
    setDateTo(null)
  }

  const hasFilters = searchTerm || dateFrom || dateTo

  return (
    <div className="card">
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-elevated)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            📋
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
              Historial de Incidencias
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              {orderedIncidents.length} registro{orderedIncidents.length !== 1 ? 's' : ''} encontrado{orderedIncidents.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <button
          onClick={() => setSortDir((v) => (v === 'desc' ? 'asc' : 'desc'))}
          className="btn btn-secondary"
          style={{ fontSize: '13px' }}
        >
          <span style={{ transform: sortDir === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block', transition: 'transform var(--transition-fast)' }}>
            ↑
          </span>
          {sortDir === 'desc' ? 'Más recientes' : 'Más antiguos'}
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
          padding: '20px',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)'
        }}
      >
        <div>
          <label>Buscar</label>
          <input
            type="text"
            placeholder="Título, sistema, responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <label>Desde</label>
          <DatePicker
            selected={dateFrom}
            onChange={(date: Date | null) => setDateFrom(date)}
            dateFormat="yyyy-MM-dd"
            locale={es}
            isClearable
            placeholderText="Desde"
            className="custom-datepicker"
            calendarClassName="custom-calendar"
          />
        </div>

        <div>
          <label>Hasta</label>
          <DatePicker
            selected={dateTo}
            onChange={(date: Date | null) => setDateTo(date)}
            dateFormat="yyyy-MM-dd"
            locale={es}
            isClearable
            placeholderText="Hasta"
            className="custom-datepicker"
            calendarClassName="custom-calendar"
          />
        </div>

        {hasFilters && (
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={clearFilters}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ 
          padding: '60px', 
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 12px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p>Cargando incidencias...</p>
        </div>
      ) : listError ? (
        <div style={{ 
          padding: '24px', 
          textAlign: 'center',
          background: 'var(--color-error-bg)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-error)'
        }}>
          <p style={{ margin: 0, color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span>⚠</span> {listError}
          </p>
          <button
            onClick={loadIncidents}
            className="btn btn-secondary"
            style={{ marginTop: '16px' }}
          >
            Reintentar
          </button>
        </div>
      ) : orderedIncidents.length === 0 ? (
        <div style={{ 
          padding: '60px', 
          textAlign: 'center',
          color: 'var(--text-secondary)'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            opacity: 0.5
          }}>
            📭
          </div>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>
            {hasFilters ? 'No se encontraron resultados' : 'No hay incidencias registradas'}
          </p>
          <p style={{ fontSize: '13px', opacity: 0.7 }}>
            {hasFilters ? 'Intenta con otros filtros' : 'Crea tu primera incidencia arriba'}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Usuario</th>
                <th>Título</th>
                <th>Sistema</th>
                <th>Responsable</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {orderedIncidents.map((incident) => (
                <tr key={incident.id}>
                  <td>
                    <span style={{ 
                      display: 'inline-block',
                      padding: '4px 10px',
                      background: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '13px'
                    }}>
                      {formatDate(incident.attention_datetime)}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {formatTime(incident.attention_datetime)}
                  </td>
                  <td>{incident.attended_user || '-'}</td>
                  <td>
                    <span style={{ fontWeight: 500 }}>
                      {incident.title}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      background: 'rgba(0, 166, 128, 0.15)',
                      color: 'var(--accent-primary)',
                      borderRadius: '20px',
                      fontSize: '12px'
                    }}>
                      {incident.affected_tool}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {incident.responsible}
                  </td>
                  <td>
                    <button
                      onClick={() => setSelectedIncident(incident)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedIncident && (
        <IncidentDetail
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onUpdate={() => {
            loadIncidents()
            setSelectedIncident(null)
          }}
        />
      )}
    </div>
  )
}
