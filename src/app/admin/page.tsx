'use client'

import Link from 'next/link'
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import AuthComponent from '@/components/auth'
import AppShell from '@/components/app-shell'
import AdminKpiCards from '@/components/admin-kpi-cards'
import AdminTrendChart from '@/components/admin-trend-chart'
import AdminBreakdownChart from '@/components/admin-breakdown-chart'
import { parseStoredDate, toDateKey, toLocalDateValue, toSortableTimestamp } from '@/lib/date-utils'
import { getAdminIncidents } from '@/lib/incidents'
import { createClient, getSessionSnapshot } from '@/lib/supabase-client'
import { AdminKpiMetrics, Incident } from '@/lib/types'
import { isPrimaryAdmin, PRIMARY_ADMIN_EMAIL } from '@/lib/admin'

function getTimelineValue(incident: Incident) {
  return incident.attention_datetime || incident.resolution_date
}

function toHourLabel(value: string | null | undefined): string {
  const parsed = parseStoredDate(value)
  return parsed ? `${String(parsed.getHours()).padStart(2, '0')}:00` : ''
}

function toSearchableString(incident: Incident) {
  return [
    incident.ticket_code,
    incident.legacy_ticket_code,
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

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [allIncidents, setAllIncidents] = useState<Incident[]>([])

  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [technician, setTechnician] = useState('')
  const [affectedTool, setAffectedTool] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  const deferredSearchTerm = useDeferredValue(searchTerm)
  const isAdmin = isPrimaryAdmin(user)
  const mountedRef = useRef(true)

  const applyUserState = (nextUser: User | null) => {
    if (!mountedRef.current) return
    setUser(nextUser)
  }

  useEffect(() => {
    const loadSession = async () => {
      setLoadingSession(true)
      setError(null)

      try {
        const { session, error: sessionError, timedOut } = await getSessionSnapshot()

        if (sessionError) {
          setError(sessionError.message || 'No se pudo cargar la sesion')
          return
        }
        if (timedOut || session === undefined) return

        setUser(session?.user ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la sesion')
      } finally {
        setLoadingSession(false)
      }
    }

    loadSession()
  }, [])

  useEffect(() => {
    mountedRef.current = true

    const supabase = createClient()
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mountedRef.current) return

      if (
        event === 'INITIAL_SESSION' ||
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED' ||
        event === 'PASSWORD_RECOVERY'
      ) {
        setError(null)
        applyUserState(session?.user ?? null)
      }

      if (event === 'SIGNED_OUT') {
        setError(null)
        applyUserState(null)
      }

      setLoadingSession(false)
    })

    return () => {
      mountedRef.current = false
      data.subscription?.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!user || !isAdmin) return

    const loadData = async () => {
      setLoadingData(true)
      setError(null)

      try {
        const fullData = await getAdminIncidents()
        setAllIncidents(fullData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el panel admin')
        setAllIncidents([])
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [user, isAdmin])

  const technicians = useMemo(() => {
    return Array.from(new Set(allIncidents.map((item) => item.responsible).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, 'es')
    )
  }, [allIncidents])

  const affectedTools = useMemo(() => {
    return Array.from(new Set(allIncidents.map((item) => item.affected_tool).filter(Boolean))).sort((a, b) =>
      a.localeCompare(b, 'es')
    )
  }, [allIncidents])

  const incidents = useMemo(() => {
    const normalizedSearch = deferredSearchTerm.trim().toLowerCase()
    const fromKey = dateFrom || ''
    const toKey = dateTo || ''

    return allIncidents.filter((incident) => {
      if (normalizedSearch && !toSearchableString(incident).includes(normalizedSearch)) return false

      const timelineDateKey = toDateKey(getTimelineValue(incident))
      if (fromKey && (!timelineDateKey || timelineDateKey < fromKey)) return false
      if (toKey && (!timelineDateKey || timelineDateKey > toKey)) return false
      if (technician && incident.responsible !== technician) return false
      if (affectedTool && incident.affected_tool !== affectedTool) return false

      return true
    })
  }, [allIncidents, deferredSearchTerm, dateFrom, dateTo, technician, affectedTool])

  useEffect(() => {
    setCurrentPage(1)
  }, [deferredSearchTerm, dateFrom, dateTo, technician, affectedTool])

  const metrics = useMemo<AdminKpiMetrics>(() => {
    const todayKey = toLocalDateValue(new Date())
    const incidentsToday = incidents.filter((item) => toDateKey(getTimelineValue(item)) === todayKey).length

    const uniqueTechnicians = new Set(incidents.map((item) => item.responsible).filter(Boolean)).size
    const uniqueAffectedTools = new Set(incidents.map((item) => item.affected_tool).filter(Boolean)).size

    const byHour: Record<string, number> = {}
    incidents.forEach((item) => {
      const hour = toHourLabel(item.attention_datetime)
      if (!hour) return
      byHour[hour] = (byHour[hour] || 0) + 1
    })

    const busiestHour = Object.entries(byHour).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Sin datos'

    return {
      totalIncidents: incidents.length,
      incidentsToday,
      uniqueTechnicians,
      uniqueAffectedTools,
      busiestHourLabel: busiestHour,
    }
  }, [incidents])

  const trendData = useMemo(() => {
    const byDate: Record<string, number> = {}
    incidents.forEach((item) => {
      const key = toDateKey(getTimelineValue(item))
      if (!key) return
      byDate[key] = (byDate[key] || 0) + 1
    })

    return Object.entries(byDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([label, count]) => ({ label, count }))
  }, [incidents])

  const bySystemData = useMemo(() => {
    const bySystem: Record<string, number> = {}
    incidents.forEach((item) => {
      const key = item.affected_tool?.trim() || 'Sin sistema'
      bySystem[key] = (bySystem[key] || 0) + 1
    })
    return Object.entries(bySystem)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [incidents])

  const byTechnicianData = useMemo(() => {
    const byTech: Record<string, number> = {}
    incidents.forEach((item) => {
      const key = item.responsible?.trim() || 'Sin tecnico'
      byTech[key] = (byTech[key] || 0) + 1
    })
    return Object.entries(byTech)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [incidents])

  const sortedIncidents = useMemo(() => {
    const copy = [...incidents]
    copy.sort((a, b) => {
      const ta = toSortableTimestamp(getTimelineValue(a))
      const tb = toSortableTimestamp(getTimelineValue(b))
      if (ta === null && tb === null) return 0
      if (ta === null) return 1
      if (tb === null) return -1
      return tb - ta
    })
    return copy
  }, [incidents])

  const totalPages = Math.max(1, Math.ceil(sortedIncidents.length / pageSize))
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const pageStart = (currentPage - 1) * pageSize
  const paginatedIncidents = sortedIncidents.slice(pageStart, pageStart + pageSize)
  const shownFrom = sortedIncidents.length === 0 ? 0 : pageStart + 1
  const shownTo = Math.min(pageStart + pageSize, sortedIncidents.length)

  const clearFilters = () => {
    setSearchTerm('')
    setDateFrom('')
    setDateTo('')
    setTechnician('')
    setAffectedTool('')
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loadingSession) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Cargando panel admin...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <AuthComponent />
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="card" style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>
          <h2 style={{ marginTop: 0 }}>Acceso restringido</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '18px' }}>
            Solo la cuenta {PRIMARY_ADMIN_EMAIL} tiene permisos de administrador.
          </p>
          <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            Volver al dashboard
          </Link>
        </div>
      </div>
    )
  }

  const userName = user.user_metadata?.name ? String(user.user_metadata.name) : user.email || 'Administrador'

  return (
    <AppShell
      section="admin"
      title="Panel admin"
      subtitle="Vista analitica global de incidencias y carga operativa"
      userName={userName}
      userEmail={user.email || ''}
      onSignOut={handleSignOut}
      showAdminLink
      topActions={
        <>
          <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            Ir al dashboard
          </Link>
          <span className="badge badge-info">Modo analitico</span>
        </>
      }
    >
      <section className="card" style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '16px',
            marginBottom: '20px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: '12px',
                color: 'var(--accent-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
              }}
            >
              Filtros de analitica
            </p>
            <h2 style={{ margin: '8px 0 0', fontSize: '22px', letterSpacing: '-0.02em' }}>Ajusta el panorama operativo</h2>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Cruza periodos, responsables y sistemas para detectar focos criticos.
            </p>
          </div>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              background: 'var(--bg-elevated)',
              minWidth: '220px',
            }}
          >
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Registros en vista</p>
            <p style={{ margin: '6px 0 0', fontSize: '28px', fontWeight: 800 }}>{incidents.length}</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Resultado del filtro activo</p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            alignItems: 'end',
          }}
        >
          <div>
            <label>Buscar</label>
            <input
              type="text"
              value={searchTerm}
              placeholder="Ticket, titulo, descripcion, usuario, tecnico..."
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div>
            <label>Desde</label>
            <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          </div>

          <div>
            <label>Hasta</label>
            <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          </div>

          <div>
            <label>Tecnico</label>
            <select value={technician} onChange={(event) => setTechnician(event.target.value)}>
              <option value="">Todos</option>
              {technicians.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Sistema (zona)</label>
            <select value={affectedTool} onChange={(event) => setAffectedTool(event.target.value)}>
              <option value="">Todos</option>
              {affectedTools.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-secondary" onClick={clearFilters} style={{ minHeight: '46px' }}>
            Limpiar filtros
          </button>
        </div>
      </section>

      {error && (
        <div className="card" style={{ marginBottom: '20px', borderColor: '#f2c6ca', background: 'var(--color-error-bg)' }}>
          <p style={{ margin: 0, color: 'var(--color-error)' }}>{error}</p>
        </div>
      )}

      {loadingData ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Cargando analitica global...</p>
        </div>
      ) : (
        <>
          <AdminKpiCards metrics={metrics} />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '16px',
              marginTop: '18px',
            }}
          >
            <AdminTrendChart data={trendData} />
            <AdminBreakdownChart title="Sistemas mas afectados" subtitle="Top por volumen de incidencias" data={bySystemData} />
            <AdminBreakdownChart title="Tecnicos con mas casos" subtitle="Participacion por responsable" data={byTechnicianData} />
          </div>

          <div className="card" style={{ marginTop: '18px' }}>
            <div style={{ marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Ultimas incidencias del panorama</h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Mostrando {shownFrom}-{shownTo} de {sortedIncidents.length} registros filtrados
              </p>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Titulo</th>
                    <th>Sistema</th>
                    <th>Tecnico</th>
                    <th>Usuario</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedIncidents.map((incident) => {
                    const parsedAttention = parseStoredDate(incident.attention_datetime)
                    const hourLabel =
                      parsedAttention && !Number.isNaN(parsedAttention.getTime())
                        ? parsedAttention.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
                        : '-'

                    return (
                      <tr key={incident.id}>
                        <td>
                          <div style={{ display: 'grid', gap: '4px' }}>
                            <span className="badge badge-info" style={{ whiteSpace: 'nowrap' }}>
                              {incident.ticket_code || incident.id.slice(0, 8).toUpperCase()}
                            </span>
                            {incident.legacy_ticket_code && (
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                Legado: {incident.legacy_ticket_code}
                              </span>
                            )}
                          </div>
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
                            {toDateKey(getTimelineValue(incident)) || '-'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{hourLabel}</td>
                        <td>
                          <span style={{ fontWeight: 700 }}>{incident.title}</span>
                        </td>
                        <td>
                          <span className="badge badge-info">{incident.affected_tool}</span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{incident.responsible}</td>
                        <td>{incident.attended_user || '-'}</td>
                      </tr>
                    )
                  })}
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
          </div>
        </>
      )}
    </AppShell>
  )
}
