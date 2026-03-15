'use client'

import Link from 'next/link'
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import AuthComponent from '@/components/auth'
import Logo from '@/components/logo'
import AdminKpiCards from '@/components/admin-kpi-cards'
import AdminTrendChart from '@/components/admin-trend-chart'
import AdminBreakdownChart from '@/components/admin-breakdown-chart'
import { getAdminIncidents } from '@/lib/incidents'
import { createClient, getSessionSnapshot } from '@/lib/supabase-client'
import { AdminKpiMetrics, Incident } from '@/lib/types'
import { isPrimaryAdmin, PRIMARY_ADMIN_EMAIL } from '@/lib/admin'

function toDateKey(value: string | null | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}

function toHourLabel(value: string | null | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return `${String(d.getHours()).padStart(2, '0')}:00`
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
          setError(sessionError.message || 'No se pudo cargar la sesión')
          return
        }

        if (timedOut || session === undefined) {
          return
        }

        setUser(session?.user ?? null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar la sesión')
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

    return allIncidents.filter((incident) => {
      if (normalizedSearch && !toSearchableString(incident).includes(normalizedSearch)) {
        return false
      }

      const resolutionTime = new Date(incident.resolution_date).getTime()
      if (dateFrom) {
        const from = new Date(dateFrom)
        from.setHours(0, 0, 0, 0)
        if (resolutionTime < from.getTime()) return false
      }

      if (dateTo) {
        const to = new Date(dateTo)
        to.setHours(23, 59, 59, 999)
        if (resolutionTime > to.getTime()) return false
      }

      if (technician && incident.responsible !== technician) return false
      if (affectedTool && incident.affected_tool !== affectedTool) return false

      return true
    })
  }, [allIncidents, deferredSearchTerm, dateFrom, dateTo, technician, affectedTool])

  useEffect(() => {
    setCurrentPage(1)
  }, [deferredSearchTerm, dateFrom, dateTo, technician, affectedTool])

  const metrics = useMemo<AdminKpiMetrics>(() => {
    const todayKey = new Date().toISOString().split('T')[0]
    const incidentsToday = incidents.filter((item) => toDateKey(item.resolution_date) === todayKey).length

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
      const key = toDateKey(item.resolution_date)
      if (!key) return
      byDate[key] = (byDate[key] || 0) + 1
    })

    return Object.entries(byDate)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
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
      const key = item.responsible?.trim() || 'Sin técnico'
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
      const ta = new Date(a.attention_datetime || a.resolution_date).getTime()
      const tb = new Date(b.attention_datetime || b.resolution_date).getTime()
      return tb - ta
    })
    return copy
  }, [incidents])

  const totalPages = Math.max(1, Math.ceil(sortedIncidents.length / pageSize))

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Cargando panel admin...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-main)',
          padding: '20px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <AuthComponent />
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-main)',
          padding: '20px',
        }}
      >
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

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <header
        style={{
          background:
            'linear-gradient(90deg, rgba(19, 19, 26, 1) 0%, rgba(19, 19, 26, 0.92) 60%, rgba(10, 10, 15, 1) 100%)',
          borderBottom: '1px solid var(--border-color)',
          padding: '16px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(10px)',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            <Logo />
            <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '18px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  padding: '6px 10px',
                  borderRadius: '999px',
                  background: 'rgba(0, 166, 128, 0.12)',
                  color: 'var(--accent-primary)',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                }}
              >
                Centro de control
              </div>
              <h1 style={{ margin: 0, fontSize: '24px', letterSpacing: '-0.03em' }}>Panel Admin</h1>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Vista global de incidencias, carga operativa y sistemas más afectados
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              Ir al dashboard
            </Link>
            <button className="btn btn-secondary" onClick={handleSignOut}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '28px 24px 32px' }}>
        <section
          className="card"
          style={{
            marginBottom: '20px',
            background:
              'radial-gradient(circle at top left, rgba(0, 166, 128, 0.12) 0%, transparent 32%), var(--bg-card)',
          }}
        >
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
                Filtros de analítica
              </p>
              <h2 style={{ margin: '8px 0 0', fontSize: '22px', letterSpacing: '-0.03em' }}>
                Ajusta el panorama operativo
              </h2>
              <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Cruza períodos, responsables y sistemas para detectar focos críticos.
              </p>
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                background: 'rgba(255, 255, 255, 0.03)',
                minWidth: '220px',
              }}
            >
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Registros en vista
              </p>
              <p style={{ margin: '6px 0 0', fontSize: '28px', fontWeight: 700 }}>{incidents.length}</p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Resultado del filtro activo
              </p>
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
                placeholder="Ticket, título, descripción, usuario, técnico..."
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
              <label>Técnico</label>
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
          <div className="card" style={{ marginBottom: '20px', borderColor: 'var(--color-error)' }}>
            <p style={{ margin: 0, color: 'var(--color-error)' }}>{error}</p>
          </div>
        )}

        {loadingData ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Cargando analítica global...</p>
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
              <AdminBreakdownChart
                title="Sistemas más afectados"
                subtitle="Top por volumen de incidencias"
                data={bySystemData}
              />
              <AdminBreakdownChart
                title="Técnicos con más casos"
                subtitle="Participación por responsable"
                data={byTechnicianData}
              />
            </div>

            <div className="card" style={{ marginTop: '18px' }}>
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px' }}>Últimas incidencias del panorama</h3>
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
                      <th>Título</th>
                      <th>Sistema</th>
                      <th>Técnico</th>
                      <th>Usuario</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedIncidents.map((incident) => {
                      const parsedAttention = incident.attention_datetime ? new Date(incident.attention_datetime) : null

                      const hourLabel =
                        parsedAttention && !Number.isNaN(parsedAttention.getTime())
                          ? parsedAttention.toLocaleTimeString('es-CL', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'

                      return (
                        <tr key={incident.id}>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '4px 10px',
                                background: 'rgba(0, 166, 128, 0.15)',
                                color: 'var(--accent-primary)',
                                borderRadius: '999px',
                                fontSize: '12px',
                                fontWeight: 600,
                                whiteSpace: 'nowrap',
                              }}
                            >
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
                              {toDateKey(incident.attention_datetime || incident.resolution_date) || '-'}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{hourLabel}</td>
                          <td>
                            <span style={{ fontWeight: 500 }}>{incident.title}</span>
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                background: 'rgba(0, 166, 128, 0.15)',
                                color: 'var(--accent-primary)',
                                borderRadius: '20px',
                                fontSize: '12px',
                              }}
                            >
                              {incident.affected_tool}
                            </span>
                          </td>
                          <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                            {incident.responsible}
                          </td>
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
                  <label style={{ margin: 0 }}>Filas por página</label>
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
                    Página {currentPage} de {totalPages}
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
      </main>
    </div>
  )
}
