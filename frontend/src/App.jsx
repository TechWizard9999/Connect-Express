import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import './App.css'
import Home from './views/Home'
import Search from './views/Search'

function App() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'
  
  // Theme state - check localStorage for saved preference, default to dark
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    // Default to dark if no preference saved
    if (!saved) {
      document.documentElement.setAttribute('data-theme', 'dark')
      return 'dark'
    }
    document.documentElement.setAttribute('data-theme', saved)
    return saved
  })

  // Apply theme to document when changed
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="app-root">
      {/* Theme Toggle Button */}
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* Global Background (only on non-home pages if home has its own) */}
      {!isHomePage && (
        <div className="bg-container">
          <div className="bg-aurora"></div>
          <div className="bg-grid"></div>
          <div className="bg-tracks">
            <div className="track-line"></div>
          </div>
        </div>
      )}

      <div className={isHomePage ? "" : "app"}>
        {!isHomePage && (
          <header className="header">
            <Link to="/" className="logo-link">
              <div className="logo small">
                <span className="logo-icon">🚄</span>
                <h1>Connect Express</h1>
              </div>
            </Link>
          </header>
        )}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </div>
      
      {!isHomePage && (
        <footer className="footer">
          <p>&copy; 2026 Connect Express. Engineered for speed.</p>
        </footer>
      )}
    </div>
  )
}

export default App
