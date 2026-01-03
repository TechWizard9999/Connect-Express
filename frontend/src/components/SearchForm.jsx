import { useState, useEffect } from 'react'

const HISTORY_KEY = 'connectExpress_searchHistory'
const MAX_HISTORY = 5

function SearchForm({ stations, onSearch, loading }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  // Load History
  useEffect(() => {
    const saved = localStorage.getItem(HISTORY_KEY)
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (err) {
        console.error('Error loading history:', err)
      }
    }
  }, [])

  // Save Search
  const saveToHistory = (fromCode, toCode, travelDate) => {
    const newSearch = { from: fromCode, to: toCode, date: travelDate, timestamp: Date.now() }
    const updated = [
      newSearch,
      ...history.filter(s => !(s.from === fromCode && s.to === toCode))
    ].slice(0, MAX_HISTORY)
    
    setHistory(updated)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
  }

  // Handle Submit
  const handleSubmit = (e) => {
    e.preventDefault()
    if (from && to && from !== to) {
      saveToHistory(from, to, date)
      onSearch(from, to, date)
      setShowHistory(false)
    }
  }

  // Swap Stations
  const handleSwap = () => {
    const temp = from
    setFrom(to)
    setTo(temp)
  }

  // Use History
  const handleHistoryClick = (search) => {
    setFrom(search.from)
    setTo(search.to)
    setDate(search.date)
    setShowHistory(false)
  }

  // Clear History
  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem(HISTORY_KEY)
    setShowHistory(false)
  }

  // Get Station Name
  const getStationName = (code) => {
    const station = stations.find(s => s.code === code)
    return station ? station.name : code
  }

  const today = new Date().toISOString().split('T')[0]
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return (
    <div className="search-form-container">
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>From</label>
            <select value={from} onChange={(e) => setFrom(e.target.value)} required>
              <option value="">Select origin</option>
              {stations.map(s => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <button type="button" className="swap-btn" onClick={handleSwap}>⇄</button>

          <div className="form-group">
            <label>To</label>
            <select value={to} onChange={(e) => setTo(e.target.value)} required>
              <option value="">Select destination</option>
              {stations.map(s => (
                <option key={s.code} value={s.code}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Date</label>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              min={today}
              max={maxDate}
              required
            />
          </div>

          <button type="submit" className="search-btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {history.length > 0 && (
        <div className="recent-section">
          <div className="recent-header">
            <h3>Recent Searches</h3>
            <button 
              className="history-toggle"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? '▲' : '▼'}
            </button>
          </div>
          
          {showHistory && (
            <div className="history-pills">
              {history.map((search, idx) => (
                <button
                  key={idx}
                  className="history-pill"
                  onClick={() => handleHistoryClick(search)}
                >
                  <span>{getStationName(search.from).split('(')[0].trim()}</span>
                  <span className="arrow">→</span>
                  <span>{getStationName(search.to).split('(')[0].trim()}</span>
                </button>
              ))}
              <button className="clear-btn" onClick={clearHistory}>
                Clear History
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchForm
