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
    <div className="card">
      <div style={{ marginBottom: '16px' }}>
        <div className="badge badge-info" style={{ marginBottom: '10px' }}>
          Evolucion
        </div>
        <h3 style={{ margin: 0, fontSize: '20px' }}>Tendencia de incidencias</h3>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Evolucion diaria segun fecha de atencion</p>
      </div>

      <div style={{ height: '300px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="adminTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1f73b7" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#1f73b7" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#dde7f1" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#4a607a', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#cdd9e6' }} />
            <YAxis allowDecimals={false} tick={{ fill: '#4a607a', fontSize: 12 }} tickLine={false} axisLine={false} width={34} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #d8e2ed',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-md)',
              }}
            />
            <Area type="monotone" dataKey="count" stroke="#1f73b7" fill="url(#adminTrend)" strokeWidth={2.5} activeDot={{ r: 6, fill: '#14548c', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
