// Search Service - finds train routes
const { Train } = require('../models');
const { MIN_LAYOVER, MAX_LAYOVER } = require('../config');
const { timeToMinutes, calculateDuration, formatDuration } = require('../utils');

// find direct trains (A → B)
async function findDirectTrains(fromCode, toCode) {
  const directTrains = await Train.find({ 'stops.stationCode': { $all: [fromCode, toCode] } });
  const results = [];
  
  directTrains.forEach(train => {
    const stops = train.stops;
    const fromIndex = stops.findIndex(s => s.stationCode === fromCode);
    const toIndex = stops.findIndex(s => s.stationCode === toCode);
    
    if (fromIndex !== -1 && toIndex !== -1 && fromIndex < toIndex) {
      const fromStop = stops[fromIndex];
      const toStop = stops[toIndex];
      const duration = calculateDuration(fromStop.departureTime, fromStop.day, toStop.arrivalTime, toStop.day);
      
      results.push({
        type: 'direct',
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        from: { stationCode: fromCode, departureTime: fromStop.departureTime, day: fromStop.day },
        to: { stationCode: toCode, arrivalTime: toStop.arrivalTime, day: toStop.day },
        duration,
        durationFormatted: formatDuration(duration),
        intermediateStops: toIndex - fromIndex - 1
      });
    }
  });

  return results.sort((a, b) => (a.duration || 9999) - (b.duration || 9999));
}

// find connecting trains (A → X → B)
async function findConnectingTrains(fromCode, toCode) {
  const trainsFromA = await Train.find({ 'stops.stationCode': fromCode });
  const trainsToB = await Train.find({ 'stops.stationCode': toCode });

  // build map of stations reachable from A
  const intermediateFromA = new Map();
  trainsFromA.forEach(train => {
    const stops = train.stops;
    const fromIndex = stops.findIndex(s => s.stationCode === fromCode);
    const fromStop = stops[fromIndex];
    for (let i = fromIndex + 1; i < stops.length; i++) {
      const stop = stops[i];
      if (stop.stationCode === toCode) continue;
      if (!intermediateFromA.has(stop.stationCode)) intermediateFromA.set(stop.stationCode, []);
      intermediateFromA.get(stop.stationCode).push({ train, fromStop, arrivalStop: stop });
    }
  });

  // build map of stations that can reach B
  const intermediateToB = new Map();
  trainsToB.forEach(train => {
    const stops = train.stops;
    const toIndex = stops.findIndex(s => s.stationCode === toCode);
    const toStop = stops[toIndex];
    for (let i = 0; i < toIndex; i++) {
      const stop = stops[i];
      if (stop.stationCode === fromCode) continue;
      if (!intermediateToB.has(stop.stationCode)) intermediateToB.set(stop.stationCode, []);
      intermediateToB.get(stop.stationCode).push({ train, departureStop: stop, toStop });
    }
  });

  // find common connection points
  const commonStations = [...intermediateFromA.keys()].filter(code => intermediateToB.has(code));
  const results = [];

  for (const stationX of commonStations) {
    const train1Options = intermediateFromA.get(stationX);
    const train2Options = intermediateToB.get(stationX);

    for (const t1 of train1Options) {
      for (const t2 of train2Options) {
        if (t1.train.trainNumber === t2.train.trainNumber) continue;

        const train1ArrivalMinutes = timeToMinutes(t1.arrivalStop.arrivalTime, t1.arrivalStop.day);
        const train2DepartureMinutes = timeToMinutes(t2.departureStop.departureTime, t2.departureStop.day);
        if (train1ArrivalMinutes === null || train2DepartureMinutes === null) continue;

        let layover = train2DepartureMinutes - train1ArrivalMinutes;
        if (layover < 0) layover += 1440;

        if (layover >= MIN_LAYOVER && layover <= MAX_LAYOVER) {
          const leg1Duration = calculateDuration(t1.fromStop.departureTime, t1.fromStop.day, t1.arrivalStop.arrivalTime, t1.arrivalStop.day);
          const leg2Duration = calculateDuration(t2.departureStop.departureTime, t2.departureStop.day, t2.toStop.arrivalTime, t2.toStop.day);
          const totalDuration = (leg1Duration || 0) + layover + (leg2Duration || 0);

          results.push({
            type: 'connecting',
            connectionStation: stationX,
            train1: {
              trainNumber: t1.train.trainNumber, trainName: t1.train.trainName,
              from: { stationCode: fromCode, departureTime: t1.fromStop.departureTime, day: t1.fromStop.day },
              to: { stationCode: stationX, arrivalTime: t1.arrivalStop.arrivalTime, day: t1.arrivalStop.day },
              duration: leg1Duration, durationFormatted: formatDuration(leg1Duration)
            },
            train2: {
              trainNumber: t2.train.trainNumber, trainName: t2.train.trainName,
              from: { stationCode: stationX, departureTime: t2.departureStop.departureTime, day: t2.departureStop.day },
              to: { stationCode: toCode, arrivalTime: t2.toStop.arrivalTime, day: t2.toStop.day },
              duration: leg2Duration, durationFormatted: formatDuration(leg2Duration)
            },
            layover, layoverFormatted: formatDuration(layover),
            totalDuration, totalDurationFormatted: formatDuration(totalDuration)
          });
        }
      }
    }
  }

  return results.sort((a, b) => a.totalDuration - b.totalDuration).slice(0, 20);
}

module.exports = { findDirectTrains, findConnectingTrains };
