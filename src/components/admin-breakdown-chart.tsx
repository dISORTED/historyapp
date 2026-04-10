'use client'

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface BreakdownItem {
  label: string
  count: number
}

interface AdminBreakdownChartProps {
  title: string
  subtitle: string
  data: BreakdownItem[]
}

const CHART_COLORS = ['#1f73b7', '#2b7dc0', '#3a88ca', '#4a92d2', '#5b9eda', '#72aee4']

export default function AdminBreakdownChart({ title, subtitle, data }: AdminBreakdownChartProps) {
  return (
    <div className="card">
      <div style={{ marginBottom: '16px' }}>
        <div className="badge badge-info" style={{ marginBottom: '10px' }}>
          Ranking
        </div>
        <h3 style={{ margin: 0, fontSize: '20px' }}>{title}</h3>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>{subtitle}</p>
      </div>

      <div style={{ height: '300px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dde7f1" horizontal={false} />
            <XAxis type="number" allowDecimals={false} tick={{ fill: '#4a607a', fontSize: 12 }} axisLine={{ stroke: '#cdd9e6' }} />
            <YAxis dataKey="label" type="category" width={140} tick={{ fill: '#4a607a', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #d8e2ed',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-md)',
              }}
              formatter={(value) => [value ?? 0, 'Incidencias']}
            />
            <Bar dataKey="count" radius={[0, 10, 10, 0]} barSize={22}>
              {data.map((entry, index) => (
                <Cell key={`${entry.label}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
