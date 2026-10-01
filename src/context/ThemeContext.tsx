import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'summit-atlas-theme'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

// mirrors the inline script in index.html so the first React render already
// agrees with whatever's on the <html> tag — no flash, no fighting itself.
// dark is the default landing theme now: a saved choice still wins, but a
// first-time visitor no longer falls back to prefers-color-scheme, they
// land on dark regardless of their OS setting
function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggleTheme = () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'))
  // explicit setter for the sidebar's segmented pill - a toggle doesn't work
  // once each button represents a fixed state instead of "flip whatever's on"
  const setTheme = (next: Theme) => setThemeState(next)

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  // only fires if I forget to wrap something in the provider — fail loud
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}