'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
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
      } catch (error) {
        console.error('Error loading chart data:', error)
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
        <div style={{ color: 'var(--text-secondary)' }}>Cargando gráfico...</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}>📊</div>
          <p>No hay datos suficientes para mostrar el gráfico</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card animate-fade-in">
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
          Incidencias por día
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Cantidad de registros por fecha de resolución
        </p>
      </div>

      <div style={{ height: '280px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00a680" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#00a680" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--border-light)" 
              vertical={false}
            />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="var(--text-muted)"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--border-color)' }}
              tickLine={false}
            />
            <YAxis 
              stroke="var(--text-muted)"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
              }}
              labelStyle={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}
              itemStyle={{ color: 'var(--accent-primary)' }}
              labelFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#00a680"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorGradient)"
              dot={{ fill: '#00a680', strokeWidth: 0, r: 4 }}
              activeDot={{ fill: '#00c49a', strokeWidth: 0, r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
