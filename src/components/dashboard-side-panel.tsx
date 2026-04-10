'use client'

import { useEffect, useState } from 'react'
import { getTopSystemsWithFailures } from '@/lib/incidents'

interface DashboardSidePanelProps {
  refreshTrigger: number
}

interface TopSystemItem {
  system: string
  count: number
}

export default function DashboardSidePanel({ refreshTrigger }: DashboardSidePanelProps) {
  const [systems, setSystems] = useState<TopSystemItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const data = await getTopSystemsWithFailures(4)
        setSystems(data)
      } catch {
        setSystems([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [refreshTrigger])

  return (
    <div className="card dashboard-side-panel" style={{ display: 'grid', gap: '16px' }}>
      <div>
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            color: 'var(--accent-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 700,
          }}
        >
          Resumen rapido
        </p>
        <h3 style={{ margin: '6px 0 0', fontSize: '18px' }}>Sistemas con mas incidencias</h3>
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Vista de apoyo para detectar concentracion de carga.
        </p>
      </div>

      <div className="dashboard-side-panel-grid" style={{ display: 'grid', gap: '10px' }}>
        {loading && <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>Cargando resumen...</p>}

        {!loading && systems.length === 0 && (
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>
            Aun no hay datos suficientes para mostrar sistemas destacados.
          </p>
        )}

        {!loading &&
          systems.length > 0 &&
          systems.map((item, index) => (
            <div
              key={`${item.system}-${index}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '14px',
                alignItems: 'start',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-light)',
                minHeight: '104px',
              }}
            >
              <div style={{ minWidth: 0, display: 'grid', gap: '8px' }}>
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--accent-soft)',
                    color: 'var(--accent-primary)',
                    fontWeight: 700,
                    fontSize: '12px',
                  }}
                >
                  {index + 1}
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 700,
                    lineHeight: 1.35,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {item.system}
                </p>

                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>Registros acumulados</p>
              </div>

              <div className="badge badge-info" style={{ alignSelf: 'start' }}>
                {item.count}
              </div>
            </div>
          ))}
      </div>

      <div
        style={{
          paddingTop: '6px',
          borderTop: '1px solid var(--border-light)',
          display: 'grid',
          gap: '8px',
        }}
      >
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700 }}>Antes de guardar</p>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
          Usa titulos especificos y describe impacto real para que el historial sea util despues.
        </p>
      </div>
    </div>
  )
}
