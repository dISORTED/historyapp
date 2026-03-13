'use client'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface TrendPoint {
  label: string
  count: number
}

interface AdminTrendChartProps {
  data: TrendPoint[]
}

export default function AdminTrendChart({ data }: AdminTrendChartProps) {
  return (
    <div
      className="card"
      style={{
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(19, 19, 26, 1) 100%)',
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'inline-flex',
            padding: '6px 10px',
            borderRadius: '999px',
            background: 'rgba(0, 166, 128, 0.12)',
            color: 'var(--accent-primary)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            marginBottom: '12px',
          }}
        >
          Evolución
        </div>
        <h3 style={{ margin: 0, fontSize: '20px' }}>Tendencia de incidencias</h3>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Evolución diaria según fecha de cierre
        </p>
      </div>

      <div style={{ height: '300px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="adminTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00a680" stopOpacity={0.42} />
                <stop offset="95%" stopColor="#00a680" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border-color)' }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#00a680"
              fill="url(#adminTrend)"
              strokeWidth={2}
              activeDot={{ r: 6, fill: '#00c49a', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
