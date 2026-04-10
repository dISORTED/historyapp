'use client'

import { AdminKpiMetrics } from '@/lib/types'

interface AdminKpiCardsProps {
  metrics: AdminKpiMetrics
}

export default function AdminKpiCards({ metrics }: AdminKpiCardsProps) {
  const cards = [
    { title: 'Total incidencias', value: metrics.totalIncidents, hint: 'Registros filtrados', accent: '01' },
    { title: 'Incidencias hoy', value: metrics.incidentsToday, hint: 'Atencion en fecha actual', accent: '02' },
    { title: 'Tecnicos activos', value: metrics.uniqueTechnicians, hint: 'Con registros en rango', accent: '03' },
    { title: 'Sistemas afectados', value: metrics.uniqueAffectedTools, hint: 'Herramientas reportadas', accent: '04' },
    { title: 'Hora mas critica', value: metrics.busiestHourLabel, hint: 'Mayor concentracion', accent: '05' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }} className="animate-fade-in">
      {cards.map((card) => (
        <div key={card.title} className="card" style={{ padding: '18px', position: 'relative', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              inset: '0 auto auto 0',
              width: '92px',
              height: '92px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(31, 115, 183, 0.12) 0%, transparent 72%)',
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
                marginBottom: '10px',
              }}
            >
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {card.title}
              </p>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '30px',
                  height: '30px',
                  borderRadius: '9px',
                  background: 'var(--accent-soft)',
                  color: 'var(--accent-primary)',
                  fontSize: '12px',
                  fontWeight: 800,
                }}
              >
                {card.accent}
              </span>
            </div>

            <p style={{ margin: '0 0 6px', fontSize: '32px', fontWeight: 800, letterSpacing: '-0.04em' }}>{card.value}</p>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{card.hint}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
