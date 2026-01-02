import { useState } from 'react'

function SearchForm({ stations, onSearch, loading }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (from && to && from !== to) {
      onSearch(from, to, date)
    }
  }

  const handleSwap = () => {
    const temp = from
    setFrom(to)
    setTo(temp)
  }

  // Get today's date for min date
  const today = new Date().toISOString().split('T')[0]
  // Get max date (30 days from now)
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="form-inputs">
        <div className="form-group">
          <label htmlFor="from">Origin Station</label>
          <div className="input-wrapper">
            <span className="input-icon">🏁</span>
            <select
              id="from"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              required
            >
              <option value="">Select origin</option>
              {stations.map((station) => (
                <option key={station.code} value={station.code}>
                  {station.name} ({station.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <button 
          type="button" 
          className="swap-btn" 
          onClick={handleSwap}
          title="Swap stations"
          disabled={!from && !to}
        >
          ⇄
        </button>

        <div className="form-group">
          <label htmlFor="to">Destination Station</label>
          <div className="input-wrapper">
            <span className="input-icon">📍</span>
            <select
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            >
              <option value="">Select destination</option>
              {stations.map((station) => (
                <option key={station.code} value={station.code}>
                  {station.name} ({station.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Picker */}
        <div className="form-group">
          <label htmlFor="date">Travel Date</label>
          <div className="input-wrapper">
            <span className="input-icon">📅</span>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={today}
              max={maxDate}
              required
            />
          </div>
        </div>
      </div>

      <div className="search-actions">
        <button 
          type="submit" 
          className="search-btn"
          disabled={loading || !from || !to || from === to}
        >
          {loading ? (
            <>
              <div className="loading-spinner-small"></div>
              Calculating...
            </>
          ) : (
            <>
              🚀 Search Routes
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default SearchForm
