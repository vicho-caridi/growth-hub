import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TOOLS, TEAMS, getToolsByTeam } from '../tools/registry'

function ToolCard({ tool, onClick }) {
  const [hovered, setHovered] = useState(false)
  const isActive = tool.status === 'active'

  return (
    <div
      onClick={() => isActive && onClick(tool.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered && isActive
          ? 'rgba(255,255,255,0.06)'
          : 'rgba(255,255,255,0.025)',
        border: `1px solid ${hovered && isActive ? `${tool.color}40` : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 18, padding: '28px 24px',
        cursor: isActive ? 'pointer' : 'default',
        transition: 'all 0.25s ease',
        transform: hovered && isActive ? 'translateY(-2px)' : 'none',
        position: 'relative', overflow: 'hidden',
        opacity: isActive ? 1 : 0.5,
      }}
    >
      {/* Glow accent */}
      {hovered && isActive && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 1,
          background: `linear-gradient(90deg, transparent, ${tool.color}60, transparent)`
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${tool.color}18`,
          border: `1px solid ${tool.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22
        }}>
          {tool.icon}
        </div>
        {tool.status === 'coming-soon' && (
          <span style={{
            fontSize: 10, fontWeight: 600, color: '#4a5568',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: '3px 10px', letterSpacing: '0.06em', textTransform: 'uppercase'
          }}>
            Próximamente
          </span>
        )}
        {tool.status === 'active' && (
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: tool.color,
            boxShadow: `0 0 8px ${tool.color}`
          }} />
        )}
      </div>

      <div style={{
        fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 700,
        color: '#f0f4ff', marginBottom: 8, letterSpacing: '-0.2px'
      }}>
        {tool.label}
      </div>
      <div style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.6 }}>
        {tool.description}
      </div>

      {/* Team badge */}
      <div style={{
        marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 11, color: '#4a5568', textTransform: 'uppercase',
        letterSpacing: '0.08em', fontWeight: 600
      }}>
        <span style={{
          display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
          background: tool.team === 'sdr' ? '#00d4aa' : '#f59e0b'
        }} />
        {tool.team}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [activeTeam, setActiveTeam] = useState('all')
  const navigate = useNavigate()
  const tools = getToolsByTeam(activeTeam)
  const activeCount = TOOLS.filter(t => t.status === 'active').length

  return (
    <div style={{ padding: '48px 40px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            fontSize: 11, fontWeight: 600, color: '#00d4aa',
            background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)',
            borderRadius: 20, padding: '3px 12px', letterSpacing: '0.08em', textTransform: 'uppercase'
          }}>
            {activeCount} herramienta{activeCount !== 1 ? 's' : ''} activa{activeCount !== 1 ? 's' : ''}
          </div>
        </div>
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800,
          color: '#f0f4ff', letterSpacing: '-1px', marginBottom: 10
        }}>
          Growth Hub
        </h1>
        <p style={{ color: '#4a5568', fontSize: 15, lineHeight: 1.6, maxWidth: 480 }}>
          Todas las herramientas de IA de tu equipo en un solo lugar.
          Selecciona una para empezar.
        </p>
      </div>

      {/* Team tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {TEAMS.map(team => (
          <button
            key={team.id}
            onClick={() => setActiveTeam(team.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 18px', borderRadius: 10, border: 'none',
              background: activeTeam === team.id
                ? 'rgba(255,255,255,0.1)'
                : 'transparent',
              color: activeTeam === team.id ? '#f0f4ff' : '#4a5568',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.2s', fontFamily: 'Instrument Sans, sans-serif',
              outline: activeTeam === team.id ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent'
            }}
          >
            <span>{team.icon}</span>
            {team.label}
            <span style={{
              fontSize: 11, background: 'rgba(255,255,255,0.06)',
              borderRadius: 10, padding: '1px 7px',
              color: '#718096'
            }}>
              {getToolsByTeam(team.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Tool grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16
      }}>
        {tools.map(tool => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onClick={(id) => navigate(`/tool/${id}`)}
          />
        ))}
      </div>
    </div>
  )
}
