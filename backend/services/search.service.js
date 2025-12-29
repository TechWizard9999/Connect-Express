// search service
const { Train } = require('../models');
const { MIN_LAYOVER, MAX_LAYOVER } = require('../config');
const { timeToMinutes, calculateDuration, formatDuration } = require('../utils');

// find direct
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

// find connecting
const routeEngine = require('../build/Release/route_engine.node');

async function findConnectingTrains(fromCode, toCode) {
  const trainsFromA = await Train.find({ 'stops.stationCode': fromCode }).lean();
  const trainsToB = await Train.find({ 'stops.stationCode': toCode }).lean();

  const results = routeEngine.findConnectingRoutes(
    trainsFromA,
    trainsToB,
    fromCode,
    toCode,
    MIN_LAYOVER,
    MAX_LAYOVER
  );

  return results.sort((a, b) => a.totalDuration - b.totalDuration).slice(0, 20);
}

module.exports = { findDirectTrains, findConnectingTrains };
