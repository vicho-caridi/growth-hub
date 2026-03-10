import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { TOOLS, TEAMS, getToolsByTeam } from '../tools/registry'
import { useApiKey } from '../context/ApiKeyContext'
import { useState } from 'react'

export default function Sidebar() {
  const navigate = useNavigate()
  const { toolId } = useParams()
  const location = useLocation()
  const { clearKey } = useApiKey()
  const [collapsed, setCollapsed] = useState(false)

  const isHome = location.pathname === '/'

  if (collapsed) {
    return (
      <div style={{
        width: 60, background: 'rgba(255,255,255,0.02)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '16px 0', gap: 8, transition: 'width 0.2s'
      }}>
        <button onClick={() => setCollapsed(false)} style={iconBtnStyle} title="Expandir">
          ▶
        </button>
        <button onClick={() => navigate('/')} style={iconBtnStyle} title="Home">⚡</button>
        <div style={{ flex: 1 }} />
        {TOOLS.filter(t => t.status === 'active').map(tool => (
          <button
            key={tool.id}
            onClick={() => navigate(`/tool/${tool.id}`)}
            title={tool.label}
            style={{
              ...iconBtnStyle,
              background: toolId === tool.id ? 'rgba(255,255,255,0.08)' : 'transparent'
            }}
          >
            {tool.icon}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div style={{
      width: 220, background: 'rgba(255,255,255,0.02)',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      flexShrink: 0, overflow: 'hidden'
    }}>
      {/* Logo */}
      <div style={{
        padding: '20px 20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #00d4aa33, #0066ff33)',
            border: '1px solid rgba(0,212,170,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15
          }}>⚡</div>
          <span style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: 15, color: '#f0f4ff', letterSpacing: '-0.3px'
          }}>
            Growth Hub
          </span>
        </div>
        <button onClick={() => setCollapsed(true)} style={iconBtnStyle} title="Colapsar">‹</button>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        {/* Home */}
        <SidebarItem
          icon="🏠" label="Dashboard"
          active={isHome}
          onClick={() => navigate('/')}
        />

        {/* Tools by team */}
        {TEAMS.filter(t => t.id !== 'all').map(team => {
          const teamTools = getToolsByTeam(team.id)
          return (
            <div key={team.id} style={{ marginTop: 20 }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: '#2d3748',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                padding: '0 8px', marginBottom: 4
              }}>
                {team.icon} {team.label}
              </div>
              {teamTools.map(tool => (
                <SidebarItem
                  key={tool.id}
                  icon={tool.icon}
                  label={tool.label}
                  active={toolId === tool.id}
                  muted={tool.status === 'coming-soon'}
                  accent={tool.color}
                  onClick={() => tool.status === 'active' && navigate(`/tool/${tool.id}`)}
                />
              ))}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 10px',
        borderTop: '1px solid rgba(255,255,255,0.06)'
      }}>
        <button
          onClick={clearKey}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 8, border: 'none',
            background: 'transparent', color: '#2d3748', fontSize: 13,
            cursor: 'pointer', fontFamily: 'Instrument Sans, sans-serif',
            transition: 'all 0.15s', textAlign: 'left'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(252,129,129,0.08)'; e.currentTarget.style.color = '#fc8181' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2d3748' }}
        >
          <span>🔑</span> Cambiar API key
        </button>
      </div>
    </div>
  )
}

function SidebarItem({ icon, label, active, muted, accent, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 10px', borderRadius: 8,
        background: active
          ? 'rgba(255,255,255,0.07)'
          : hovered && !muted ? 'rgba(255,255,255,0.04)' : 'transparent',
        cursor: muted ? 'default' : 'pointer',
        opacity: muted ? 0.35 : 1,
        transition: 'all 0.15s',
        borderLeft: active && accent ? `2px solid ${accent}` : '2px solid transparent',
        marginBottom: 2
      }}
    >
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span style={{
        fontSize: 13, fontWeight: active ? 600 : 400,
        color: active ? '#f0f4ff' : '#4a5568',
        flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
      }}>
        {label}
      </span>
      {muted && (
        <span style={{ fontSize: 9, color: '#2d3748', background: 'rgba(255,255,255,0.04)', borderRadius: 4, padding: '2px 5px' }}>
          Soon
        </span>
      )}
    </div>
  )
}

const iconBtnStyle = {
  width: 32, height: 32, borderRadius: 8, border: 'none',
  background: 'transparent', color: '#4a5568', fontSize: 15,
  cursor: 'pointer', display: 'flex', alignItems: 'center',
  justifyContent: 'center', transition: 'all 0.15s'
}
