// JavaScript fallback for the C++ route engine
// Used when C++ addon is not compiled

function timeToMinutes(timeStr, day) {
  if (!timeStr) return -1;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m + (day - 1) * 1440;
}

function formatDuration(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

function findConnectingRoutes(trainsFromA, trainsToB, fromCode, toCode, minLayover, maxLayover) {
  const results = [];
  
  // Build a map of intermediate stations reachable from source
  const intermediateFromA = new Map();
  
  for (const train of trainsFromA) {
    const stops = train.stops;
    const fromIdx = stops.findIndex(s => s.stationCode === fromCode);
    if (fromIdx === -1) continue;
    
    for (let k = fromIdx + 1; k < stops.length; k++) {
      if (stops[k].stationCode === toCode) continue;
      
      const stationCode = stops[k].stationCode;
      if (!intermediateFromA.has(stationCode)) {
        intermediateFromA.set(stationCode, []);
      }
      intermediateFromA.get(stationCode).push({
        train,
        fromStop: stops[fromIdx],
        arrivalStop: stops[k]
      });
    }
  }
  
  // Check each train going to destination
  for (const train2 of trainsToB) {
    const stops = train2.stops;
    const toIdx = stops.findIndex(s => s.stationCode === toCode);
    if (toIdx === -1) continue;
    
    for (let k = 0; k < toIdx; k++) {
      const departureStop = stops[k];
      const transferStation = departureStop.stationCode;
      if (transferStation === fromCode) continue;
      
      if (intermediateFromA.has(transferStation)) {
        for (const leg1 of intermediateFromA.get(transferStation)) {
          if (leg1.train.trainNumber === train2.trainNumber) continue;
          
          const arrMins = timeToMinutes(leg1.arrivalStop.arrivalTime, leg1.arrivalStop.day);
          const depMins = timeToMinutes(departureStop.departureTime, departureStop.day);
          
          if (arrMins < 0 || depMins < 0) continue;
          
          let layover = depMins - arrMins;
          if (layover < 0) layover += 1440;
          
          if (layover >= minLayover && layover <= maxLayover) {
            const leg1Start = timeToMinutes(leg1.fromStop.departureTime, leg1.fromStop.day);
            const leg1End = timeToMinutes(leg1.arrivalStop.arrivalTime, leg1.arrivalStop.day);
            const leg2Start = depMins;
            const leg2End = timeToMinutes(stops[toIdx].arrivalTime, stops[toIdx].day);
            
            let duration1 = leg1End - leg1Start;
            if (duration1 < 0) duration1 += 1440;
            let duration2 = leg2End - leg2Start;
            if (duration2 < 0) duration2 += 1440;
            const totalDuration = duration1 + layover + duration2;
            
            results.push({
              type: 'connecting',
              connectionStation: transferStation,
              totalDuration,
              totalDurationFormatted: formatDuration(totalDuration),
              layover,
              layoverFormatted: formatDuration(layover),
              train1: {
                trainNumber: leg1.train.trainNumber,
                trainName: leg1.train.trainName,
                durationFormatted: formatDuration(duration1),
                from: {
                  stationCode: fromCode,
                  departureTime: leg1.fromStop.departureTime,
                  day: leg1.fromStop.day
                },
                to: {
                  stationCode: transferStation,
                  arrivalTime: leg1.arrivalStop.arrivalTime,
                  day: leg1.arrivalStop.day
                }
              },
              train2: {
                trainNumber: train2.trainNumber,
                trainName: train2.trainName,
                durationFormatted: formatDuration(duration2),
                from: {
                  stationCode: transferStation,
                  departureTime: departureStop.departureTime,
                  day: departureStop.day
                },
                to: {
                  stationCode: toCode,
                  arrivalTime: stops[toIdx].arrivalTime,
                  day: stops[toIdx].day
                }
              }
            });
          }
        }
      }
    }
  }
  
  return results;
}

module.exports = { findConnectingRoutes };
