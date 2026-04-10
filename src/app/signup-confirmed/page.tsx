'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import Logo from '@/components/logo'
import { createClient, getSessionSnapshot } from '@/lib/supabase-client'

export default function SignupConfirmedPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [message, setMessage] = useState('Estamos validando tu confirmacion de cuenta.')
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const applyUser = (nextUser: User | null) => {
      if (!mountedRef.current) return

      setUser(nextUser)
      setLoading(false)

      if (nextUser) {
        const displayName = nextUser.user_metadata?.name ? String(nextUser.user_metadata.name) : 'tu cuenta'
        setMessage(`Gracias por registrarte, ${displayName}. Tu cuenta ya quedo confirmada y lista para ingresar.`)
      } else {
        setMessage('Tu enlace ya fue procesado. Si no ves la sesion iniciada, vuelve al inicio e ingresa normalmente.')
      }
    }

    const bootstrap = async () => {
      try {
        const { session, error, timedOut } = await getSessionSnapshot(4000)
        if (!mountedRef.current) return

        if (error) {
          setMessage(error.message || 'No se pudo validar la confirmacion de la cuenta.')
          setLoading(false)
          return
        }
        if (timedOut || session === undefined) {
          setMessage('La confirmacion tardo demasiado. Si ya confirmaste correo, intenta ingresar en inicio.')
          setLoading(false)
          return
        }

        applyUser(session?.user ?? null)
      } catch (err) {
        if (!mountedRef.current) return
        setMessage(err instanceof Error ? err.message : 'No se pudo validar la confirmacion de la cuenta.')
        setLoading(false)
      }
    }

    const supabase = createClient()
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mountedRef.current) return
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        applyUser(session?.user ?? null)
      }
    })

    bootstrap()
    return () => {
      mountedRef.current = false
      data.subscription?.unsubscribe()
    }
  }, [])

  return (
    <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '560px', textAlign: 'center' }}>
        <div style={{ marginBottom: '16px' }}>
          <Logo />
        </div>
        <div className="badge badge-success" style={{ marginBottom: '14px' }}>
          Registro confirmado
        </div>
        <h1 style={{ margin: 0, fontSize: '30px', fontWeight: 800 }}>Cuenta validada</h1>
        <p style={{ margin: '10px 0 0', color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.7 }}>{message}</p>

        {loading ? (
          <div style={{ marginTop: '20px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                border: '3px solid var(--border-color)',
                borderTopColor: 'var(--accent-primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 12px',
              }}
            />
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Confirmando cuenta...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
            <Link href="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Ir al inicio
            </Link>
            <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              Volver al login
            </Link>
          </div>
        )}

        {user && (
          <p style={{ margin: '14px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Sesion detectada para: {user.email}
          </p>
        )}
      </div>
    </div>
  )
}
