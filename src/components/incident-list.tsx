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

  // ✅ Orden aplicado en memoria (no muta el estado)
  const orderedIncidents = useMemo(() => {
    const copy = [...incidents]
    copy.sort((a, b) => {
      const da = new Date(a.attention_datetime).getTime()
      const db = new Date(b.attention_datetime).getTime()
      return sortDir === 'desc' ? db - da : da - db
    })
    return copy
  }, [incidents, sortDir])

  const formatDate = (date: string) => new Date(date).toLocaleDateString('es-CL')

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    })

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
