'use client'

import { AdminKpiMetrics } from '@/lib/types'

interface AdminKpiCardsProps {
  metrics: AdminKpiMetrics
}

export default function AdminKpiCards({ metrics }: AdminKpiCardsProps) {
  const cards = [
    { title: 'Total incidencias', value: metrics.totalIncidents, hint: 'Registros filtrados', accent: '01' },
    { title: 'Incidencias hoy', value: metrics.incidentsToday, hint: 'Cierre en fecha actual', accent: '02' },
    { title: 'Técnicos activos', value: metrics.uniqueTechnicians, hint: 'Con registros en rango', accent: '03' },
    { title: 'Sistemas afectados', value: metrics.uniqueAffectedTools, hint: 'Herramientas reportadas', accent: '04' },
    { title: 'Hora más crítica', value: metrics.busiestHourLabel, hint: 'Mayor concentración', accent: '05' },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
      }}
      className="animate-fade-in"
    >
      {cards.map((card) => (
        <div
          key={card.title}
          className="card"
          style={{
            padding: '18px',
            background:
              'linear-gradient(180deg, rgba(0, 166, 128, 0.08) 0%, rgba(19, 19, 26, 1) 32%)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: '0 auto auto 0',
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0, 166, 128, 0.14) 0%, transparent 72%)',
              transform: 'translate(-28px, -28px)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                {card.title}
              </p>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'rgba(0, 166, 128, 0.12)',
                  color: 'var(--accent-primary)',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                {card.accent}
              </span>
            </div>

            <p style={{ margin: '0 0 8px', fontSize: '34px', fontWeight: 700, letterSpacing: '-0.04em' }}>
              {card.value}
            </p>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{card.hint}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
