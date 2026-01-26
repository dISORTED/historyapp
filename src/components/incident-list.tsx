'use client'

import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { es } from 'date-fns/locale'
import { Incident } from '@/lib/types'
import { getIncidents } from '@/lib/incidents'
import IncidentDetail from './incident-detail'

interface IncidentListProps {
  refreshTrigger: number
}

export default function IncidentList({ refreshTrigger }: IncidentListProps) {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState<Date | null>(null)
  const [dateTo, setDateTo] = useState<Date | null>(null)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)

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

  return (
    <div>
      <h2>Historial de Incidencias</h2>

      <style jsx global>{`
        /* Asegura que el DatePicker ocupe todo el ancho del grid */
        .react-datepicker-wrapper,
        .react-datepicker__input-container {
          width: 100%;
        }

        /* Estilo del input del DatePicker (antes lo estabas poniendo con prop style) */
        .custom-datepicker {
          width: 100%;
          padding: 8px;
          box-sizing: border-box;
        }
      `}</style>

      <div
        style={{
          background: 'var(--bg-card)',
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '4px',
          border: '1px solid var(--border-color)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
        }}
      >
        <div>
          <label>Buscar (palabra clave)</label>
          <input
            type="text"
            placeholder="Título, sistema, responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
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
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : incidents.length === 0 ? (
        <p>No hay incidencias registradas</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px',
            }}
          >
            <thead>
              <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Fecha</th>
                <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Título</th>
                <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Sistema</th>
                <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Responsable</th>
                <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Problema</th>
                <th style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold' }}>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {incidents.map((incident) => (
                <tr
                  key={incident.id}
                  style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)' }}
                >
                  <td style={{ padding: '10px' }}>
                    {new Date(incident.resolution_date).toLocaleDateString('es-ES')}
                  </td>

                  <td style={{ padding: '10px', fontWeight: '500' }}>{incident.title}</td>
                  <td style={{ padding: '10px' }}>{incident.affected_tool}</td>
                  <td style={{ padding: '10px' }}>{incident.responsible}</td>

                  <td
                    style={{
                      padding: '10px',
                      maxWidth: '300px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={incident.problem_description}
                  >
                    {incident.problem_description}
                  </td>

                  <td style={{ padding: '10px' }}>
                    <button
                      onClick={() => setSelectedIncident(incident)}
                      style={{
                        color: 'var(--accent-primary)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontSize: '13px',
                      }}
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
