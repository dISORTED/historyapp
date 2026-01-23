import type { Metadata } from 'next'
import Dashboard from './dashboard'

export const metadata: Metadata = {
  title: 'Historial de Incidencias TI',
  description: 'Registro histórico simple de incidencias TI resueltas',
}

export default function Home() {
  return <Dashboard />
}
