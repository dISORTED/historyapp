'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import Logo from './logo'

type ShellSection = 'dashboard' | 'history' | 'admin'

interface AppShellProps {
  section: ShellSection
  title: string
  subtitle: string
  userName: string
  userEmail: string
  onSignOut: () => void
  showAdminLink: boolean
  topActions?: ReactNode
  children: ReactNode
}

export default function AppShell({
  section,
  title,
  subtitle,
  userName,
  userEmail,
  onSignOut,
  showAdminLink,
  topActions,
  children,
}: AppShellProps) {
  const isDashboard = section === 'dashboard'
  const isHistory = section === 'history'
  const isAdmin = section === 'admin'

  return (
    <div className="app-shell app-shell-layout">
      <aside className="app-sidebar">
        <div className="app-sidebar-brand">
          <Logo compact />
        </div>

        <nav className="app-sidebar-nav">
          <Link href="/" className={`app-nav-link ${isDashboard ? 'active' : ''}`}>
            Dashboard
          </Link>
          <Link href="/historial" className={`app-nav-link ${isHistory ? 'active' : ''}`}>
            Historial
          </Link>
          {showAdminLink && (
            <Link href="/admin" className={`app-nav-link ${isAdmin ? 'active' : ''}`}>
              Admin
            </Link>
          )}
        </nav>

        <div className="app-sidebar-user">
          <p className="app-sidebar-user-name">{userName}</p>
          <p className="app-sidebar-user-email">{userEmail}</p>
          <button onClick={onSignOut} className="btn btn-secondary" style={{ width: '100%', marginTop: '10px' }}>
            Cerrar sesion
          </button>
        </div>
      </aside>

      <section className="app-shell-content">
        <header className="app-topbar">
          <div>
            <h1 className="app-topbar-title">{title}</h1>
            <p className="app-topbar-subtitle">{subtitle}</p>
          </div>
          <div className="app-topbar-actions">{topActions}</div>
        </header>

        <main className="app-main">{children}</main>
      </section>
    </div>
  )
}
