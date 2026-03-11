'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import IncidentForm from '@/components/incident-form'
import IncidentList from '@/components/incident-list'
import IncidentsChart from '@/components/incidents-chart'
import IncidentsByTechnician from '@/components/incidents-by-technician'
import AuthComponent from '@/components/auth'
import Logo from '@/components/logo'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const [appError, setAppError] = useState<string | null>(null)

  const [techName, setTechName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [showNameEditor, setShowNameEditor] = useState(false)

  const [nameDirty, setNameDirty] = useState(false)
  const lastUserIdRef = useRef<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const loadSession = async () => {
    try {
      setAppError(null)
      const supabase = createClient()

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (error) throw error
      if (!mountedRef.current) return

      const u = session?.user || null
      setUser(u)

      if (!u) {
        lastUserIdRef.current = null
        setTechName('')
        setNameDirty(false)
        return
      }

      const currentUserId = String(u.id)
      const existingName = u?.user_metadata?.name
        ? String(u.user_metadata.name)
        : ''

      if (lastUserIdRef.current !== currentUserId) {
        lastUserIdRef.current = currentUserId
        setNameDirty(false)
        setTechName(existingName)
        return
      }

      if (existingName) {
        setTechName(existingName)
      } else if (!nameDirty) {
        setTechName(existingName)
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      const name = (e as any)?.name

      if (name === 'AbortError' || /aborted/i.test(msg)) {
        return
      }

      if (!mountedRef.current) return

      setAppError(msg || 'Error inesperado cargando la sesión.')
      setUser(null)
    }
  }

  useEffect(() => {
    const supabase = createClient()

    const init = async () => {
      try {
        await loadSession()
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    }

    init()

    const { data } = supabase.auth.onAuthStateChange(async () => {
      await loadSession()
    })

    return () => data.subscription?.unsubscribe()
  }, [])

  const saveTechnicianName = async () => {
    setNameError(null)

    const clean = techName.trim()
    if (!clean) {
      setNameError('Debes ingresar tu nombre de técnico.')
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
      await loadSession()
      setShowNameEditor(false)
    } catch (err) {
      setNameError(
        err instanceof Error ? err.message : 'No se pudo guardar el nombre.'
      )
    } finally {
      setSavingName(false)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--bg-main)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>
        </div>
      </div>
    )
  }

  if (appError) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '480px',
            background: 'var(--bg-card)',
            border: '1px solid var(--color-error)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <div style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 20px',
            background: 'var(--color-error-bg)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px'
          }}>
            ⚠
          </div>
          <h2 style={{ marginTop: 0, marginBottom: '12px', fontSize: '20px' }}>Error de conexión</h2>
          <p style={{ opacity: 0.8, fontSize: '14px', marginBottom: '24px', color: 'var(--text-secondary)' }}>
            {appError}
          </p>
          <button
            onClick={() => location.reload()}
            className="btn btn-primary"
          >
            Reintentar
          </button>
        </div>
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
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse at top, rgba(0, 166, 128, 0.1) 0%, transparent 60%)',
          pointerEvents: 'none'
        }} />
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '420px' }}>
          <AuthComponent />
        </div>
      </div>
    )
  }

  const technicianName = user?.user_metadata?.name
    ? String(user.user_metadata.name).trim()
    : ''

  if (!technicianName) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '480px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <Logo />
          </div>

          <h2 style={{ 
            marginTop: 0, 
            marginBottom: '8px', 
            fontSize: '22px',
            fontWeight: 700
          }}>
            ¡Bienvenido a STOTOMAS!
          </h2>
          <p style={{ 
            marginTop: 0, 
            fontSize: '14px', 
            color: 'var(--text-secondary)',
            marginBottom: '28px'
          }}>
            Para comenzar, ingresa tu nombre de técnico.
          </p>

          <label style={{ fontSize: '13px', marginBottom: '8px' }}>Nombre del técnico</label>
          <input
            type="text"
            value={techName}
            onChange={(e) => {
              setTechName(e.target.value)
              setNameDirty(true)
            }}
            placeholder="Ej: Sebastián Echeverría"
            style={{ 
              width: '100%', 
              padding: '14px 16px',
              fontSize: '15px'
            }}
            autoFocus
          />

          {nameError && (
            <div style={{ 
              color: 'var(--color-error)', 
              marginTop: '12px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>⚠</span> {nameError}
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
            Cerrar sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <header
        style={{
          background: 'var(--bg-card)',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-color)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Logo />
            <div style={{
              paddingLeft: '20px',
              borderLeft: '1px solid var(--border-color)'
            }}>
              <h1 style={{ 
                margin: 0, 
                fontSize: '18px', 
                fontWeight: 600,
                letterSpacing: '-0.01em'
              }}>
                Historial de Incidencias
              </h1>
              <p style={{ 
                margin: '2px 0 0', 
                fontSize: '13px', 
                color: 'var(--text-secondary)'
              }}>
                Registro de soluciones técnicas
              </p>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px',
            fontSize: '14px'
          }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontWeight: 500 }}>
                {technicianName}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                {user.email}
              </p>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '16px',
              boxShadow: 'var(--shadow-glow)'
            }}>
              {technicianName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '32px 24px',
        }}
      >
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '55% 45%',
            gap: '24px', 
            marginBottom: '32px' 
          }}
          className="animate-fade-in"
        >
          <div>
            <IncidentForm
              onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
            />
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateRows: '1fr 1fr',
            gap: '24px',
            height: '100%'
          }}>
            <div>
              <IncidentsChart refreshTrigger={refreshTrigger} />
            </div>
            <div>
              <IncidentsByTechnician refreshTrigger={refreshTrigger} />
            </div>
          </div>
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <IncidentList refreshTrigger={refreshTrigger} />
        </div>
      </main>
    </div>
  )
}
