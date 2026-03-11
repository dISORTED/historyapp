'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import Logo from './logo'

export default function AuthComponent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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
            data: { name }
          }
        })
        if (error) throw error
        setEmail('')
        setPassword('')
        setName('')
        setSuccessMessage('¡Revisa tu correo para confirmar tu cuenta!')
        setMode('signin')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de autenticación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card animate-fade-in" style={{ 
      maxWidth: '420px', 
      margin: '0 auto', 
      padding: '40px 32px',
      boxShadow: 'var(--shadow-lg)'
    }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <Logo />
      </div>

      <h2 style={{ 
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 700,
        marginBottom: '8px',
        letterSpacing: '-0.02em'
      }}>
        {mode === 'signin' ? '¡Bienvenido de vuelta!' : 'Crear cuenta'}
      </h2>
      
      <p style={{ 
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '14px',
        marginBottom: '28px'
      }}>
        {mode === 'signin' 
          ? 'Ingresa tus credenciales para continuar' 
          : 'Regístrate para comenzar a registrar incidencias'}
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

        <div style={{ marginBottom: '20px' }}>
          <label>Correo electrónico</label>
          <input
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Contraseña</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {error && (
          <div style={{ 
            color: 'var(--color-error)', 
            marginBottom: '20px', 
            fontSize: '13px',
            padding: '12px',
            background: 'var(--color-error-bg)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>⚠</span> {error}
          </div>
        )}

        {successMessage && (
          <div style={{ 
            color: 'var(--color-success)', 
            marginBottom: '20px', 
            fontSize: '13px',
            padding: '12px',
            background: 'var(--color-success-bg)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>✓</span> {successMessage}
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
              <span style={{
                width: '18px',
                height: '18px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              Procesando...
            </>
          ) : mode === 'signin' ? 'Iniciar sesión' : 'Crear cuenta'}
        </button>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-light)'
        }}>
          <p style={{ 
            color: 'var(--text-secondary)', 
            fontSize: '14px',
            margin: 0
          }}>
            {mode === 'signin' ? '¿No tienes cuenta?' : '¿Ya tienes una cuenta?'}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin')
                setError(null)
                setSuccessMessage(null)
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-primary)',
                cursor: 'pointer',
                fontWeight: 600,
                marginLeft: '6px',
                fontSize: '14px',
                padding: 0
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
