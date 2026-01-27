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

type SortDir = 'desc' | 'asc' // desc = más reciente primero

// ✅ Convierte string|null a timestamp seguro
// null/fecha inválida -> null (para mandarla al final)
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
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState<Date | null>(null)
  const [dateTo, setDateTo] = useState<Date | null>(null)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)

  // ✅ Toggle de orden por hora de atención
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const loadIncidents = async () => {
    setLoading(true)
    try {
      const data = await getIncidents(
        searchTerm,
        dateFrom ? dateFrom.toISOString().split('T')[0] : null,
        dateTo ? dateTo.toISOString().split('T')[0] : null
      )
      setIncidents(data || [])
    } catch (err) {
      console.error('Error al cargar incidencias:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIncidents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, dateFrom, dateTo, refreshTrigger])

  // ✅ Orden aplicado en memoria (no muta estado)
  // null/invalid -> al final siempre
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

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <h2 style={{ margin: 0 }}>Historial de Incidencias</h2>

        <button
          onClick={() => setSortDir((v) => (v === 'desc' ? 'asc' : 'desc'))}
          style={{
            padding: '8px 12px',
            background: 'transparent',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          title="Cambiar orden por hora de atención"
        >
          Orden: {sortDir === 'desc' ? 'Reciente → Antigua' : 'Antigua → Reciente'}
          <span style={{ opacity: 0.9 }}>{sortDir === 'desc' ? '↓' : '↑'}</span>
        </button>
      </div>

      <div
        style={{
          background: 'var(--bg-card)',
          padding: '15px',
          marginTop: '14px',
          marginBottom: '20px',
          borderRadius: '4px',
          border: '1px solid var(--border-color)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
        }}
      >
        <div>
          <label>Buscar</label>
          <input
            type="text"
            placeholder="Título, sistema, responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div>
          <label>Desde</label>
          <DatePicker
            selected={dateFrom}
            onChange={(date) => setDateFrom(date)}
            dateFormat="yyyy-MM-dd"
            locale={es}
            isClearable
            placeholderText="Desde"
            className="custom-datepicker"
          />
        </div>

        <div>
          <label>Hasta</label>
          <DatePicker
            selected={dateTo}
            onChange={(date) => setDateTo(date)}
            dateFormat="yyyy-MM-dd"
            locale={es}
            isClearable
            placeholderText="Hasta"
            className="custom-datepicker"
          />
        </div>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora atención</th>
                <th>Usuario atendido</th>
                <th>Título</th>
                <th>Sistema</th>
                <th>Responsable</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {orderedIncidents.map((incident) => (
                <tr key={incident.id}>
                  <td>{formatDate(incident.attention_datetime)}</td>
                  <td>{formatTime(incident.attention_datetime)}</td>
                  <td>{incident.attended_user || '-'}</td>
                  <td>{incident.title}</td>
                  <td>{incident.affected_tool}</td>
                  <td>{incident.responsible}</td>
                  <td>
                    <button onClick={() => setSelectedIncident(incident)}>Ver</button>
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
