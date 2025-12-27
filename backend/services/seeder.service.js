// Seeder Service - generates dummy train data
const { Station, Train } = require('../models');
const { stations, routes } = require('../data');
const { addMinutes, generateTrainName } = require('../utils');

// generate trains from route definitions
function generateTrains() {
  const trains = [];
  let trainNumber = 12001;

  routes.forEach((route) => {
    const trainsPerRoute = 3 + Math.floor(Math.random() * 3);
    
    for (let t = 0; t < trainsPerRoute; t++) {
      const startHour = Math.floor(Math.random() * 24);
      let currentTime = `${startHour.toString().padStart(2, '0')}:${Math.random() > 0.5 ? '00' : '30'}`;
      let currentDay = 1;
      
      const stops = route.map((stationCode, index) => {
        if (index === 0) {
          return { stationCode, arrivalTime: null, departureTime: currentTime, day: currentDay };
        }
        
        const travelMinutes = 30 + Math.floor(Math.random() * 90);
        const arrResult = addMinutes(currentTime, travelMinutes);
        const arrivalTime = arrResult.time;
        currentDay = arrResult.day;
        
        if (index === route.length - 1) {
          return { stationCode, arrivalTime, departureTime: null, day: currentDay };
        }
        
        const haltMinutes = 2 + Math.floor(Math.random() * 8);
        const depResult = addMinutes(arrivalTime, haltMinutes);
        currentTime = depResult.time;
        if (depResult.day > 1) currentDay = depResult.day;
        
        return { stationCode, arrivalTime, departureTime: currentTime, day: currentDay };
      });
      
      trains.push({ trainNumber: trainNumber.toString(), trainName: generateTrainName(), stops });
      trainNumber += 2;
    }
  });

  return trains;
}

// seed database with stations and trains
async function seedDatabase() {
  console.log('🌱 Seeding database with train data...');
  
  await Station.deleteMany({});
  await Train.deleteMany({});
  
  const uniqueStations = [...new Map(stations.map(s => [s.code, s])).values()];
  await Station.insertMany(uniqueStations);
  console.log(`   📍 Inserted ${uniqueStations.length} stations`);
  
  const trains = generateTrains();
  await Train.insertMany(trains);
  console.log(`   🚆 Inserted ${trains.length} trains`);
  
  return { stationCount: uniqueStations.length, trainCount: trains.length };
}

module.exports = { seedDatabase };
