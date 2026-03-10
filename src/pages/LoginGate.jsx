import { useState } from 'react'
import { useApiKey } from '../context/ApiKeyContext'

export default function LoginGate() {
  const { saveKey } = useApiKey()
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!input.trim().startsWith('sk-')) {
      setError('La API key debe empezar con sk-ant-...')
      return
    }
    saveKey(input.trim())
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#080b14',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,180,120,0.06) 0%, transparent 70%)',
        top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none'
      }} />

      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24, padding: '52px 44px',
        maxWidth: 440, width: '100%',
        backdropFilter: 'blur(12px)',
        position: 'relative'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #00d4aa22, #0066ff22)',
            border: '1px solid rgba(0,212,170,0.3)',
            fontSize: 26, marginBottom: 20
          }}>⚡</div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800,
            color: '#f0f4ff', letterSpacing: '-0.5px', marginBottom: 8
          }}>
            Growth Hub
          </h1>
          <p style={{ color: '#4a5568', fontSize: 14, lineHeight: 1.6 }}>
            Herramientas de IA para SDR y Marketing.<br />Ingresa tu API key para continuar.
          </p>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{
            fontSize: 11, color: '#718096', display: 'block',
            marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600
          }}>
            Anthropic API Key
          </label>
          <input
            type="password"
            value={input}
            onChange={e => { setInput(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="sk-ant-api03-..."
            style={{
              width: '100%', background: 'rgba(255,255,255,0.05)',
              border: `1px solid ${error ? 'rgba(252,129,129,0.5)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: 12, color: '#f0f4ff', fontSize: 14,
              padding: '13px 16px', outline: 'none',
              fontFamily: 'monospace', transition: 'border-color 0.2s'
            }}
          />
          {error && <p style={{ color: '#fc8181', fontSize: 12, marginTop: 6 }}>{error}</p>}
        </div>

        <button
          onClick={handleSubmit}
          style={{
            width: '100%', padding: '14px',
            background: 'linear-gradient(135deg, #00d4aa, #0066ff)',
            border: 'none', borderRadius: 12, color: '#fff',
            fontSize: 15, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'Syne, sans-serif', letterSpacing: '0.02em',
            marginTop: 8, transition: 'opacity 0.2s'
          }}
          onMouseEnter={e => e.target.style.opacity = '0.9'}
          onMouseLeave={e => e.target.style.opacity = '1'}
        >
          Entrar al Hub →
        </button>

        <p style={{ color: '#2d3748', fontSize: 11, textAlign: 'center', marginTop: 20, lineHeight: 1.5 }}>
          Tu API key solo se usa en esta sesión del navegador y nunca se almacena.
        </p>
      </div>
    </div>
  )
}
