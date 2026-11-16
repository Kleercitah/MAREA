import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/inter'
import { App } from './app/App'
import { LanguageProvider } from './i18n/Language'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}><LanguageProvider><App /></LanguageProvider></BrowserRouter>
  </StrictMode>,
)
