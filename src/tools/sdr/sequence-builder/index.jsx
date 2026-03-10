import { useState, useRef, useEffect } from 'react'
import { useApiKey } from '../../../context/ApiKeyContext'

const SYSTEM_PROMPT = `Eres un experto en copywriting de ventas B2B y prospección outbound. Tu rol es ayudar a SDRs a crear secuencias de correos de prospección efectivas.

Cuando el SDR te pida una secuencia, genera emails numerados con este formato EXACTO para cada paso:

---EMAIL_START---
PASO: [número]
DELAY: [días desde el email anterior, el primero es 0]
ASUNTO: [línea de asunto]
CUERPO:
[cuerpo del email en texto plano, sin HTML]
---EMAIL_END---

Reglas importantes:
- Secuencias típicas: 4-6 emails en 2-3 semanas
- Tono: profesional pero humano, nunca robótico
- Emails cortos (menos de 150 palabras)
- Cada email con un ángulo diferente
- Siempre incluir un CTA claro
- Personalización con variables como {{nombre}}, {{empresa}}, {{cargo}}

Cuando el SDR quiera modificar algo, regenera SOLO los emails afectados con el mismo formato. Cuando confirme que está listo, dile que puede hacer clic en "Aprobar secuencia".`

function parseEmails(text) {
  const emails = []
  const regex = /---EMAIL_START---([\s\S]*?)---EMAIL_END---/g
  let match
  while ((match = regex.exec(text)) !== null) {
    const block = match[1].trim()
    const paso = block.match(/PASO:\s*(\d+)/)?.[1]
    const delay = block.match(/DELAY:\s*(\d+)/)?.[1]
    const asunto = block.match(/ASUNTO:\s*(.+)/)?.[1]?.trim()
    const cuerpoMatch = block.match(/CUERPO:\n([\s\S]+)/)
    const cuerpo = cuerpoMatch?.[1]?.trim()
    if (paso && asunto && cuerpo) {
      emails.push({ paso: parseInt(paso), delay: parseInt(delay || 0), asunto, cuerpo })
    }
  }
  return emails
}

function EmailCard({ email, index }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 12, marginBottom: 8, overflow: 'hidden'
    }}>
      <div onClick={() => setOpen(!open)} style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px', cursor: 'pointer', userSelect: 'none'
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: 'linear-gradient(135deg, #00d4aa, #0066ff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0
        }}>{email.paso}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: '#4a5568', marginBottom: 2 }}>
            {email.delay === 0 ? 'Día 1' : `+${email.delay} días`}
          </div>
          <div style={{
            fontSize: 14, fontWeight: 600, color: '#f0f4ff',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
          }}>{email.asunto}</div>
        </div>
        <span style={{ color: '#2d3748', transform: open ? 'rotate(90deg)' : 'none', transition: '0.2s' }}>›</span>
      </div>
      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 11, color: '#2d3748', marginTop: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Asunto</div>
          <div style={{ fontSize: 13, color: '#e2e8f0', background: 'rgba(0,212,170,0.07)', padding: '7px 10px', borderRadius: 7, borderLeft: '2px solid #00d4aa', marginBottom: 12 }}>
            {email.asunto}
          </div>
          <div style={{ fontSize: 11, color: '#2d3748', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Cuerpo</div>
          <div style={{
            fontSize: 13, color: '#a0aec0', lineHeight: 1.7,
            background: 'rgba(255,255,255,0.02)', padding: '10px 12px',
            borderRadius: 7, whiteSpace: 'pre-wrap', fontFamily: 'Georgia, serif'
          }}>{email.cuerpo}</div>
        </div>
      )}
    </div>
  )
}

