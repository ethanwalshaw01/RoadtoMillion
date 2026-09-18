import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.tsx'
import { JobsProvider } from './state/JobsContext.tsx'
import { AuthProvider } from './state/AuthContext.tsx'
import { DriverDocsProvider } from './state/DriverDocsContext.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <DriverDocsProvider>
          <JobsProvider>
            <App />
          </JobsProvider>
        </DriverDocsProvider>
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
)
