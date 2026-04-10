'use client'

import { useEffect, useState } from 'react'

export default function TopbarClock() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  const time = now.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const date = now.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="topbar-clock">
      <span className="topbar-clock-time">{time}</span>
      <span className="topbar-clock-date">{date}</span>
    </div>
  )
}
