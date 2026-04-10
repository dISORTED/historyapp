'use client'

import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { es } from 'date-fns/locale'
import { parseStoredDate, toDateKey, toLocalDateValue, toSortableTimestamp } from '@/lib/date-utils'
import { Incident } from '@/lib/types'
import { getIncidents } from '@/lib/incidents'
import IncidentDetail from './incident-detail'

interface IncidentListProps {
  refreshTrigger: number
}

type SortDir = 'desc' | 'asc'

function getTimelineValue(incident: Incident) {
  return incident.attention_datetime || incident.resolution_date
}

function formatDate(value: string | null | undefined) {
  const parsed = parseStoredDate(value)
  return parsed ? parsed.toLocaleDateString('es-CL') : '-'
}

function formatTime(value: string | null | undefined) {
  const parsed = parseStoredDate(value)
  return parsed ? parsed.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '-'
}

function toSearchableString(incident: Incident) {
  return [
    incident.ticket_code,
    incident.title,
    incident.problem_description,
    incident.actions_taken,
    incident.affected_tool,
    incident.responsible,
    incident.attended_user,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export default function IncidentList({ refreshTrigger }: IncidentListProps) {
  const [allIncidents, setAllIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState<Date | null>(null)
  const [dateTo, setDateTo] = useState<Date | null>(null)
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  const deferredSearchTerm = useDeferredValue(searchTerm)

  const loadIncidents = async () => {
    setLoading(true)
    setListError(null)
    try {
      const data = await getIncidents()
      setAllIncidents(data || [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar incidencias'
      setListError(msg)
      setAllIncidents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIncidents()
  }, [refreshTrigger])

  const filteredIncidents = useMemo(() => {
    const normalizedSearch = deferredSearchTerm.trim().toLowerCase()
    const fromKey = dateFrom ? toLocalDateValue(dateFrom) : ''
    const toKey = dateTo ? toLocalDateValue(dateTo) : ''

    return allIncidents.filter((incident) => {
      if (normalizedSearch && !toSearchableString(incident).includes(normalizedSearch)) return false

      const timelineDateKey = toDateKey(getTimelineValue(incident))
      if (fromKey && (!timelineDateKey || timelineDateKey < fromKey)) return false
      if (toKey && (!timelineDateKey || timelineDateKey > toKey)) return false

      return true
    })
  }, [allIncidents, deferredSearchTerm, dateFrom, dateTo])

  const orderedIncidents = useMemo(() => {
    const copy = [...filteredIncidents]
    copy.sort((a, b) => {
      const ta = toSortableTimestamp(getTimelineValue(a))
      const tb = toSortableTimestamp(getTimelineValue(b))

      if (ta === null && tb === null) return 0
      if (ta === null) return 1
      if (tb === null) return -1

      return sortDir === 'desc' ? tb - ta : ta - tb
    })
    return copy
  }, [filteredIncidents, sortDir])

  useEffect(() => {
    setCurrentPage(1)
  }, [deferredSearchTerm, dateFrom, dateTo, sortDir, refreshTrigger])

  const totalPages = Math.max(1, Math.ceil(orderedIncidents.length / pageSize))

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const pageStart = (currentPage - 1) * pageSize
  const paginatedIncidents = orderedIncidents.slice(pageStart, pageStart + pageSize)
  const shownFrom = orderedIncidents.length === 0 ? 0 : pageStart + 1
  const shownTo = Math.min(pageStart + pageSize, orderedIncidents.length)

  const clearFilters = () => {
    setSearchTerm('')
    setDateFrom(null)
    setDateTo(null)
  }

  const hasFilters = searchTerm || dateFrom || dateTo

  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-soft)',
              border: '1px solid #c7ddf2',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            H
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Historial de incidencias</h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              {orderedIncidents.length} registro{orderedIncidents.length !== 1 ? 's' : ''} encontrado
              {orderedIncidents.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <button
          onClick={() => setSortDir((v) => (v === 'desc' ? 'asc' : 'desc'))}
          className="btn btn-secondary"
          style={{ fontSize: '13px' }}
        >
          {sortDir === 'desc' ? 'Mas recientes' : 'Mas antiguos'}
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '22px',
          padding: '16px',
          background: 'var(--bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
        }}
      >
        <div>
          <label>Buscar</label>
          <input
            type="text"
            placeholder="Ticket, titulo, sistema, responsable..."
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
            <button onClick={clearFilters} className="btn btn-secondary" style={{ width: '100%' }}>
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '52px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              border: '3px solid var(--border-color)',
              borderTopColor: 'var(--accent-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 12px',
            }}
          />
          <p>Cargando incidencias...</p>
        </div>
      ) : listError ? (
        <div
          style={{
            padding: '22px',
            textAlign: 'center',
            background: 'var(--color-error-bg)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid #f2c6ca',
          }}
        >
          <p style={{ margin: 0, color: 'var(--color-error)' }}>{listError}</p>
          <button onClick={loadIncidents} className="btn btn-secondary" style={{ marginTop: '16px' }}>
            Reintentar
          </button>
        </div>
      ) : orderedIncidents.length === 0 ? (
        <div style={{ padding: '52px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>
            {hasFilters ? 'No se encontraron resultados' : 'No hay incidencias registradas'}
          </p>
          <p style={{ fontSize: '13px', opacity: 0.75 }}>{hasFilters ? 'Intenta con otros filtros' : 'Crea tu primera incidencia arriba'}</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '12px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              Mostrando {shownFrom}-{shownTo} de {orderedIncidents.length} registros filtrados
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Usuario</th>
                  <th>Titulo</th>
                  <th>Sistema</th>
                  <th>Responsable</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {paginatedIncidents.map((incident) => (
                  <tr key={incident.id}>
                    <td>
                      <span className="badge badge-info" style={{ whiteSpace: 'nowrap' }}>
                        {incident.ticket_code || incident.id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          background: 'var(--bg-elevated)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '13px',
                        }}
                      >
                        {formatDate(getTimelineValue(incident))}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {incident.attention_datetime ? formatTime(incident.attention_datetime) : '-'}
                    </td>
                    <td>{incident.attended_user || '-'}</td>
                    <td>
                      <span style={{ fontWeight: 700 }}>{incident.title}</span>
                    </td>
                    <td>
                      <span className="badge badge-info">{incident.affected_tool}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{incident.responsible}</td>
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

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              marginTop: '14px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <label style={{ margin: 0 }}>Filas por pagina</label>
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value))
                  setCurrentPage(1)
                }}
                style={{ width: '84px', padding: '8px 10px' }}
              >
                <option value={12}>12</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Pagina {currentPage} de {totalPages}
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </button>
            </div>
          </div>
        </>
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
