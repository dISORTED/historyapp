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

  // Gate nombre técnico
  const [techName, setTechName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [showNameEditor, setShowNameEditor] = useState(false)

  // Evita que loadSession pise lo que el usuario está tecleando
  const [nameDirty, setNameDirty] = useState(false)

  // Evita resets por eventos repetidos con mismo usuario
  const lastUserIdRef = useRef<string | null>(null)

  const loadSession = async () => {
    const supabase = createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const u = session?.user || null
    setUser(u)

    if (!u) {
      lastUserIdRef.current = null
      setTechName('')
      setNameDirty(false)
      return
    }

    const currentUserId = String(u.id)
    const existingName = u?.user_metadata?.name ? String(u.user_metadata.name) : ''

    // Si cambió el usuario, reseteamos el dirty y cargamos el nombre del usuario nuevo
    if (lastUserIdRef.current !== currentUserId) {
      lastUserIdRef.current = currentUserId
      setNameDirty(false)
      setTechName(existingName)
      return
    }

    // Si NO cambió usuario:
    // - si ya hay nombre en metadata, lo sincronizamos (por si se actualizó desde otro lado)
    // - si no hay nombre, NO pisamos lo que está escribiendo
    if (existingName) {
      setTechName(existingName)
    } else if (!nameDirty) {
      setTechName(existingName) // solo si aún no ha escrito
    }
  }

  useEffect(() => {
    const supabase = createClient()

    const init = async () => {
      await loadSession()
      setLoading(false)
    }
    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async () => {
      await loadSession()
    })

    return () => subscription?.unsubscribe()
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

      // Después de guardar, ya no es "dirty"
      setNameDirty(false)

      await loadSession()
      setShowNameEditor(false)
    } catch (err) {
      setNameError(err instanceof Error ? err.message : 'No se pudo guardar el nombre.')
    } finally {
      setSavingName(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Cargando...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AuthComponent />
      </div>
    )
  }

  const technicianName = user?.user_metadata?.name ? String(user.user_metadata.name).trim() : ''

  // Gate si no hay nombre
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
            <Logo />
            <div>
              <h2 style={{ margin: 0 }}>Configurar nombre de técnico</h2>
              <p style={{ margin: '6px 0 0 0', fontSize: '13px', opacity: 0.85 }}>
                Para registrar tickets, primero debes definir tu nombre. Se asignará automáticamente como “Técnico asignado”.
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Nombre del técnico
            </label>
            <input
              type="text"
              value={techName}
              onChange={(e) => {
                setTechName(e.target.value)
                setNameDirty(true)
              }}
              placeholder="Ej: Sebastián Echeverría"
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
              autoFocus
            />
          </div>

          {nameError && (
            <div style={{ color: 'var(--color-error)', marginBottom: '12px', fontSize: '13px' }}>
              {nameError}
            </div>
          )}

          <button
            onClick={saveTechnicianName}
            disabled={savingName}
            style={{
              width: '100%',
              padding: '10px',
              background: 'var(--accent-primary)',
              color: 'var(--bg-main)',
              border: 'none',
              borderRadius: '10px',
              cursor: savingName ? 'not-allowed' : 'pointer',
              fontWeight: 800,
            }}
          >
            {savingName ? 'Guardando...' : 'Guardar y continuar'}
          </button>

          <button
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signOut()
            }}
            style={{
              width: '100%',
              padding: '10px',
              marginTop: '10px',
              background: 'transparent',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
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
          color: 'var(--text-primary)',
          padding: '20px',
          marginBottom: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Logo />
              <div>
                <h1 style={{ margin: '0 0 5px 0', fontSize: '28px' }}>Historial de Incidencias TI</h1>
                <p style={{ margin: 0, fontSize: '13px', opacity: 0.8 }}>Registro simple y rápido de resoluciones</p>
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '13px', minWidth: '280px' }}>
              <p style={{ margin: '0 0 4px 0' }}>
                Técnico: <strong>{technicianName}</strong>{' '}
                <button
                  onClick={() => {
                    setTechName(technicianName)
                    setShowNameEditor((v) => !v)
                    setNameError(null)
                    setNameDirty(false)
                  }}
                  style={{
                    marginLeft: '8px',
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '12px',
                  }}
                >
                  Cambiar nombre
                </button>
              </p>

              {showNameEditor && (
                <div style={{ marginTop: '8px' }}>
                  <input
                    type="text"
                    value={techName}
                    onChange={(e) => {
                      setTechName(e.target.value)
                      setNameDirty(true)
                    }}
                    placeholder="Nuevo nombre"
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box', marginBottom: '8px' }}
                  />

                  {nameError && (
                    <div style={{ color: 'var(--color-error)', marginBottom: '8px' }}>
                      {nameError}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={saveTechnicianName}
                      disabled={savingName}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: 'var(--accent-primary)',
                        color: 'var(--bg-main)',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: savingName ? 'not-allowed' : 'pointer',
                        fontWeight: 800,
                        fontSize: '12px',
                      }}
                    >
                      {savingName ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => {
                        setShowNameEditor(false)
                        setNameError(null)
                        setTechName(technicianName)
                        setNameDirty(false)
                      }}
                      style={{
                        flex: 1,
                        padding: '8px',
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <p style={{ margin: '8px 0 8px 0' }}>Sesión: {user.email}</p>

              <button
                onClick={async () => {
                  const supabase = createClient()
                  await supabase.auth.signOut()
                }}
                style={{
                  padding: '8px 16px',
                  background: 'var(--color-error)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 'bold',
                }}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', paddingBottom: '40px' }}>
        <IncidentForm onSuccess={() => setRefreshTrigger((prev) => prev + 1)} />
        <IncidentList refreshTrigger={refreshTrigger} />
      </main>
    </div>
  )
}

