'use client'

import { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { getIncidentsByTechnician } from '@/lib/incidents'

interface IncidentsByTechnicianProps {
  refreshTrigger: number
}

export default function IncidentsByTechnician({ refreshTrigger }: IncidentsByTechnicianProps) {
  const [data, setData] = useState<{technician: string, count: number}[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const techData = await getIncidentsByTechnician()
        setData(techData)
      } catch (error) {
        console.error('Error loading technician data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [refreshTrigger])

  const colors = [
    '#00a680',
    '#00c49a',
    '#00896a',
    '#00b387',
    '#00d4a3',
    '#007a5c',
  ]

  const RADIAN = Math.PI / 180

  const renderCustomizedLabel = ({ 
    cx, cy, midAngle, innerRadius, outerRadius, percent, name 
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
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
          <div style={{ fontSize: '32px', marginBottom: '8px', opacity: 0.5 }}>👥</div>
          <p>No hay datos de técnicos</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card animate-fade-in">
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
          Incidencias por técnico
        </h3>
        <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Distribución de tickets por responsable
        </p>
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
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-md)',
              }}
              labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
              itemStyle={{ color: 'var(--text-primary)' }}
              formatter={(value: any, name: any) => [value, `${name} - Tickets`]}
            />
            <Legend 
              formatter={(value) => <span style={{ color: 'var(--text-primary)' }}>{value}</span>}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
