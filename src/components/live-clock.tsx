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
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

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
        gridTemplateColumns: 'minmax(120px, 170px) minmax(0, 1fr)',
        gap: '22px',
        alignItems: 'center',
        background:
          'radial-gradient(circle at top left, rgba(0, 166, 128, 0.18), transparent 38%), var(--bg-card)',
        overflow: 'hidden',
      }}
    >
      <div
        className="live-clock-face"
        style={{
          position: 'relative',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          background:
            'radial-gradient(circle, rgba(28, 28, 40, 0.95) 0%, rgba(10, 10, 15, 0.98) 75%)',
          boxShadow: 'inset 0 0 24px rgba(0, 0, 0, 0.45), 0 0 30px rgba(0, 166, 128, 0.12)',
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
                height: index % 3 === 0 ? '16px' : '10px',
                borderRadius: '999px',
                background: index % 3 === 0 ? 'rgba(240, 240, 245, 0.85)' : 'rgba(139, 139, 154, 0.75)',
                transformOrigin: '50% 67px',
                transform: `translateX(-50%) rotate(${rotation}deg)`,
              }}
            />
          )
        })}

        <span
          style={{
            position: 'absolute',
            inset: '18px',
            borderRadius: '50%',
            border: '1px solid rgba(255, 255, 255, 0.04)',
          }}
        />

        <span
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '50%',
            width: '5px',
            height: '40px',
            borderRadius: '999px',
            background: 'linear-gradient(180deg, #f0f0f5 0%, #8b8b9a 100%)',
            transformOrigin: '50% 100%',
            transform: `translateX(-50%) rotate(${hourRotation}deg)`,
            boxShadow: '0 0 10px rgba(240, 240, 245, 0.12)',
          }}
        />

        <span
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '50%',
            width: '3px',
            height: '56px',
            borderRadius: '999px',
            background: 'linear-gradient(180deg, #00e5b8 0%, #00a680 100%)',
            transformOrigin: '50% 100%',
            transform: `translateX(-50%) rotate(${minuteRotation}deg)`,
            boxShadow: '0 0 12px rgba(0, 166, 128, 0.35)',
          }}
        />

        <span
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '50%',
            width: '2px',
            height: '62px',
            borderRadius: '999px',
            background: '#ef4444',
            transformOrigin: '50% 100%',
            transform: `translateX(-50%) rotate(${secondRotation}deg)`,
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.35)',
          }}
        />

        <span
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#f0f0f5',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 0 4px rgba(0, 166, 128, 0.12)',
          }}
        />
      </div>

      <div className="live-clock-content" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignSelf: 'flex-start',
            padding: '6px 10px',
            borderRadius: '999px',
            background: 'rgba(0, 166, 128, 0.12)',
            color: 'var(--accent-primary)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Hora actual
        </div>
        <p
          style={{
            margin: 0,
            fontSize: '42px',
            lineHeight: 1,
            fontWeight: 700,
            letterSpacing: '-0.05em',
          }}
        >
          {time}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: '15px',
            color: 'var(--text-secondary)',
            textTransform: 'capitalize',
          }}
        >
          {date}
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '8px',
            marginTop: '6px',
          }}
        >
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Hora
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 600 }}>{String(hours).padStart(2, '0')}</p>
          </div>
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Min
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 600 }}>{String(minutes).padStart(2, '0')}</p>
          </div>
          <div
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Seg
            </p>
            <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 600 }}>{String(seconds).padStart(2, '0')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
