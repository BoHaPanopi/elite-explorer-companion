import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { I18nProvider } from './i18n.tsx'
import AppErrorBoundary from './components/AppErrorBoundary.tsx'
import { invoke } from '@tauri-apps/api/core'

window.addEventListener('error', (event) => {
  void invoke('log_frontend_failure', {
    kind: 'javascript_error',
    message: event.message || 'unknown error',
    stack: event.error instanceof Error ? event.error.stack ?? null : null,
  })
})

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
  void invoke('log_frontend_failure', {
    kind: 'unhandled_rejection',
    message: reason.message,
    stack: reason.stack ?? null,
  })
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider><AppErrorBoundary><App /></AppErrorBoundary></I18nProvider>
  </StrictMode>,
)
