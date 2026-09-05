import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { UnitProvider } from './context/UnitContext'
import { AuthProvider } from './context/AuthContext'
import { ClimbsProvider } from './context/ClimbsContext'
import { CustomPeaksProvider } from './context/CustomPeaksContext'
import './styles/tokens.css'
import './styles/global.css'
import 'flag-icons/css/flag-icons.min.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <UnitProvider>
        <AuthProvider>
          <ClimbsProvider>
            <CustomPeaksProvider>
              <App />
            </CustomPeaksProvider>
          </ClimbsProvider>
        </AuthProvider>
      </UnitProvider>
    </ThemeProvider>
  </StrictMode>,
)