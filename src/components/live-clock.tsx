'use client'

import { useEffect, useState } from 'react'

function formatDateTime(value: Date) {
  return {
    time: value.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    date: value.toLocaleDateString('es-CL', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
  }
}

export default function LiveClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const { time, date } = formatDateTime(now)
  const seconds = now.getSeconds()
  const minutes = now.getMinutes()
  const hours = now.getHours()

  const secondRotation = seconds * 6
  const minuteRotation = minutes * 6 + seconds * 0.1
  const hourRotation = (hours % 12) * 30 + minutes * 0.5

  return (
    <div
      className="card live-clock-card"
      style={{
        minHeight: '220px',
        display: 'grid',
        gridTemplateColumns: 'minmax(120px, 168px) minmax(0, 1fr)',
        gap: '20px',
        alignItems: 'center',
      }}
    >
      <div
        className="live-clock-face"
        style={{
          position: 'relative',
          width: '148px',
          height: '148px',
          borderRadius: '50%',
          border: '1px solid #d4dfeb',
          background: 'linear-gradient(180deg, #ffffff 0%, #f3f8fd 100%)',
          boxShadow: 'inset 0 0 0 6px #f8fbff',
          justifySelf: 'center',
        }}
      >
        {[...Array(12)].map((_, index) => {
          const rotation = index * 30
          return (
            <span
              key={rotation}
              style={{
                position: 'absolute',
                top: '8px',
                left: '50%',
                width: index % 3 === 0 ? '3px' : '2px',
                height: index % 3 === 0 ? '14px' : '9px',
                borderRadius: '999px',
                background: index % 3 === 0 ? 'var(--text-primary)' : '#9fb1c5',
                transformOrigin: '50% 66px',
                transform: `translateX(-50%) rotate(${rotation}deg)`,
              }}
            />
          )
        })}

        <span
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '50%',
            width: '5px',
            height: '40px',
            borderRadius: '999px',
            background: '#35597a',
            transformOrigin: '50% 100%',
            transform: `translateX(-50%) rotate(${hourRotation}deg)`,
          }}
        />

        <span
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '50%',
            width: '3px',
            height: '54px',
            borderRadius: '999px',
            background: 'var(--accent-primary)',
            transformOrigin: '50% 100%',
            transform: `translateX(-50%) rotate(${minuteRotation}deg)`,
          }}
        />

        <span
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '50%',
            width: '2px',
            height: '60px',
            borderRadius: '999px',
            background: 'var(--color-error)',
            transformOrigin: '50% 100%',
            transform: `translateX(-50%) rotate(${secondRotation}deg)`,
          }}
        />

        <span
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '11px',
            height: '11px',
            borderRadius: '50%',
            background: 'var(--text-primary)',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>

      <div className="live-clock-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="badge badge-info" style={{ alignSelf: 'flex-start' }}>
          Hora actual
        </div>
        <p
          style={{
            margin: 0,
            fontSize: '40px',
            lineHeight: 1,
            fontWeight: 800,
            letterSpacing: '-0.04em',
          }}
        >
          {time}
        </p>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{date}</p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '8px',
            marginTop: '4px',
          }}
        >
          <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hora</p>
            <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 700 }}>{String(hours).padStart(2, '0')}</p>
          </div>
          <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Min</p>
            <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 700 }}>{String(minutes).padStart(2, '0')}</p>
          </div>
          <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Seg</p>
            <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 700 }}>{String(seconds).padStart(2, '0')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