export default function SequenceBuilder() {
  const { apiKey } = useApiKey()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [parsedEmails, setParsedEmails] = useState([])
  const [approved, setApproved] = useState(false)
  const [exportJson, setExportJson] = useState('')
  const [copied, setCopied] = useState(false)
  const chatRef = useRef(null)

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages, loading])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setApproved(false)

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          system: SYSTEM_PROMPT,
          messages: newMessages
        })
      })
      const data = await response.json()
      const text = data.content?.[0]?.text || 'Error al obtener respuesta.'
      setMessages([...newMessages, { role: 'assistant', content: text }])
      const emails = parseEmails(text)
      if (emails.length > 0) setParsedEmails(emails)
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexión.' }])
    }
    setLoading(false)
  }

  const handleApprove = () => {
    const json = JSON.stringify({ secuencia: parsedEmails }, null, 2)
    setExportJson(json)
    setApproved(true)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(exportJson)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <div ref={chatRef} style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: 80, color: '#2d3748' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✉️</div>
              <div style={{ fontSize: 14, lineHeight: 1.8 }}>
                Describe tu ICP, industria y propuesta de valor.<br />
                <span style={{ fontSize: 13, color: '#1a202c' }}>
                  Ej: "CTOs de SaaS B2B, ofrecemos ciberseguridad, 5 emails"
                </span>
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 14
            }}>
              <div style={{
                maxWidth: '80%',
                background: m.role === 'user' ? 'rgba(0,102,255,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${m.role === 'user' ? 'rgba(0,102,255,0.25)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                padding: '10px 14px', fontSize: 14, color: '#e2e8f0',
                lineHeight: 1.7, whiteSpace: 'pre-wrap'
              }}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 5, padding: '10px 0' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#00d4aa',
                  animation: 'bounce 1.2s infinite', animationDelay: `${i*0.2}s`
                }} />
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder="Describe tu secuencia o pide ajustes… (Enter para enviar)"
              rows={2}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 10, color: '#f0f4ff', fontSize: 14,
                padding: '10px 14px', outline: 'none', resize: 'none',
                fontFamily: 'Instrument Sans, sans-serif', lineHeight: 1.5
              }}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()} style={{
              background: loading || !input.trim()
                ? 'rgba(255,255,255,0.04)'
                : 'linear-gradient(135deg, #00d4aa, #0066ff)',
              border: 'none', borderRadius: 10, color: '#fff',
              padding: '0 18px', fontSize: 18, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer'
            }}>→</button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div style={{ width: 340, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#2d3748', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Preview
          </div>
          {parsedEmails.length > 0 && (
            <div style={{ fontSize: 12, color: '#4a5568', marginTop: 3 }}>
              {parsedEmails.length} emails
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
          {parsedEmails.length === 0
            ? <div style={{ color: '#2d3748', fontSize: 13, textAlign: 'center', marginTop: 60 }}>
                Los emails aparecerán aquí
              </div>
            : parsedEmails.map((e, i) => <EmailCard key={i} email={e} index={i} />)
          }
        </div>

        {parsedEmails.length > 0 && !approved && (
          <div style={{ padding: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <button onClick={handleApprove} style={{
              width: '100%', padding: 13,
              background: 'linear-gradient(135deg, #00d4aa, #0066ff)',
              border: 'none', borderRadius: 10, color: '#fff',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'Syne, sans-serif'
            }}>
              ✅ Aprobar y Exportar
            </button>
          </div>
        )}

        {approved && exportJson && (
          <div style={{ padding: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{
              background: 'rgba(0,212,170,0.07)', border: '1px solid rgba(0,212,170,0.2)',
              borderRadius: 10, padding: 12, marginBottom: 10
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#00d4aa', marginBottom: 4 }}>✅ Secuencia aprobada</div>
              <div style={{ fontSize: 12, color: '#4a5568', lineHeight: 1.5 }}>
                Copia el JSON y úsalo con <code style={{ color: '#00d4aa' }}>hubspot_upload.py</code>
              </div>
            </div>
            <div style={{
              background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: 10,
              maxHeight: 140, overflowY: 'auto', fontSize: 11,
              color: '#68d391', fontFamily: 'monospace', lineHeight: 1.5,
              marginBottom: 10, whiteSpace: 'pre-wrap'
            }}>{exportJson}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleCopy} style={{
                flex: 1, background: copied ? 'rgba(0,212,170,0.15)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${copied ? '#00d4aa' : 'rgba(255,255,255,0.1)'}`,
                color: copied ? '#00d4aa' : '#718096', borderRadius: 8,
                padding: '7px 0', fontSize: 12, cursor: 'pointer',
                fontFamily: 'Instrument Sans, sans-serif'
              }}>
                {copied ? '✓ Copiado' : 'Copiar JSON'}
              </button>
              <button onClick={() => setApproved(false)} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#4a5568', borderRadius: 8, padding: '7px 12px',
                fontSize: 12, cursor: 'pointer', fontFamily: 'Instrument Sans, sans-serif'
              }}>Editar</button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-7px)} }
        textarea:focus { border-color: rgba(0,212,170,0.35) !important; }
      `}</style>
    </div>
  )
}
