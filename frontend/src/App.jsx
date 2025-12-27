import { useState, useEffect } from 'react'
import './App.css'
import SearchForm from './components/SearchForm'
import ResultCard from './components/ResultCard'

const API_URL = 'http://localhost:5001/api'

function App() {
  const [stations, setStations] = useState([])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchParams, setSearchParams] = useState({ from: '', to: '' })

  useEffect(() => {
    fetchStations()
  }, [])

  const fetchStations = async () => {
    try {
      const response = await fetch(`${API_URL}/stations`)
      const data = await response.json()
      if (data.success) {
        setStations(data.data)
      }
    } catch (err) {
      console.error('Error fetching stations:', err)
    }
  }

  const handleSearch = async (from, to) => {
    setLoading(true)
    setError(null)
    setResults(null)
    setSearchParams({ from, to })

    try {
      const response = await fetch(`${API_URL}/search?from=${from}&to=${to}`)
      const data = await response.json()
      
      if (data.success) {
        setResults(data)
      } else {
        setError(data.error || 'Search failed')
      }
    } catch (err) {
      setError('Unable to connect to server. Make sure the backend is running.')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStationName = (code) => {
    const station = stations.find(s => s.code === code)
    return station ? station.name : code
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🚂</span>
          <h1>Connect Express</h1>
        </div>
        <p className="tagline">Find connecting trains when direct routes aren't available</p>
      </header>

      <section className="search-section">
        <SearchForm 
          stations={stations} 
          onSearch={handleSearch} 
          loading={loading}
        />
        {error && <div className="error-message">{error}</div>}
      </section>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Searching for routes...</p>
        </div>
      )}

      {results && !loading && (
        <section className="results-section">
          <div className="results-header">
            <h2 className="results-title">
              {getStationName(searchParams.from)} → {getStationName(searchParams.to)}
            </h2>
            <div className="results-summary">
              <span className="summary-badge direct">
                {results.directCount} Direct
              </span>
              <span className="summary-badge connecting">
                {results.connectingCount} Connecting
              </span>
            </div>
          </div>

          {results.directCount === 0 && results.connectingCount === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No routes found</h3>
              <p>Try searching between different stations</p>
            </div>
          ) : (
            <div className="result-cards">
              {results.results.direct.map((route, index) => (
                <ResultCard 
                  key={`direct-${index}`} 
                  route={route}
                  getStationName={getStationName}
                />
              ))}

              {results.results.direct.length > 0 && results.results.connecting.length > 0 && (
                <div className="section-divider">
                  <span>Connecting Routes</span>
                </div>
              )}

              {results.results.connecting.map((route, index) => (
                <ResultCard 
                  key={`connecting-${index}`} 
                  route={route}
                  getStationName={getStationName}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

export default App
