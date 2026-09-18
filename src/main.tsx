import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { JobsProvider } from './state/JobsContext.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <JobsProvider>
        <App />
      </JobsProvider>
    </BrowserRouter>
  </StrictMode>,
)
