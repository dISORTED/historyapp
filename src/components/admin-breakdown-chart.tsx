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

const CHART_COLORS = ['#00a680', '#00ad85', '#00b58b', '#00bd92', '#00c49a', '#00cfaa']

export default function AdminBreakdownChart({ title, subtitle, data }: AdminBreakdownChartProps) {
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
          Ranking
        </div>
        <h3 style={{ margin: 0, fontSize: '20px' }}>{title}</h3>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>{subtitle}</p>
      </div>

      <div style={{ height: '300px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" horizontal={false} />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--border-color)' }}
            />
            <YAxis
              dataKey="label"
              type="category"
              width={140}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
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
