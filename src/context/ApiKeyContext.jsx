import { createContext, useContext, useState } from 'react'
const ApiKeyContext = createContext(null)
const ENV_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''
export function ApiKeyProvider({ children }) {
  const [apiKey, setApiKey] = useState(ENV_KEY)
  const [isSet, setIsSet] = useState(!!ENV_KEY)
  const saveKey = (key) => { setApiKey(key); setIsSet(true) }
  const clearKey = () => { setApiKey(ENV_KEY); setIsSet(!!ENV_KEY) }
  return <ApiKeyContext.Provider value={{ apiKey, isSet, saveKey, clearKey }}>{children}</ApiKeyContext.Provider>
}
export const useApiKey = () => useContext(ApiKeyContext)
