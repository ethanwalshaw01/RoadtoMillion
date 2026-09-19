import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.tsx'
import { SettingsProvider } from './state/SettingsContext.tsx'
import { ToastProvider } from './state/ToastContext.tsx'
import { AuthProvider } from './state/AuthContext.tsx'
import { DriverProfileProvider } from './state/DriverProfileContext.tsx'
import { JobsProvider } from './state/JobsContext.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <SettingsProvider>
        <ToastProvider>
          <AuthProvider>
            <DriverProfileProvider>
              <JobsProvider>
                <App />
              </JobsProvider>
            </DriverProfileProvider>
          </AuthProvider>
        </ToastProvider>
      </SettingsProvider>
    </HashRouter>
  </StrictMode>,
)
