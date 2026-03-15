'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import Logo from '@/components/logo'
import { createClient, getSessionSnapshot } from '@/lib/supabase-client'

export default function SignupConfirmedPage() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [message, setMessage] = useState('Estamos validando tu confirmación de cuenta.')
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const applyUser = (nextUser: User | null) => {
      if (!mountedRef.current) return

      setUser(nextUser)
      setLoading(false)

      if (nextUser) {
        const displayName = nextUser.user_metadata?.name ? String(nextUser.user_metadata.name) : 'tu cuenta'
        setMessage(`Gracias por registrarte, ${displayName}. Tu cuenta ya quedó confirmada y lista para ingresar.`)
      } else {
        setMessage('Tu enlace ya fue procesado. Si no ves la sesión iniciada, vuelve al inicio e ingresa normalmente.')
      }
    }

    const bootstrap = async () => {
      try {
        const { session, error, timedOut } = await getSessionSnapshot(4000)

        if (!mountedRef.current) return

        if (error) {
          setMessage(error.message || 'No se pudo validar la confirmación de la cuenta.')
          setLoading(false)
          return
        }

        if (timedOut || session === undefined) {
          setMessage('La confirmación tardó demasiado en validarse. Si ya confirmaste el correo, vuelve al inicio e intenta ingresar.')
          setLoading(false)
          return
        }

        applyUser(session?.user ?? null)
      } catch (err) {
        if (!mountedRef.current) return
        setMessage(err instanceof Error ? err.message : 'No se pudo validar la confirmación de la cuenta.')
        setLoading(false)
      }
    }

    const supabase = createClient()
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mountedRef.current) return

      if (
        event === 'SIGNED_IN' ||
        event === 'INITIAL_SESSION' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED'
      ) {
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
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at top, rgba(0, 166, 128, 0.18) 0%, rgba(0, 166, 128, 0.05) 28%, transparent 62%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '0',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
          background: 'linear-gradient(180deg, rgba(0, 166, 128, 0.08) 0%, rgba(19, 19, 26, 1) 22%)',
        }}
      >
        <div
          style={{
            padding: '28px 32px 24px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              padding: '7px 12px',
              borderRadius: '999px',
              background: 'rgba(0, 166, 128, 0.12)',
              color: 'var(--accent-primary)',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '18px',
            }}
          >
            Registro confirmado
          </div>

          <div style={{ marginBottom: '22px' }}>
            <Logo />
          </div>

          <div
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              background: 'radial-gradient(circle at top, rgba(0, 166, 128, 0.22), rgba(0, 166, 128, 0.06))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '34px',
              color: 'var(--accent-primary)',
              boxShadow: 'var(--shadow-glow)',
              marginBottom: '20px',
            }}
          >
            OK
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: '30px',
              fontWeight: 700,
              letterSpacing: '-0.03em',
            }}
          >
            Gracias por registrarte
          </h1>

          <p
            style={{
              margin: '10px 0 0',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              maxWidth: '390px',
              lineHeight: 1.7,
            }}
          >
            Tu acceso al historial de incidencias ya fue validado correctamente.
          </p>
        </div>

        <div style={{ padding: '28px 32px 32px' }}>
          {loading ? (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--text-secondary)',
                padding: '20px 0 8px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  border: '3px solid var(--border-color)',
                  borderTopColor: 'var(--accent-primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 18px',
                  boxShadow: 'var(--shadow-glow)',
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>Confirmando cuenta</p>
              <p style={{ margin: '6px 0 0', fontSize: '13px', lineHeight: 1.6 }}>{message}</p>
            </div>
          ) : (
            <>
              <div
                style={{
                  padding: '16px 18px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  marginBottom: '22px',
                }}
              >
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Estado
                </p>
                <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {message}
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  marginBottom: '22px',
                }}
              >
                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Acceso
                  </p>
                  <p style={{ margin: '8px 0 0', fontSize: '14px' }}>Cuenta activa</p>
                </div>

                <div
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Siguiente paso
                  </p>
                  <p style={{ margin: '8px 0 0', fontSize: '14px' }}>{user ? 'Ya puedes usar el sistema' : 'Inicia sesión para continuar'}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  Ir al inicio
                </Link>
                <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                  Volver al login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
