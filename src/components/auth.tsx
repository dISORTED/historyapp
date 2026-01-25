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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
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
        setMode('signin')
        alert('Verifica tu correo para confirmar la cuenta')
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

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <div style={{ marginBottom: '30px' }}>
        <Logo />
      </div>
      <form onSubmit={handleAuth}>
        {mode === 'signup' && (
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Nombre del técnico"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
        )}
        <div style={{ marginBottom: '12px' }}>
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '12px' }}>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        {error && <div style={{ color: 'var(--color-error)', marginBottom: '12px', fontSize: '14px' }}>{error}</div>}
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '8px', marginBottom: '12px', cursor: 'pointer', background: 'var(--accent-primary)', color: 'var(--bg-main)', border: 'none', borderRadius: '4px' }}
        >
          {loading ? 'Cargando...' : mode === 'signin' ? 'Iniciar sesión' : 'Registrarse'}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setError(null)
          }}
          style={{
            width: '100%',
            padding: '8px',
            cursor: 'pointer',
            background: 'transparent',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            borderRadius: '4px'
          }}
        >
          {mode === 'signin' ? '¿No tienes cuenta?' : 'Volver a iniciar sesión'}
        </button>
      </form>
    </div>
  )
}
