function ResultCard({ route, getStationName }) {
  if (route.type === 'direct') {
    return (
      <div className="result-card">
        <div className="card-header">
          <span className="train-badge direct">✓ Direct</span>
          <span className="duration-badge">{route.durationFormatted}</span>
        </div>

        <div className="journey-preview">
          <div className="journey-leg">
            <div className="station-node"></div>
            <div className="station-info">
              <div className="station-main">
                <span className="station-code">{route.from.stationCode}</span>
                <span className="station-name">{getStationName(route.from.stationCode)}</span>
              </div>
              <span className="station-time">{route.from.departureTime}</span>
            </div>

            <div className="train-link">
              <div className="train-meta">
                <span className="train-number">{route.trainNumber}</span>
                <span className="train-name">{route.trainName}</span>
              </div>
              <span className="leg-duration">{route.durationFormatted}</span>
            </div>
          </div>

          <div className="journey-leg">
            <div className="station-node"></div>
            <div className="station-info">
              <div className="station-main">
                <span className="station-code">{route.to.stationCode}</span>
                <span className="station-name">{getStationName(route.to.stationCode)}</span>
              </div>
              <span className="station-time">{route.to.arrivalTime}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Connecting Route
  return (
    <div className="result-card">
      <div className="card-header">
        <span className="train-badge connecting">↔ Connecting via {route.connectionStation}</span>
        <span className="duration-badge">{route.totalDurationFormatted}</span>
      </div>

      <div className="journey-preview">
        {/* Leg 1 */}
        <div className="journey-leg">
          <div className="station-node"></div>
          <div className="station-info">
            <div className="station-main">
              <span className="station-code">{route.train1.from.stationCode}</span>
              <span className="station-name">{getStationName(route.train1.from.stationCode)}</span>
            </div>
            <span className="station-time">{route.train1.from.departureTime}</span>
          </div>

          <div className="train-link">
            <div className="train-meta">
              <span className="train-number">{route.train1.trainNumber}</span>
              <span className="train-name">{route.train1.trainName}</span>
            </div>
            <span className="leg-duration">{route.train1.durationFormatted}</span>
          </div>
        </div>

        {/* Layover */}
        <div className="journey-leg">
          <div className="station-node connection"></div>
          <div className="station-info">
            <div className="station-main">
              <span className="station-code">{route.connectionStation}</span>
              <span className="station-name">{getStationName(route.connectionStation)}</span>
            </div>
            <span className="station-time">{route.train1.to.arrivalTime}</span>
          </div>

          <div className="layover-pill">
            <span className="layover-text">Wait at {getStationName(route.connectionStation)}</span>
            <span className="layover-duration">{route.layoverFormatted}</span>
          </div>
        </div>

        {/* Leg 2 */}
        <div className="journey-leg">
          <div className="station-node connection"></div>
          <div className="station-info">
            <div className="station-main">
              <span className="station-code">{route.connectionStation}</span>
              <span className="station-name">{getStationName(route.connectionStation)}</span>
            </div>
            <span className="station-time">{route.train2.from.departureTime}</span>
          </div>

          <div className="train-link connecting">
            <div className="train-meta">
              <span className="train-number">{route.train2.trainNumber}</span>
              <span className="train-name">{route.train2.trainName}</span>
            </div>
            <span className="leg-duration">{route.train2.durationFormatted}</span>
          </div>
        </div>

        {/* Destination */}
        <div className="journey-leg">
          <div className="station-node"></div>
          <div className="station-info">
            <div className="station-main">
              <span className="station-code">{route.train2.to.stationCode}</span>
              <span className="station-name">{getStationName(route.train2.to.stationCode)}</span>
            </div>
            <span className="station-time">{route.train2.to.arrivalTime}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultCard
