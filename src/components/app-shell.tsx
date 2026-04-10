'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import Logo from './logo'
import TopbarClock from './topbar-clock'

type ShellSection = 'dashboard' | 'history' | 'analytics' | 'admin'

interface QuickLink {
  label: string
  href: string
  icon: ReactNode
}

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
  const isAnalytics = section === 'analytics'
  const isAdmin = section === 'admin'
  const quickLinks: QuickLink[] = [
    {
      label: 'Recuperar contrasena',
      href: 'https://recuperatuclave.santotomas.cl/',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M17 8h-1V6a4 4 0 0 0-8 0h2a2 2 0 1 1 4 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm0 10H7v-8h10Z"
          />
        </svg>
      ),
    },
    {
      label: 'Actualizar contrasena',
      href: 'https://actualizatuclave.santotomas.cl/',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 2a5 5 0 0 0-5 5v2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm3 7H9V7a3 3 0 1 1 6 0Zm-3 8a2 2 0 0 1-1-3.73V12h2v1.27A2 2 0 0 1 12 17Z"
          />
        </svg>
      ),
    },
    {
      label: 'Aulas virtuales',
      href: 'https://aulasvirtuales.santotomas.cl/login/index.php',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3Zm0 9.74L5.19 9 12 5.26 18.81 9 12 12.74ZM6 14.66V17c0 2.2 2.69 4 6 4s6-1.8 6-4v-2.34l-6 3.27Z"
          />
        </svg>
      ),
    },
    {
      label: 'Misaplicaciones',
      href: 'https://misaplicaciones.santotomas.cl',
      icon: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z"
          />
        </svg>
      ),
    },
  ]

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
          <Link href="/analitica" className={`app-nav-link ${isAnalytics ? 'active' : ''}`}>
            Analitica
          </Link>
          {showAdminLink && (
            <Link href="/admin" className={`app-nav-link ${isAdmin ? 'active' : ''}`}>
              Admin
            </Link>
          )}
        </nav>

        <section className="app-sidebar-support" aria-label="Gestion Usuarios">
          <p className="app-sidebar-support-title">Gestion Usuarios</p>
          <div className="app-sidebar-support-links">
            {quickLinks.map((quickLink) => (
              <a
                key={quickLink.label}
                href={quickLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className="app-support-link"
              >
                <span className="app-support-link-icon">{quickLink.icon}</span>
                <span>{quickLink.label}</span>
              </a>
            ))}
          </div>
          <p className="app-sidebar-support-note">Nota: el cambio de clave puede tardar hasta 2 horas en reflejarse.</p>
        </section>

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
          <div className="app-topbar-actions">
            <TopbarClock />
            {topActions}
          </div>
        </header>

        <main className="app-main">{children}</main>
      </section>
    </div>
  )
}
