import { useState } from 'react'

function SearchForm({ stations, onSearch, loading }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (from && to && from !== to) {
      onSearch(from, to)
    }
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="from">From Station</label>
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

      <div className="form-group">
        <label htmlFor="to">To Station</label>
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

      <button 
        type="submit" 
        className="search-btn"
        disabled={loading || !from || !to || from === to}
      >
        {loading ? (
          <>
            <span className="spinner"></span>
            Searching...
          </>
        ) : (
          <>
            🔍 Find Trains
          </>
        )}
      </button>
    </form>
  )
}

export default SearchForm
