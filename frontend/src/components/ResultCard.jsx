function ResultCard({ route, getStationName }) {
  if (route.type === 'direct') {
    return (
      <div className="result-card">
        <div className="card-header">
          <span className="train-badge direct">✓ Direct Train</span>
          <span className="duration-badge">{route.durationFormatted}</span>
        </div>

        <div className="journey-visual">
          <div className="journey-leg">
            <div className="station-point">
              <div className="station-dot origin"></div>
              <div className="station-info">
                <div className="station-code">{route.from.stationCode}</div>
                <div className="station-name">{getStationName(route.from.stationCode)}</div>
              </div>
              <div className="station-time">
                {route.from.departureTime}
                {route.from.day > 1 && <span> (Day {route.from.day})</span>}
              </div>
            </div>

            <div className="train-line">
              <div className="train-info">
                <span className="train-number">{route.trainNumber}</span>
                <span className="train-name">{route.trainName}</span>
                <span className="train-duration">• {route.durationFormatted}</span>
              </div>
            </div>

            <div className="station-point">
              <div className="station-dot destination"></div>
              <div className="station-info">
                <div className="station-code">{route.to.stationCode}</div>
                <div className="station-name">{getStationName(route.to.stationCode)}</div>
              </div>
              <div className="station-time">
                {route.to.arrivalTime}
                {route.to.day > 1 && <span> (Day {route.to.day})</span>}
              </div>
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
        <span className="train-badge connecting">↔ Via {route.connectionStation}</span>
        <span className="duration-badge">{route.totalDurationFormatted}</span>
      </div>

      <div className="journey-visual">
        <div className="journey-leg">
          <div className="station-point">
            <div className="station-dot origin"></div>
            <div className="station-info">
              <div className="station-code">{route.train1.from.stationCode}</div>
              <div className="station-name">{getStationName(route.train1.from.stationCode)}</div>
            </div>
            <div className="station-time">
              {route.train1.from.departureTime}
              {route.train1.from.day > 1 && <span> (Day {route.train1.from.day})</span>}
            </div>
          </div>

          <div className="train-line">
            <div className="train-info">
              <span className="train-number">{route.train1.trainNumber}</span>
              <span className="train-name">{route.train1.trainName}</span>
              <span className="train-duration">• {route.train1.durationFormatted}</span>
            </div>
          </div>

          <div className="station-point">
            <div className="station-dot connection"></div>
            <div className="station-info">
              <div className="station-code">{route.connectionStation}</div>
              <div className="station-name">{getStationName(route.connectionStation)}</div>
            </div>
            <div className="station-time">
              {route.train1.to.arrivalTime}
              {route.train1.to.day > 1 && <span> (Day {route.train1.to.day})</span>}
            </div>
          </div>
        </div>

        <div className="layover-section">
          <div className="layover-title">Layover at</div>
          <div className="layover-station">{getStationName(route.connectionStation)}</div>
          <div className="layover-time">{route.layoverFormatted}</div>
        </div>

        <div className="journey-leg">
          <div className="station-point">
            <div className="station-dot connection"></div>
            <div className="station-info">
              <div className="station-code">{route.connectionStation}</div>
              <div className="station-name">{getStationName(route.connectionStation)}</div>
            </div>
            <div className="station-time">
              {route.train2.from.departureTime}
              {route.train2.from.day > 1 && <span> (Day {route.train2.from.day})</span>}
            </div>
          </div>

          <div className="train-line">
            <div className="train-info">
              <span className="train-number">{route.train2.trainNumber}</span>
              <span className="train-name">{route.train2.trainName}</span>
              <span className="train-duration">• {route.train2.durationFormatted}</span>
            </div>
          </div>

          <div className="station-point">
            <div className="station-dot destination"></div>
            <div className="station-info">
              <div className="station-code">{route.train2.to.stationCode}</div>
              <div className="station-name">{getStationName(route.train2.to.stationCode)}</div>
            </div>
            <div className="station-time">
              {route.train2.to.arrivalTime}
              {route.train2.to.day > 1 && <span> (Day {route.train2.to.day})</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultCard
