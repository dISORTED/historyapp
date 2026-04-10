'use client'

import { useEffect, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { IncidentByDate, getIncidentsByDate } from '@/lib/incidents'

interface IncidentsChartProps {
  refreshTrigger: number
}

export default function IncidentsChart({ refreshTrigger }: IncidentsChartProps) {
  const [data, setData] = useState<IncidentByDate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const incidentsData = await getIncidentsByDate()
        setData(incidentsData)
      } catch {
        setData([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [refreshTrigger])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-CL', { month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <div className="card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Cargando grafico...</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>No hay datos suficientes para mostrar el grafico</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card animate-fade-in" style={{ minHeight: '320px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Incidencias por dia</h3>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Cantidad de registros por fecha de resolucion</p>
      </div>

      <div style={{ width: '100%', height: '240px', marginTop: 'auto' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 12, left: -4, bottom: 0 }}>
            <defs>
              <linearGradient id="incidentsArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1f73b7" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#1f73b7" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#dde7f1" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              stroke="#7d90a7"
              tick={{ fill: '#4a607a', fontSize: 12 }}
              axisLine={{ stroke: '#cdd9e6' }}
              tickLine={false}
            />
            <YAxis
              stroke="#7d90a7"
              tick={{ fill: '#4a607a', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={32}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #d8e2ed',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-md)',
              }}
              labelStyle={{ color: 'var(--text-primary)', fontWeight: 700, marginBottom: '4px' }}
              itemStyle={{ color: 'var(--accent-primary)' }}
              labelFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#1f73b7"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#incidentsArea)"
              dot={{ fill: '#1f73b7', strokeWidth: 0, r: 4 }}
              activeDot={{ fill: '#14548c', strokeWidth: 0, r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
