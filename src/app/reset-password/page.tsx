'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import Logo from '@/components/logo'
import { createClient, getSessionSnapshot } from '@/lib/supabase-client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [canReset, setCanReset] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const applyRecoverySession = (user: User | null) => {
      if (!mountedRef.current) return

      setCanReset(Boolean(user))
      if (user) {
        setError(null)
      }
      setLoading(false)
    }

    const bootstrap = async () => {
      try {
        const { session, error, timedOut } = await getSessionSnapshot(4000)

        if (!mountedRef.current) return

        if (error) {
          setError(error.message || 'No se pudo validar el enlace de recuperación.')
          setLoading(false)
          return
        }

        if (timedOut || session === undefined) {
          setError('El enlace tardó demasiado en validarse. Solicita uno nuevo si el problema continúa.')
          setLoading(false)
          return
        }

        applyRecoverySession(session?.user ?? null)

        if (!session?.user) {
          setError('El enlace de recuperación ya no es válido o expiró.')
        }
      } catch (err) {
        if (!mountedRef.current) return
        setError(err instanceof Error ? err.message : 'No se pudo validar el enlace de recuperación.')
        setLoading(false)
      }
    }

    const supabase = createClient()
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mountedRef.current) return

      if (
        event === 'PASSWORD_RECOVERY' ||
        event === 'SIGNED_IN' ||
        event === 'INITIAL_SESSION' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED'
      ) {
        applyRecoverySession(session?.user ?? null)

        if (!session?.user && event === 'INITIAL_SESSION') {
          setError('El enlace de recuperación ya no es válido o expiró.')
        }
      }

      if (event === 'SIGNED_OUT') {
        setCanReset(false)
        setError('La sesión de recuperación finalizó. Solicita un enlace nuevo.')
        setLoading(false)
      }
    })

    bootstrap()

    return () => {
      mountedRef.current = false
      data.subscription?.unsubscribe()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setSaving(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) throw error

      setSuccessMessage('Contraseña actualizada correctamente. Te redirigiremos al inicio.')
      setPassword('')
      setConfirmPassword('')

      window.setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña.')
    } finally {
      setSaving(false)
    }
  }

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
            'radial-gradient(circle at top, rgba(0, 166, 128, 0.16) 0%, rgba(0, 166, 128, 0.04) 28%, transparent 60%)',
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
            padding: '28px 32px 22px',
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
            Seguridad de acceso
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
            Restablecer contraseña
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
            Define una nueva contraseña para volver a ingresar con seguridad a tu historial de incidencias.
          </p>
        </div>

        <div style={{ padding: '28px 32px 32px' }}>
          {loading ? (
            <div
              style={{
                textAlign: 'center',
                color: 'var(--text-secondary)',
                padding: '18px 0 10px',
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
              <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>Validando enlace</p>
              <p style={{ margin: '6px 0 0', fontSize: '13px', lineHeight: 1.6 }}>
                Estamos comprobando tu acceso de recuperación.
              </p>
            </div>
          ) : canReset ? (
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  marginBottom: '22px',
                }}
              >
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Recomendación
                </p>
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Usa una contraseña de al menos 6 caracteres y evita repetir una que ya hayas usado recientemente.
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label>Nueva contraseña</label>
                <input
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label>Confirmar contraseña</label>
                <input
                  type="password"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div
                  style={{
                    color: 'var(--color-error)',
                    marginBottom: '16px',
                    fontSize: '13px',
                    padding: '12px 14px',
                    background: 'var(--color-error-bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255, 107, 107, 0.2)',
                  }}
                >
                  {error}
                </div>
              )}

              {successMessage && (
                <div
                  style={{
                    color: 'var(--color-success)',
                    marginBottom: '16px',
                    fontSize: '13px',
                    padding: '12px 14px',
                    background: 'var(--color-success-bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(81, 207, 102, 0.18)',
                  }}
                >
                  {successMessage}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1, padding: '14px' }}>
                  {saving ? 'Actualizando...' : 'Guardar nueva contraseña'}
                </button>
                <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                  Cancelar
                </Link>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  margin: '0 auto 18px',
                  borderRadius: '50%',
                  background: error ? 'var(--color-error-bg)' : 'rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  color: error ? 'var(--color-error)' : 'var(--text-secondary)',
                }}
              >
                {error ? '!' : '?'}
              </div>

              <div
                style={{
                  color: error ? 'var(--color-error)' : 'var(--text-secondary)',
                  marginBottom: '22px',
                  fontSize: '14px',
                  lineHeight: 1.7,
                  maxWidth: '360px',
                  marginInline: 'auto',
                }}
              >
                {error || 'No se detectó una sesión de recuperación válida.'}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                  Volver al inicio
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
