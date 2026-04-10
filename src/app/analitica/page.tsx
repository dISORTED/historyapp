'use client'

import Link from 'next/link'
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import AppShell from '@/components/app-shell'
import AuthComponent from '@/components/auth'
import Logo from '@/components/logo'
import {
  AnalyticsBreakdownPoint,
  AnalyticsDonutPoint,
  AnalyticsFilters,
  AnalyticsHeatmapCell,
  applyAnalyticsFilters,
  buildAnalyticsKpis,
  buildBreakdownSeries,
  buildDidacticInsights,
  buildHeatmapSeries,
  buildTechnicianDonutSeries,
  buildTrendSeries,
  extractAnalyticsFilterOptions,
} from '@/lib/analytics'
import { isPrimaryAdmin } from '@/lib/admin'
import { parseStoredDate } from '@/lib/date-utils'
import { getIncidents } from '@/lib/incidents'
import { createClient, getSessionSnapshot } from '@/lib/supabase-client'
import { Incident } from '@/lib/types'

const DONUT_COLORS = ['#1f73b7', '#2f82c2', '#4a95d1', '#65a8df', '#81b9e9', '#9ccbf2', '#b4d7f8']
const BAR_COLORS = ['#1f73b7', '#2b7dc0', '#3a88ca', '#4a92d2', '#5b9eda', '#72aee4', '#89bfed', '#9fcff5']

function formatShortDate(value: string) {
  const parsed = parseStoredDate(value)
  return parsed ? parsed.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }) : value
}

function formatLongDate(value: string) {
  const parsed = parseStoredDate(value)
  return parsed
    ? parsed.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : value
}

function resolveVariationClass(direction: 'up' | 'down' | 'flat') {
  if (direction === 'up') return 'badge-info'
  if (direction === 'down') return 'badge-success'
  return 'badge-warning'
}

function toHeatmapLookup(cells: AnalyticsHeatmapCell[]) {
  const lookup: Record<string, AnalyticsHeatmapCell> = {}

  for (const cell of cells) {
    lookup[`${cell.dayIndex}-${cell.slotIndex}`] = cell
  }

  return lookup
}

function buildHeatmapStyle(cell: AnalyticsHeatmapCell | undefined) {
  if (!cell || cell.count === 0) {
    return {
      backgroundColor: 'var(--bg-subtle)',
      color: 'var(--text-muted)',
      borderColor: 'var(--border-light)',
    }
  }

  const opacity = 0.16 + cell.intensity * 0.58

  return {
    backgroundColor: `rgba(31, 115, 183, ${opacity.toFixed(2)})`,
    color: cell.intensity >= 0.58 ? '#ffffff' : '#0f2942',
    borderColor: 'rgba(17, 68, 110, 0.16)',
  }
}

