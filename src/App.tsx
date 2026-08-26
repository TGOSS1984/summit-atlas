import { useTheme } from './context/ThemeContext'

// still just a placeholder — proving tokens + the theme toggle work
// end to end before the real layout goes in next commit
function App() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div style={{ padding: 40 }}>
      <h1>Summit Atlas</h1>
      <p style={{ color: 'var(--text-secondary)' }}>current theme: {theme}</p>
      <button
        onClick={toggleTheme}
        style={{
          marginTop: 16,
          padding: '10px 20px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--accent)',
          color: 'var(--accent-ink)',
          fontWeight: 600,
        }}
      >
        switch to {theme === 'dark' ? 'light' : 'dark'}
      </button>
    </div>
  )
}

export default App