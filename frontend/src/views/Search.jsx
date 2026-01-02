import { useState, useEffect, useMemo } from 'react'
import SearchForm from '../components/SearchForm'
import ResultCard from '../components/ResultCard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api'

function Search() {
  const [stations, setStations] = useState([])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchParams, setSearchParams] = useState({ from: '', to: '' })
  const [sortBy, setSortBy] = useState('duration')

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

  // Sort results based on selected option
  const sortedResults = useMemo(() => {
    if (!results) return null

    const sortRoutes = (routes, type) => {
      return [...routes].sort((a, b) => {
        switch (sortBy) {
          case 'duration':
            return (type === 'direct' ? a.duration : a.totalDuration) - 
                   (type === 'direct' ? b.duration : b.totalDuration)
          case 'departure':
            const depA = type === 'direct' ? a.from.departureTime : a.train1.from.departureTime
            const depB = type === 'direct' ? b.from.departureTime : b.train1.from.departureTime
            return depA.localeCompare(depB)
          case 'arrival':
            const arrA = type === 'direct' ? a.to.arrivalTime : a.train2.to.arrivalTime
            const arrB = type === 'direct' ? b.to.arrivalTime : b.train2.to.arrivalTime
            return arrA.localeCompare(arrB)
          default:
            return 0
        }
      })
    }

    return {
      ...results,
      results: {
        direct: sortRoutes(results.results.direct, 'direct'),
        connecting: sortRoutes(results.results.connecting, 'connecting')
      }
    }
  }, [results, sortBy])

  return (
    <div className="app">
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
          <div className="train-track-loader">
            <div className="train-loader"></div>
          </div>
          <p className="loading-text">Optimizing routes...</p>
        </div>
      )}

      {sortedResults && !loading && (
        <section className="results-section">
          <div className="results-header">
            <h2 className="results-title">
              {getStationName(searchParams.from)} <span className="arrow">→</span> {getStationName(searchParams.to)}
            </h2>
            <div className="results-controls">
              <div className="results-summary">
                <span className="summary-badge direct">
                  {sortedResults.directCount} Direct
                </span>
                <span className="summary-badge connecting">
                  {sortedResults.connectingCount} Connecting
                </span>
              </div>
              <div className="sort-dropdown">
                <label htmlFor="sort">Sort by:</label>
                <select 
                  id="sort" 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="duration">⏱️ Duration</option>
                  <option value="departure">🚀 Departure Time</option>
                  <option value="arrival">📍 Arrival Time</option>
                </select>
              </div>
            </div>
          </div>

          {sortedResults.directCount === 0 && sortedResults.connectingCount === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No routes found</h3>
              <p>Try searching between different stations</p>
            </div>
          ) : (
            <div className="result-cards">
              {sortedResults.results.direct.map((route, index) => (
                <ResultCard 
                  key={`direct-${index}`} 
                  route={route}
                  getStationName={getStationName}
                />
              ))}

              {sortedResults.results.direct.length > 0 && sortedResults.results.connecting.length > 0 && (
                <div className="section-divider">
                  <span>Connecting Routes</span>
                </div>
              )}

              {sortedResults.results.connecting.map((route, index) => (
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

export default Search
