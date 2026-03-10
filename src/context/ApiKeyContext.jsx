import { createContext, useContext, useState } from 'react'

const ApiKeyContext = createContext(null)

export function ApiKeyProvider({ children }) {
  const [apiKey, setApiKey] = useState('')
  const [isSet, setIsSet] = useState(false)

  const saveKey = (key) => {
    setApiKey(key)
    setIsSet(true)
  }

  const clearKey = () => {
    setApiKey('')
    setIsSet(false)
  }

  return (
    <ApiKeyContext.Provider value={{ apiKey, isSet, saveKey, clearKey }}>
      {children}
    </ApiKeyContext.Provider>
  )
}

export const useApiKey = () => useContext(ApiKeyContext)
