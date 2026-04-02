import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import StartupGate from './components/StartupGate.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StartupGate>
      <App />
    </StartupGate>
  </StrictMode>,
)
