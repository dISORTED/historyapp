'use client'

import { useEffect, useState } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { getIncidentsByTechnician } from '@/lib/incidents'

interface IncidentsByTechnicianProps {
  refreshTrigger: number
}

interface TechnicianPoint {
  technician: string
  count: number
}

interface PieLabelPayload {
  cx: number
  cy: number
  midAngle: number
  innerRadius: number
  outerRadius: number
  percent: number
}

export default function IncidentsByTechnician({ refreshTrigger }: IncidentsByTechnicianProps) {
  const [data, setData] = useState<TechnicianPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const techData = await getIncidentsByTechnician()
        setData(techData)
      } catch {
        setData([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [refreshTrigger])

  const colors = ['#1f73b7', '#2f82c2', '#4a95d1', '#65a8df', '#81b9e9', '#9ccbf2']
  const RADIAN = Math.PI / 180

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelPayload) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return percent > 0.05 ? (
      <text x={x} y={y} fill="#0e3152" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null
  }

  if (loading) {
    return (
      <div className="card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Cargando...</div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>No hay datos de tecnicos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card animate-fade-in">
      <div style={{ marginBottom: '18px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Incidencias por tecnico</h3>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>Distribucion de tickets por responsable</p>
      </div>

      <div style={{ height: '100%', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 0, right: 15, left: 0, bottom: 0 }}>
            <Pie
              data={data}
              dataKey="count"
              nameKey="technician"
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={40}
              label={renderCustomizedLabel}
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`${entry.technician}-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #d8e2ed',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-md)',
              }}
              labelStyle={{ color: 'var(--text-primary)', fontWeight: 700 }}
              itemStyle={{ color: 'var(--text-primary)' }}
              formatter={(value: number, name: string) => [value, `${name} - Tickets`]}
            />
            <Legend formatter={(value) => <span style={{ color: 'var(--text-primary)' }}>{value}</span>} iconType="circle" iconSize={8} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