export default function AnaliticaPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const [loadingData, setLoadingData] = useState(false)
  const [appError, setAppError] = useState<string | null>(null)
  const [dataError, setDataError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [allIncidents, setAllIncidents] = useState<Incident[]>([])

  const [techName, setTechName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [nameDirty, setNameDirty] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [technician, setTechnician] = useState('')
  const [affectedTool, setAffectedTool] = useState('')

  const deferredSearchTerm = useDeferredValue(searchTerm)
  const mountedRef = useRef(true)
  const lastUserIdRef = useRef<string | null>(null)
  const nameDirtyRef = useRef(false)
  const isAdmin = isPrimaryAdmin(user)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    nameDirtyRef.current = nameDirty
  }, [nameDirty])

  const applyUserState = (nextUser: User | null) => {
    if (!mountedRef.current) return

    setUser(nextUser)

    if (!nextUser) {
      lastUserIdRef.current = null
      nameDirtyRef.current = false
      setTechName('')
      setNameDirty(false)
      setAllIncidents([])
      return
    }

    const currentUserId = String(nextUser.id)
    const existingName = nextUser.user_metadata?.name ? String(nextUser.user_metadata.name) : ''

    if (lastUserIdRef.current !== currentUserId) {
      lastUserIdRef.current = currentUserId
      nameDirtyRef.current = false
      setNameDirty(false)
      setTechName(existingName)
      return
    }

    if (existingName || !nameDirtyRef.current) {
      setTechName(existingName)
    }
  }

  const loadSession = async () => {
    try {
      setAppError(null)
      const { session, error, timedOut } = await getSessionSnapshot()

      if (!mountedRef.current) return
      if (error) {
        setAppError(error.message || 'No se pudo validar la sesion actual.')
        return
      }
      if (timedOut || session === undefined) return

      applyUserState(session?.user ?? null)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      const name = (error as { name?: string })?.name
      if (name === 'AbortError' || /aborted/i.test(message)) return
      if (!mountedRef.current) return
      setAppError(message || 'Error inesperado cargando la sesion.')
    }
  }

  useEffect(() => {
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
        setAppError(null)
        applyUserState(session?.user ?? null)
      }

      if (event === 'SIGNED_OUT') {
        setAppError(null)
        applyUserState(null)
      }

      setLoadingSession(false)
    })

    const init = async () => {
      try {
        await loadSession()
      } finally {
        if (mountedRef.current) setLoadingSession(false)
      }
    }

    init()
    return () => data.subscription?.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return

    const loadIncidents = async () => {
      setLoadingData(true)
      setDataError(null)

      try {
        const incidents = await getIncidents()
        setAllIncidents(incidents || [])
      } catch (error) {
        setDataError(error instanceof Error ? error.message : 'No se pudo cargar la analitica.')
        setAllIncidents([])
      } finally {
        setLoadingData(false)
      }
    }

    loadIncidents()
  }, [user, refreshKey])

  const filterModel = useMemo<AnalyticsFilters>(
    () => ({
      searchTerm: deferredSearchTerm,
      dateFrom,
      dateTo,
      technician,
      affectedTool,
    }),
    [deferredSearchTerm, dateFrom, dateTo, technician, affectedTool]
  )

  const scopedIncidents = useMemo(
    () =>
      applyAnalyticsFilters(allIncidents, {
        ...filterModel,
        dateFrom: '',
        dateTo: '',
      }),
    [allIncidents, filterModel]
  )

  const filteredIncidents = useMemo(() => applyAnalyticsFilters(allIncidents, filterModel), [allIncidents, filterModel])
  const filterOptions = useMemo(() => extractAnalyticsFilterOptions(allIncidents), [allIncidents])

  const metrics = useMemo(() => buildAnalyticsKpis(filteredIncidents, scopedIncidents, filterModel), [filteredIncidents, scopedIncidents, filterModel])
  const trendSeries = useMemo(() => buildTrendSeries(filteredIncidents), [filteredIncidents])
  const systemBreakdown = useMemo(() => buildBreakdownSeries(filteredIncidents, 'affected_tool', 'Sin sistema', 8), [filteredIncidents])
  const technicianBreakdown = useMemo(() => buildBreakdownSeries(filteredIncidents, 'responsible', 'Sin tecnico', 8), [filteredIncidents])
  const technicianDonut = useMemo(() => buildTechnicianDonutSeries(filteredIncidents, 7), [filteredIncidents])
  const heatmap = useMemo(() => buildHeatmapSeries(filteredIncidents), [filteredIncidents])
  const heatmapLookup = useMemo(() => toHeatmapLookup(heatmap.cells), [heatmap.cells])
  const insights = useMemo(
    () =>
      buildDidacticInsights({
        kpis: metrics,
        systemBreakdown,
        technicianBreakdown,
        heatmap,
      }),
    [metrics, systemBreakdown, technicianBreakdown, heatmap]
  )

  const kpiCards = useMemo(
    () => [
      { title: 'Total incidencias', value: String(metrics.totalIncidents), hint: 'Registros del filtro activo' },
      { title: 'Incidencias hoy', value: String(metrics.incidentsToday), hint: 'Actividad en fecha actual' },
      { title: 'Tecnicos activos', value: String(metrics.uniqueTechnicians), hint: 'Responsables con casos' },
      { title: 'Sistemas afectados', value: String(metrics.uniqueAffectedTools), hint: 'Herramientas reportadas' },
      { title: 'Hora mas critica', value: metrics.busiestHourLabel, hint: 'Franja con mayor concentracion' },
      {
        title: 'Variacion del periodo',
        value: `${metrics.variationDirection === 'down' ? '-' : metrics.variationDirection === 'up' ? '+' : ''}${Math.abs(
          metrics.variationPercent
        ).toFixed(1)}%`,
        hint: `${metrics.currentPeriodCount} actual vs ${metrics.previousPeriodCount} anterior`,
      },
    ],
    [metrics]
  )

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
    nameDirtyRef.current = false
    setUser(null)
    setTechName('')
    setNameDirty(false)
    setAllIncidents([])
  }

  const saveTechnicianName = async () => {
    setNameError(null)

    const clean = techName.trim()
    if (!clean) {
      setNameError('Debes ingresar tu nombre de tecnico.')
      return
    }
    if (clean.length < 3) {
      setNameError('El nombre debe tener al menos 3 caracteres.')
      return
    }

    setSavingName(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ data: { name: clean } })
      if (error) throw error

      setNameDirty(false)
      nameDirtyRef.current = false
      setTechName(clean)
      setUser((previous) => (previous ? { ...previous, user_metadata: { ...previous.user_metadata, name: clean } } : previous))
    } catch (error) {
      setNameError(error instanceof Error ? error.message : 'No se pudo guardar el nombre.')
    } finally {
      setSavingName(false)
    }
  }

  if (loadingSession) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '3px solid var(--border-color)',
              borderTopColor: 'var(--accent-primary)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <p style={{ color: 'var(--text-secondary)' }}>Cargando analitica...</p>
        </div>
      </div>
    )
  }

  if (appError) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="card" style={{ width: '100%', maxWidth: '500px', textAlign: 'center', borderColor: '#f2c6ca' }}>
          <h2 style={{ marginTop: 0, marginBottom: '12px', fontSize: '20px' }}>Error de conexion</h2>
          <p style={{ fontSize: '14px', marginBottom: '22px', color: 'var(--text-secondary)' }}>{appError}</p>
          <button className="btn btn-primary" onClick={() => location.reload()}>
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: '460px' }}>
          <AuthComponent />
        </div>
      </div>
    )
  }

  const technicianName = user?.user_metadata?.name ? String(user.user_metadata.name).trim() : ''

  if (!technicianName) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <Logo />
          </div>
          <h2 style={{ marginTop: 0, marginBottom: '8px', fontSize: '22px', fontWeight: 800 }}>Bienvenido a STOTOMAS</h2>
          <p style={{ marginTop: 0, fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '22px' }}>
            Para continuar con la analitica, ingresa tu nombre de tecnico.
          </p>

          <label style={{ fontSize: '13px', marginBottom: '8px' }}>Nombre del tecnico</label>
          <input
            type="text"
            value={techName}
            onChange={(event) => {
              setTechName(event.target.value)
              setNameDirty(true)
            }}
            placeholder="Ej: Sebastian Echeverria"
            autoFocus
          />

          {nameError && (
            <div
              style={{
                color: 'var(--color-error)',
                marginTop: '12px',
                fontSize: '13px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #f2c6ca',
                background: 'var(--color-error-bg)',
              }}
            >
              {nameError}
            </div>
          )}

          <button className="btn btn-primary" style={{ width: '100%', marginTop: '18px' }} disabled={savingName} onClick={saveTechnicianName}>
            {savingName ? 'Guardando...' : 'Continuar'}
          </button>
        </div>
      </div>
    )
  }

  const variationClass = resolveVariationClass(metrics.variationDirection)

  return (
    <AppShell
      section="analytics"
      title="Analitica didactica"
      subtitle="Lectura operativa guiada para priorizar incidencias con datos claros"
      userName={technicianName}
      userEmail={user.email || ''}
      onSignOut={handleSignOut}
      showAdminLink={isAdmin}
      topActions={
        <>
          <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
            Volver a Dashboard
          </Link>
          <button className="btn btn-secondary" onClick={() => setRefreshKey((value) => value + 1)}>
            Actualizar analitica
          </button>
        </>
      }
    >
      <section className="card analytics-filter-card animate-fade-in">
        <div className="analytics-filter-header">
          <div>
            <p className="analytics-eyebrow">Filtros globales</p>
            <h2 className="analytics-section-title">Explora el panorama operativo</h2>
            <p className="analytics-section-subtitle">
              Ajusta periodo, responsable o sistema para que todos los graficos hablen del mismo contexto.
            </p>
          </div>
          <div className="analytics-filter-summary">
            <p className="analytics-filter-summary-label">Registros en vista</p>
            <p className="analytics-filter-summary-value">{filteredIncidents.length}</p>
            <p className="analytics-filter-summary-hint">Sobre {allIncidents.length} registros disponibles</p>
          </div>
        </div>

        <div className="analytics-filter-grid">
          <div>
            <label>Buscar</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Ticket, legado, titulo, descripcion, tecnico o usuario..."
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
              {filterOptions.technicians.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Sistema</label>
            <select value={affectedTool} onChange={(event) => setAffectedTool(event.target.value)}>
              <option value="">Todos</option>
              {filterOptions.affectedTools.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-secondary analytics-clear-btn" onClick={clearFilters}>
            Limpiar filtros
          </button>
        </div>
      </section>

      {dataError && (
        <section className="card" style={{ marginTop: '16px', borderColor: '#f2c6ca', background: 'var(--color-error-bg)' }}>
          <p style={{ margin: 0, color: 'var(--color-error)', fontSize: '14px' }}>{dataError}</p>
        </section>
      )}

      {loadingData ? (
        <section className="card" style={{ marginTop: '16px', textAlign: 'center' }}>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Cargando analitica didactica...</p>
        </section>
      ) : filteredIncidents.length === 0 ? (
        <section className="card" style={{ marginTop: '16px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '8px' }}>Sin datos para el filtro actual</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
            Prueba ampliar el rango de fechas o limpiar filtros para visualizar tendencias.
          </p>
        </section>
      ) : (
        <>
          <section className="analytics-kpi-grid animate-fade-in">
            {kpiCards.map((card) => (
              <article key={card.title} className="card analytics-kpi-card">
                <p className="analytics-kpi-title">{card.title}</p>
                <p className="analytics-kpi-value">{card.value}</p>
                <p className="analytics-kpi-hint">{card.hint}</p>
                {card.title === 'Variacion del periodo' && <span className={`badge ${variationClass}`}>Comparativa automatica</span>}
              </article>
            ))}
          </section>

          <section className="analytics-grid analytics-grid-main animate-fade-in">
            <article className="card analytics-card-large">
              <div className="analytics-card-header">
                <div>
                  <p className="analytics-eyebrow">Tendencia</p>
                  <h3>Incidencias por dia + media movil</h3>
                  <p>Como leer: la linea oscura muestra el dia; la linea suave resume el ritmo semanal.</p>
                </div>
              </div>

              <div className="analytics-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendSeries} margin={{ top: 10, right: 12, left: -6, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dde7f1" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatShortDate}
                      tick={{ fill: '#4a607a', fontSize: 12 }}
                      axisLine={{ stroke: '#cdd9e6' }}
                      tickLine={false}
                    />
                    <YAxis allowDecimals={false} tick={{ fill: '#4a607a', fontSize: 12 }} tickLine={false} axisLine={false} width={34} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #d8e2ed',
                        borderRadius: '12px',
                        boxShadow: 'var(--shadow-md)',
                      }}
                      labelFormatter={(value) => formatLongDate(String(value))}
                      formatter={(value, name) => {
                        const numeric = typeof value === 'number' ? value : Number(value ?? 0)
                        const display = String(name) === 'Media movil (7d)' ? numeric.toFixed(1) : numeric.toFixed(0)
                        return [display, String(name)]
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Incidencias"
                      stroke="#1f73b7"
                      fill="#1f73b7"
                      fillOpacity={0.14}
                      strokeWidth={2.4}
                    />
                    <Line
                      type="monotone"
                      dataKey="movingAverage"
                      name="Media movil (7d)"
                      stroke="#14548c"
                      dot={false}
                      strokeDasharray="6 4"
                      strokeWidth={2}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="card">
              <p className="analytics-eyebrow">Distribucion</p>
              <h3 className="analytics-card-title">Top sistemas afectados</h3>
              <p className="analytics-card-subtitle">Como leer: barras mas largas representan mayor carga de casos.</p>

              <div className="analytics-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={systemBreakdown} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dde7f1" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: '#4a607a', fontSize: 12 }} axisLine={{ stroke: '#cdd9e6' }} />
                    <YAxis dataKey="label" type="category" width={132} tick={{ fill: '#4a607a', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #d8e2ed',
                        borderRadius: '12px',
                        boxShadow: 'var(--shadow-md)',
                      }}
                      formatter={(value) => [value ?? 0, 'Incidencias']}
                    />
                    <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={20}>
                      {systemBreakdown.map((entry, index) => (
                        <Cell key={`${entry.label}-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="card">
              <p className="analytics-eyebrow">Participacion</p>
              <h3 className="analytics-card-title">Distribucion por tecnico</h3>
              <p className="analytics-card-subtitle">Como leer: muestra el peso relativo por responsable en el periodo.</p>

              <div className="analytics-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={technicianDonut} dataKey="value" nameKey="name" outerRadius={98} innerRadius={46} paddingAngle={2}>
                      {technicianDonut.map((entry: AnalyticsDonutPoint, index: number) => (
                        <Cell key={`${entry.name}-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #d8e2ed',
                        borderRadius: '12px',
                        boxShadow: 'var(--shadow-md)',
                      }}
                      formatter={(value) => [value ?? 0, 'Tickets']}
                    />
                    <Legend iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          <section className="analytics-grid analytics-grid-secondary animate-fade-in">
            <article className="card">
              <p className="analytics-eyebrow">Mapa de carga</p>
              <h3 className="analytics-card-title">Heatmap dia x franja horaria</h3>
              <p className="analytics-card-subtitle">Como leer: mayor intensidad de color indica mas incidencias en esa celda.</p>

              <div className="analytics-heatmap-grid">
                <div className="analytics-heatmap-corner">Dia / Hora</div>
                {heatmap.slotLabels.map((label) => (
                  <div key={label} className="analytics-heatmap-col">
                    {label}
                  </div>
                ))}

                {heatmap.dayLabels.map((dayLabel, dayIndex) => (
                  <div key={dayLabel} className="analytics-heatmap-row-group">
                    <div className="analytics-heatmap-row-label">{dayLabel}</div>
                    {heatmap.slotLabels.map((slotLabel, slotIndex) => {
                      const cell = heatmapLookup[`${dayIndex}-${slotIndex}`]
                      const style = buildHeatmapStyle(cell)
                      return (
                        <div
                          key={`${dayLabel}-${slotLabel}`}
                          className="analytics-heatmap-cell"
                          style={style}
                          title={`${dayLabel} ${slotLabel}: ${cell?.count ?? 0} incidencias`}
                        >
                          {cell?.count ? cell.count : '-'}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>

              <p className="analytics-heatmap-hint">
                Valor maximo del mapa: <strong>{heatmap.maxCount}</strong> incidencias en una celda.
              </p>
            </article>

            <article className="card">
              <p className="analytics-eyebrow">Insights</p>
              <h3 className="analytics-card-title">Hallazgos didacticos</h3>
              <p className="analytics-card-subtitle">Lectura rapida para transformar datos en acciones concretas.</p>

              <ol className="analytics-insights-list">
                {insights.map((insight) => (
                  <li key={insight.title} className="analytics-insight-item">
                    <p className="analytics-insight-title">{insight.title}</p>
                    <p className="analytics-insight-description">{insight.description}</p>
                    <p className="analytics-insight-action">{insight.action}</p>
                  </li>
                ))}
              </ol>
            </article>

            <article className="card">
              <p className="analytics-eyebrow">Ranking</p>
              <h3 className="analytics-card-title">Tecnicos con mayor carga</h3>
              <p className="analytics-card-subtitle">Como leer: identifica participacion relativa y balance de asignacion.</p>

              <div className="analytics-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={technicianBreakdown} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#dde7f1" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fill: '#4a607a', fontSize: 12 }} axisLine={{ stroke: '#cdd9e6' }} />
                    <YAxis dataKey="label" type="category" width={132} tick={{ fill: '#4a607a', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #d8e2ed',
                        borderRadius: '12px',
                        boxShadow: 'var(--shadow-md)',
                      }}
                      formatter={(value) => [value ?? 0, 'Incidencias']}
                    />
                    <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={20}>
                      {technicianBreakdown.map((entry: AnalyticsBreakdownPoint, index: number) => (
                        <Cell key={`${entry.label}-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>
        </>
      )}
    </AppShell>
  )
}
