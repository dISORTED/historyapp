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
      if (user) setError(null)
      setLoading(false)
    }

    const bootstrap = async () => {
      try {
        const { session, error, timedOut } = await getSessionSnapshot(4000)
        if (!mountedRef.current) return

        if (error) {
          setError(error.message || 'No se pudo validar el enlace de recuperacion.')
          setLoading(false)
          return
        }
        if (timedOut || session === undefined) {
          setError('El enlace tardo demasiado en validarse. Solicita uno nuevo.')
          setLoading(false)
          return
        }

        applyRecoverySession(session?.user ?? null)
        if (!session?.user) setError('El enlace de recuperacion ya no es valido o expiro.')
      } catch (err) {
        if (!mountedRef.current) return
        setError(err instanceof Error ? err.message : 'No se pudo validar el enlace de recuperacion.')
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
          setError('El enlace de recuperacion ya no es valido o expiro.')
        }
      }

      if (event === 'SIGNED_OUT') {
        setCanReset(false)
        setError('La sesion de recuperacion finalizo. Solicita un enlace nuevo.')
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
      setError('La contrasena debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las contrasenas no coinciden.')
      return
    }

    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error

      setSuccessMessage('Contrasena actualizada. Te redirigiremos al inicio.')
      setPassword('')
      setConfirmPassword('')

      window.setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar la contrasena.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '560px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <Logo />
          <h1 style={{ margin: '16px 0 0', fontSize: '26px', fontWeight: 800 }}>Restablecer contrasena</h1>
          <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Define una nueva clave para recuperar acceso seguro al sistema.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '18px 0 6px' }}>
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
            <p style={{ margin: 0, fontSize: '14px' }}>Validando enlace de recuperacion...</p>
          </div>
        ) : canReset ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label>Nueva contrasena</label>
              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label>Confirmar contrasena</label>
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
                  marginBottom: '14px',
                  fontSize: '13px',
                  padding: '12px 14px',
                  background: 'var(--color-error-bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #f2c6ca',
                }}
              >
                {error}
              </div>
            )}

            {successMessage && (
              <div
                style={{
                  color: 'var(--color-success)',
                  marginBottom: '14px',
                  fontSize: '13px',
                  padding: '12px 14px',
                  background: 'var(--color-success-bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #bde7d7',
                }}
              >
                {successMessage}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>
                {saving ? 'Actualizando...' : 'Guardar nueva contrasena'}
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
                color: 'var(--color-error)',
                marginBottom: '16px',
                fontSize: '14px',
                padding: '12px 14px',
                background: 'var(--color-error-bg)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #f2c6ca',
              }}
            >
              {error || 'No se detecto una sesion de recuperacion valida.'}
            </div>
            <Link href="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              Volver al inicio
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
