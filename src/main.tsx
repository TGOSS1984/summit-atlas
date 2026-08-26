import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { ClimbsProvider } from './context/ClimbsContext'
import './styles/tokens.css'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ClimbsProvider>
        <App />
      </ClimbsProvider>
    </ThemeProvider>
  </StrictMode>,
)