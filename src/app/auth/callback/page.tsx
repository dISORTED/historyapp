'use client'

import Link from 'next/link'
import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Logo from '@/components/logo'
import { createClient, getSessionSnapshot } from '@/lib/supabase-client'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('Estamos validando tu acceso.')
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const completeAuth = async () => {
      const nextPath = searchParams.get('next') || '/'
      const code = searchParams.get('code')
      const supabase = createClient()

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
        }

        const { session, error: sessionError, timedOut } = await getSessionSnapshot(4000)

        if (!mountedRef.current) return

        if (sessionError) {
          throw sessionError
        }

        if (timedOut) {
          setError('La validación tardó demasiado. Intenta abrir el enlace nuevamente.')
          return
        }

        if (!session) {
          setError('No se pudo completar la autenticación con el enlace recibido.')
          return
        }

        setMessage('Acceso validado. Te redirigiremos en un momento.')
        router.replace(nextPath)
      } catch (err) {
        if (!mountedRef.current) return
        setError(err instanceof Error ? err.message : 'No se pudo completar la autenticación.')
      }
    }

    completeAuth()

    return () => {
      mountedRef.current = false
    }
  }, [router, searchParams])

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
          maxWidth: '520px',
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
            Validación segura
          </div>

          <div style={{ marginBottom: '22px' }}>
            <Logo />
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 700,
              letterSpacing: '-0.03em',
            }}
          >
            Validando enlace
          </h1>

          <p
            style={{
              margin: '10px 0 0',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              maxWidth: '360px',
              lineHeight: 1.6,
            }}
          >
            Estamos comprobando tu confirmación o recuperación para redirigirte a la pantalla correcta.
          </p>
        </div>

        <div style={{ padding: '28px 32px 32px', textAlign: 'center' }}>
          {error ? (
            <>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 18px',
                  borderRadius: '50%',
                  background: 'var(--color-error-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  color: 'var(--color-error)',
                }}
              >
                !
              </div>

              <div
                style={{
                  color: 'var(--color-error)',
                  marginBottom: '22px',
                  fontSize: '14px',
                  lineHeight: 1.7,
                  maxWidth: '360px',
                  marginInline: 'auto',
                }}
              >
                {error}
              </div>

              <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                Volver al inicio
              </Link>
            </>
          ) : (
            <>
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
              <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>Procesando</p>
              <p style={{ margin: '6px 0 0', fontSize: '13px', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                {message}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackContent />
    </Suspense>
  )
}
