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

        if (sessionError) throw sessionError
        if (timedOut) {
          setError('La validacion tardo demasiado. Intenta abrir el enlace nuevamente.')
          return
        }
        if (!session) {
          setError('No se pudo completar la autenticacion con el enlace recibido.')
          return
        }

        setMessage('Acceso validado. Te redirigiremos en un momento.')
        router.replace(nextPath)
      } catch (err) {
        if (!mountedRef.current) return
        setError(err instanceof Error ? err.message : 'No se pudo completar la autenticacion.')
      }
    }

    completeAuth()
    return () => {
      mountedRef.current = false
    }
  }, [router, searchParams])

  return (
    <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '520px', textAlign: 'center' }}>
        <div style={{ marginBottom: '18px' }}>
          <Logo />
        </div>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800 }}>Validando enlace</h1>
        <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Confirmamos tu acceso para continuar al flujo correcto.
        </p>

        <div style={{ marginTop: '20px' }}>
          {error ? (
            <>
              <div
                style={{
                  color: 'var(--color-error)',
                  marginBottom: '18px',
                  fontSize: '14px',
                  padding: '12px 14px',
                  background: 'var(--color-error-bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #f2c6ca',
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
                  width: '44px',
                  height: '44px',
                  border: '3px solid var(--border-color)',
                  borderTopColor: 'var(--accent-primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 14px',
                }}
              />
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>{message}</p>
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
