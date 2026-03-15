'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Logo from './logo'

type AuthMode = 'signin' | 'signup' | 'reset'

function getAuthCallbackUrl(nextPath: string) {
  const url = new URL('/auth/callback', window.location.origin)
  url.searchParams.set('next', nextPath)
  return url.toString()
}

export default function AuthComponent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<AuthMode>('signin')
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const goToMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setError(null)
    setSuccessMessage(null)
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      const supabase = createClient()

      if (mode === 'signup') {
        if (!name.trim()) throw new Error('El nombre es obligatorio')

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name.trim() },
            emailRedirectTo: getAuthCallbackUrl('/signup-confirmed'),
          },
        })

        if (error) throw error

        setEmail('')
        setPassword('')
        setName('')
        setSuccessMessage('Revisa tu correo para confirmar tu cuenta.')
        goToMode('signin')
        return
      }

      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: getAuthCallbackUrl('/reset-password'),
        })

        if (error) throw error

        setSuccessMessage('Te enviamos un enlace para recuperar tu contraseña.')
        return
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="card animate-fade-in"
      style={{
        maxWidth: '420px',
        margin: '0 auto',
        padding: '40px 32px',
        boxShadow: 'var(--shadow-lg)',
      }}
    >
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <Logo />
      </div>

      <h2
        style={{
          textAlign: 'center',
          fontSize: '24px',
          fontWeight: 700,
          marginBottom: '8px',
          letterSpacing: '-0.02em',
        }}
      >
        {mode === 'signin' ? 'Bienvenido de vuelta' : mode === 'signup' ? 'Crear cuenta' : 'Recuperar contraseña'}
      </h2>

      <p
        style={{
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '14px',
          marginBottom: '28px',
        }}
      >
        {mode === 'signin'
          ? 'Ingresa tus credenciales para continuar'
          : mode === 'signup'
            ? 'Regístrate para comenzar a registrar incidencias'
            : 'Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña'}
      </p>

      <form onSubmit={handleAuth}>
        {mode === 'signup' && (
          <div style={{ marginBottom: '20px' }}>
            <label>Nombre del técnico</label>
            <input
              type="text"
              placeholder="Ej: Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}

        <div style={{ marginBottom: mode === 'reset' ? '24px' : '20px' }}>
          <label>Correo electrónico</label>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {mode !== 'reset' && (
          <div style={{ marginBottom: '20px' }}>
            <label>Contraseña</label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        )}

        {error && (
          <div
            style={{
              color: 'var(--color-error)',
              marginBottom: '20px',
              fontSize: '13px',
              padding: '12px',
              background: 'var(--color-error-bg)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>!</span> {error}
          </div>
        )}

        {successMessage && (
          <div
            style={{
              color: 'var(--color-success)',
              marginBottom: '20px',
              fontSize: '13px',
              padding: '12px',
              background: 'var(--color-success-bg)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>OK</span> {successMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '15px' }}
        >
          {loading ? (
            <>
              <span
                style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              Procesando...
            </>
          ) : mode === 'signin' ? (
            'Iniciar sesión'
          ) : mode === 'signup' ? (
            'Crear cuenta'
          ) : (
            'Enviar enlace'
          )}
        </button>

        {mode === 'signin' && (
          <div style={{ marginTop: '14px', textAlign: 'right' }}>
            <button
              type="button"
              onClick={() => goToMode('reset')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                padding: 0,
              }}
            >
              Olvidé mi contraseña
            </button>
          </div>
        )}

        <div
          style={{
            textAlign: 'center',
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-light)',
          }}
        >
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
              margin: 0,
            }}
          >
            {mode === 'signin'
              ? 'No tienes cuenta?'
              : mode === 'signup'
                ? 'Ya tienes una cuenta?'
                : 'Recordaste tu contraseña?'}
            <button
              type="button"
              onClick={() => goToMode(mode === 'signin' ? 'signup' : 'signin')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                cursor: 'pointer',
                fontWeight: 600,
                marginLeft: '6px',
                fontSize: '14px',
                padding: 0,
              }}
            >
              {mode === 'signin' ? 'Regístrate' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}
