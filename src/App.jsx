import { Routes, Route, Navigate } from 'react-router-dom'
import { ApiKeyProvider, useApiKey } from './context/ApiKeyContext'
import LoginGate from './pages/LoginGate'
import Dashboard from './pages/Dashboard'
import ToolPage from './pages/ToolPage'
import Sidebar from './components/Sidebar'

function AppShell() {
  const { isSet } = useApiKey()

  if (!isSet) return <LoginGate />

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <main style={{ flex: 1, overflowY: 'auto', background: '#080b14' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tool/:toolId" element={<ToolPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ApiKeyProvider>
      <AppShell />
    </ApiKeyProvider>
  )
}
