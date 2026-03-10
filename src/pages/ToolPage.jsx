import { useParams, useNavigate } from 'react-router-dom'
import { getToolById } from '../tools/registry'

export default function ToolPage() {
  const { toolId } = useParams()
  const navigate = useNavigate()
  const tool = getToolById(toolId)

  if (!tool) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100%', gap: 16
      }}>
        <div style={{ fontSize: 48 }}>🔍</div>
        <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, color: '#f0f4ff' }}>
          Herramienta no encontrada
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, color: '#a0aec0', padding: '8px 20px',
            cursor: 'pointer', fontFamily: 'Instrument Sans, sans-serif', fontSize: 14
          }}
        >
          ← Volver al dashboard
        </button>
      </div>
    )
  }

  const ToolComponent = tool.component

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Tool header */}
      <div style={{
        padding: '14px 24px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'rgba(255,255,255,0.01)', flexShrink: 0
      }}>
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none', border: 'none', color: '#2d3748',
            fontSize: 13, cursor: 'pointer', padding: '4px 8px',
            borderRadius: 6, fontFamily: 'Instrument Sans, sans-serif',
            display: 'flex', alignItems: 'center', gap: 4,
            transition: 'color 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#718096'}
          onMouseLeave={e => e.currentTarget.style.color = '#2d3748'}
        >
          ⚡ Hub
        </button>
        <span style={{ color: '#2d3748', fontSize: 13 }}>/</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: `${tool.color}20`, border: `1px solid ${tool.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13
          }}>
            {tool.icon}
          </div>
          <span style={{
            fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700,
            color: '#f0f4ff'
          }}>
            {tool.label}
          </span>
        </div>
        <div style={{
          marginLeft: 'auto', fontSize: 11, fontWeight: 600,
          color: tool.team === 'sdr' ? '#00d4aa' : '#f59e0b',
          background: tool.team === 'sdr' ? 'rgba(0,212,170,0.1)' : 'rgba(245,158,11,0.1)',
          border: `1px solid ${tool.team === 'sdr' ? 'rgba(0,212,170,0.2)' : 'rgba(245,158,11,0.2)'}`,
          borderRadius: 20, padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.06em'
        }}>
          {tool.team}
        </div>
      </div>

      {/* Tool content */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <ToolComponent />
      </div>
    </div>
  )
}
