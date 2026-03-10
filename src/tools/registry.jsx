/**
 * TOOL REGISTRY — tools/registry.js
 * ===================================
 * Para agregar una nueva herramienta al hub:
 *
 * 1. Crea tu componente en src/tools/{equipo}/{nombre}/index.jsx
 * 2. Agrégalo aquí con su metadata
 * 3. ¡Listo! Aparecerá automáticamente en el dashboard y sidebar.
 *
 * No necesitas tocar App.jsx, Sidebar.jsx ni Dashboard.jsx.
 */

import SequenceBuilder from './sdr/sequence-builder/index.jsx'

// ── Placeholder para tools futuras ──────────────────────────────────────────
const ComingSoon = ({ name }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', height: '60vh', gap: 16, opacity: 0.4
  }}>
    <div style={{ fontSize: 48 }}>🚧</div>
    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700 }}>{name}</div>
    <div style={{ fontSize: 14, color: '#718096' }}>Próximamente</div>
  </div>
)

// ── REGISTRY ─────────────────────────────────────────────────────────────────
export const TOOLS = [
  // ── SDR ────────────────────────────────────────────────────────────────────
  {
    id: 'sequence-builder',
    team: 'sdr',
    label: 'Sequence Builder',
    description: 'Crea secuencias de email outbound con IA y expórtalas a HubSpot.',
    icon: '✉️',
    color: '#00d4aa',
    status: 'active',          // 'active' | 'coming-soon'
    component: SequenceBuilder,
  },
  {
    id: 'linkedin-messages',
    team: 'sdr',
    label: 'LinkedIn Messages',
    description: 'Genera mensajes de conexión y follow-up para LinkedIn.',
    icon: '💼',
    color: '#0077b5',
    status: 'coming-soon',
    component: () => <ComingSoon name="LinkedIn Messages" />,
  },

  // ── Marketing ──────────────────────────────────────────────────────────────
  {
    id: 'icp-analyzer',
    team: 'marketing',
    label: 'ICP Analyzer',
    description: 'Define y documenta tu Ideal Customer Profile con IA.',
    icon: '🎯',
    color: '#f59e0b',
    status: 'coming-soon',
    component: () => <ComingSoon name="ICP Analyzer" />,
  },
  {
    id: 'content-creator',
    team: 'marketing',
    label: 'Content Creator',
    description: 'Genera contenido para LinkedIn, newsletters y blog.',
    icon: '✍️',
    color: '#ec4899',
    status: 'coming-soon',
    component: () => <ComingSoon name="Content Creator" />,
  },
]

export const TEAMS = [
  { id: 'all',       label: 'Todo',       icon: '⚡' },
  { id: 'sdr',       label: 'SDR',        icon: '📩' },
  { id: 'marketing', label: 'Marketing',  icon: '📣' },
]

export const getToolsByTeam = (teamId) =>
  teamId === 'all' ? TOOLS : TOOLS.filter(t => t.team === teamId)

export const getToolById = (id) => TOOLS.find(t => t.id === id)
