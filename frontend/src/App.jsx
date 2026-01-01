import { Routes, Route, Link, useLocation } from 'react-router-dom'
import './App.css'
import Home from './views/Home'
import Search from './views/Search'

function App() {
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  return (
    <div className="app-root">
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
