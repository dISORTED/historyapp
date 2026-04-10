'use client'

import { useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { createClient, getSessionSnapshot } from '@/lib/supabase-client'
import IncidentForm from '@/components/incident-form'
import IncidentList from '@/components/incident-list'
import IncidentsChart from '@/components/incidents-chart'
import AuthComponent from '@/components/auth'
import DashboardSidePanel from '@/components/dashboard-side-panel'
import LiveClock from '@/components/live-clock'
import Logo from '@/components/logo'
import { isPrimaryAdmin } from '@/lib/admin'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const [appError, setAppError] = useState<string | null>(null)
  const [techName, setTechName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [nameDirty, setNameDirty] = useState(false)

  const lastUserIdRef = useRef<string | null>(null)
  const mountedRef = useRef(true)
  const nameDirtyRef = useRef(false)

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

      if (timedOut || session === undefined) {
        return
      }

      applyUserState(session?.user ?? null)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      const name = (e as { name?: string })?.name

      if (name === 'AbortError' || /aborted/i.test(msg)) {
        return
      }

      if (!mountedRef.current) return
      setAppError(msg || 'Error inesperado cargando la sesion.')
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    nameDirtyRef.current = false
    setUser(null)
    setTechName('')
    setNameDirty(false)
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

      setLoading(false)
    })

    const init = async () => {
      try {
        await loadSession()
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    }

    init()

    return () => data.subscription?.unsubscribe()
  }, [])

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
      const { error } = await supabase.auth.updateUser({
        data: { name: clean },
      })
      if (error) throw error

      setNameDirty(false)
      nameDirtyRef.current = false
      setTechName(clean)
      setUser((prev) => (prev ? { ...prev, user_metadata: { ...prev.user_metadata, name: clean } } : prev))
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'No se pudo guardar el nombre.')
    } finally {
      setSavingName(false)
    }
  }

  if (loading) {
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
          <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>
        </div>
      </div>
    )
  }

  if (appError) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div
          className="card"
          style={{
            width: '100%',
            maxWidth: '480px',
            borderColor: '#f2c6ca',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 20px',
              background: 'var(--color-error-bg)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              color: 'var(--color-error)',
            }}
          >
            !
          </div>
          <h2 style={{ marginTop: 0, marginBottom: '12px', fontSize: '20px' }}>Error de conexion</h2>
          <p style={{ fontSize: '14px', marginBottom: '24px', color: 'var(--text-secondary)' }}>{appError}</p>
          <button onClick={() => location.reload()} className="btn btn-primary">
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
  const isAdmin = isPrimaryAdmin(user)

  if (!technicianName) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="card" style={{ width: '100%', maxWidth: '520px', padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <Logo />
          </div>

          <h2 style={{ marginTop: 0, marginBottom: '8px', fontSize: '22px', fontWeight: 800 }}>Bienvenido a STOTOMAS</h2>
          <p style={{ marginTop: 0, fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '28px' }}>
            Para comenzar, ingresa tu nombre de tecnico.
          </p>

          <label style={{ fontSize: '13px', marginBottom: '8px' }}>Nombre del tecnico</label>
          <input
            type="text"
            value={techName}
            onChange={(e) => {
              setTechName(e.target.value)
              setNameDirty(true)
            }}
            placeholder="Ej: Sebastian Echeverria"
            style={{ width: '100%', padding: '14px 16px', fontSize: '15px' }}
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

          <button
            onClick={saveTechnicianName}
            disabled={savingName}
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '20px', padding: '14px' }}
          >
            {savingName ? 'Guardando...' : 'Continuar'}
          </button>

          <button
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signOut()
            }}
            className="btn btn-secondary"
            style={{ width: '100%', marginTop: '12px' }}
          >
            Cerrar sesion
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div
          style={{
            maxWidth: 'var(--container-max)',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '14px',
            flexWrap: 'wrap',
            padding: '14px 24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Logo />
            <div style={{ paddingLeft: '16px', borderLeft: '1px solid var(--border-light)' }}>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800, letterSpacing: '-0.01em' }}>Historial de Incidencias</h1>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Registro de soluciones tecnicas
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {isAdmin && (
              <Link href="/admin" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '8px 14px' }}>
                Panel admin
              </Link>
            )}
            <button onClick={handleSignOut} className="btn btn-secondary" style={{ padding: '8px 14px' }}>
              Cerrar sesion
            </button>
            <div style={{ textAlign: 'right', marginLeft: '6px' }}>
              <p style={{ margin: 0, fontWeight: 700 }}>{technicianName}</p>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</p>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--accent-soft)',
                border: '1px solid #c7ddf2',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '15px',
              }}
            >
              {technicianName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.25fr) minmax(340px, 0.95fr)',
            gap: '24px',
            marginBottom: '24px',
            alignItems: 'start',
          }}
          className="animate-fade-in dashboard-top-grid"
        >
          <div style={{ height: '100%' }}>
            <IncidentForm onSuccess={() => setRefreshTrigger((prev) => prev + 1)} />
          </div>
          <div
            className="dashboard-right-column"
            style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '320px',
              gap: '16px',
              width: '100%',
            }}
          >
            <div className="dashboard-chart-panel" style={{ minHeight: '320px', width: '100%' }}>
              <IncidentsChart refreshTrigger={refreshTrigger} />
            </div>
            <LiveClock />
            <DashboardSidePanel refreshTrigger={refreshTrigger} />
          </div>
        </div>

        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <IncidentList refreshTrigger={refreshTrigger} />
        </div>
      </main>
    </div>
  )
}
