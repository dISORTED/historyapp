'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import IncidentForm from '@/components/incident-form'
import IncidentList from '@/components/incident-list'
import AuthComponent from '@/components/auth'
import Logo from '@/components/logo'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription?.unsubscribe()
  }, [])

  if (loading)
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Cargando...</p>
      </div>
    )

  if (!user)
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AuthComponent />
      </div>
    )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      <header
        style={{
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          padding: '20px',
          marginBottom: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderBottom: '1px solid var(--border-color)'
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
            <div style={{ textAlign: 'right', fontSize: '13px' }}>
              <p style={{ margin: '0 0 8px 0' }}>Sesión: {user.email}</p>
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
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
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

      <footer
        style={{
          background: 'var(--bg-card)',
          padding: '20px',
          textAlign: 'center',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          marginTop: '40px',
          borderTop: '1px solid var(--border-color)'
        }}
      >
        <div style={{ marginBottom: '10px' }}>
          <Logo />
        </div>
        <p>© 2025 Historial de Incidencias TI - MVP v0.1</p>
      </footer>
    </div>
  )
}
