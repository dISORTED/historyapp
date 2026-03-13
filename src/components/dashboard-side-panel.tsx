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
    <div
      className="card dashboard-side-panel"
      style={{
        display: 'grid',
        gap: '18px',
        background:
          'linear-gradient(180deg, rgba(0, 166, 128, 0.08) 0%, rgba(19, 19, 26, 1) 28%)',
      }}
    >
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
          Resumen rápido
        </p>
        <h3 style={{ margin: '6px 0 0', fontSize: '18px' }}>Sistemas con más incidencias</h3>
        <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Vista rápida para detectar dónde se está concentrando la carga.
        </p>
      </div>

      <div className="dashboard-side-panel-grid" style={{ display: 'grid', gap: '10px' }}>
        {loading && (
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>
            Cargando resumen...
          </p>
        )}

        {!loading && systems.length === 0 && (
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>
            Aún no hay datos suficientes para mostrar sistemas destacados.
          </p>
        )}

        {!loading &&
          systems.length > 0 &&
          systems.map((item, index) => (
            <div
              key={`${item.system}-${index}`}
              className="dashboard-side-panel-item"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '14px',
                alignItems: 'start',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                minHeight: '108px',
              }}
            >
              <div style={{ minWidth: 0, display: 'grid', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0, 166, 128, 0.12)',
                    color: 'var(--accent-primary)',
                    fontWeight: 700,
                    fontSize: '13px',
                  }}
                >
                  {index + 1}
                </div>

                <p
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 600,
                    lineHeight: 1.35,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {item.system}
                </p>

                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Registros acumulados
                </p>
              </div>

              <div
                style={{
                  padding: '6px 10px',
                  borderRadius: '999px',
                  background: 'rgba(0, 166, 128, 0.12)',
                  color: 'var(--accent-primary)',
                  fontSize: '12px',
                  fontWeight: 600,
                  alignSelf: 'start',
                }}
              >
                {item.count}
              </div>
            </div>
          ))}
      </div>

      <div
        style={{
          paddingTop: '4px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'grid',
          gap: '8px',
        }}
      >
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Antes de guardar</p>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
          Usa un título específico y describe el impacto real para que el historial sirva después.
        </p>
      </div>
    </div>
  )
}
