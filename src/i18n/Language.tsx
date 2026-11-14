import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { messages, type Language } from './messages'

const storageKey = 'marea.language'
const LanguageContext = createContext<{
  language: Language
  setLanguage: (next: Language) => void
  t: typeof messages.es
} | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    try { return localStorage.getItem(storageKey) === 'en' ? 'en' : 'es' }
    catch { return 'es' }
  })
  useEffect(() => {
    document.documentElement.lang = language
    try { localStorage.setItem(storageKey, language) }
    catch { /* Language selection still works when storage is unavailable. */ }
  }, [language])
  return <LanguageContext.Provider value={{ language, setLanguage, t: messages[language] }}>
    {children}
  </LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('LanguageProvider is required')
  return context
}
