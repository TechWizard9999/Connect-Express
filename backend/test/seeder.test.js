const { test } = require('node:test');
const assert = require('node:assert');
const { generateTrains } = require('../services/seeder.service');

const toAbsoluteMinutes = (time, day) => {
  const [h, m] = time.split(':').map(Number);
  return (day - 1) * 1440 + h * 60 + m;
};

test('generated train times never go backwards (day counter survives midnight)', () => {
  // timetables are random, so check many runs
  for (let run = 0; run < 20; run++) {
    for (const train of generateTrains()) {
      let previous = -Infinity;
      for (const stop of train.stops) {
        for (const time of [stop.arrivalTime, stop.departureTime]) {
          if (!time) continue;
          const current = toAbsoluteMinutes(time, stop.day);
          assert.ok(current >= previous,
            `train ${train.trainNumber} goes backwards at ${stop.stationCode} (${time}, day ${stop.day})`);
          previous = current;
        }
      }
    }
  }
});
