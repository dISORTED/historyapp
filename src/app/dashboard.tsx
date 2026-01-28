'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import IncidentForm from '@/components/incident-form'
import IncidentList from '@/components/incident-list'
import AuthComponent from '@/components/auth'
import Logo from '@/components/logo'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Manejo de error global (evita loading infinito)
  const [appError, setAppError] = useState<string | null>(null)

  // Nombre técnico
  const [techName, setTechName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [showNameEditor, setShowNameEditor] = useState(false)

  // Flags de control
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
      // 🔇 Ignorar AbortError (no es bug real)
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
        // ✅ pase lo que pase, no queda pegado en "Cargando..."
        if (mountedRef.current) setLoading(false)
      }
    }

    init()

    const { data } = supabase.auth.onAuthStateChange(async () => {
      await loadSession()
    })

    return () => data.subscription?.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  /* =========================
     ESTADOS DE CARGA / ERROR
     ========================= */

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Cargando...</p>
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
            maxWidth: '720px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '22px',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Error cargando la sesión</h2>
          <p style={{ opacity: 0.9, fontSize: '13px' }}>{appError}</p>
          <button
            onClick={() => location.reload()}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'transparent',
              cursor: 'pointer',
              fontWeight: 800,
            }}
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
        }}
      >
        <AuthComponent />
      </div>
    )
  }

  const technicianName = user?.user_metadata?.name
    ? String(user.user_metadata.name).trim()
    : ''

  /* =========================
     GATE: NOMBRE DE TÉCNICO
     ========================= */

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
            maxWidth: '720px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '26px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginBottom: '18px',
            }}
          >
            <Logo />
            <div>
              <h2 style={{ margin: 0 }}>Configurar nombre de técnico</h2>
              <p style={{ marginTop: '6px', fontSize: '13px', opacity: 0.85 }}>
                Para registrar tickets, primero debes definir tu nombre.
              </p>
            </div>
          </div>

          <label style={{ fontSize: '13px' }}>Nombre del técnico</label>
          <input
            type="text"
            value={techName}
            onChange={(e) => {
              setTechName(e.target.value)
              setNameDirty(true)
            }}
            placeholder="Ej: Sebastián Echeverría"
            style={{ width: '100%', padding: '10px', marginTop: '6px' }}
            autoFocus
          />

          {nameError && (
            <div style={{ color: 'var(--color-error)', marginTop: '8px' }}>
              {nameError}
            </div>
          )}

          <button
            onClick={saveTechnicianName}
            disabled={savingName}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '10px',
              background: 'var(--accent-primary)',
              borderRadius: '10px',
              border: 'none',
              fontWeight: 800,
              cursor: savingName ? 'not-allowed' : 'pointer',
            }}
          >
            {savingName ? 'Guardando…' : 'Guardar y continuar'}
          </button>

          <button
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signOut()
            }}
            style={{
              width: '100%',
              marginTop: '10px',
              padding: '10px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              background: 'transparent',
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    )
  }

  /* =========================
     DASHBOARD PRINCIPAL
     ========================= */

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <header
        style={{
          background: 'var(--bg-card)',
          padding: '20px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Logo />
            <div>
              <h1 style={{ margin: 0 }}>Historial de Incidencias TI</h1>
              <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>
                Registro simple y rápido de resoluciones
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '13px' }}>
            <p style={{ margin: 0 }}>
              Técnico: <strong>{technicianName}</strong>
            </p>
            <p style={{ margin: 0 }}>Sesión: {user.email}</p>
          </div>
        </div>
      </header>

      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '20px',
        }}
      >
        <IncidentForm
          onSuccess={() => setRefreshTrigger((prev) => prev + 1)}
        />
        <IncidentList refreshTrigger={refreshTrigger} />
      </main>
    </div>
  )
}
