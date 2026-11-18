// server
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const { PORT } = require('./config');
const apiRoutes = require('./routes');
const { seedDatabase } = require('./services/seeder.service');
const db = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', apiRoutes);

// health check
app.get('/', (req, res) => {
  res.json({
    message: 'Connect Express API is running!',
    endpoints: {
      stations: 'GET /api/stations',
      search: 'GET /api/search?from=STATION_CODE&to=STATION_CODE'
    }
  });
});

// start server
async function startServer() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    let stationCount, trainCount;

    if (mongoUri) {
      try {
        await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
        console.log('Connected to MongoDB');
        ({ stationCount, trainCount } = await seedDatabase());
      } catch (err) {
        console.warn(`MongoDB not reachable (${err.message}). Falling back to in-memory data.`);
        await mongoose.disconnect().catch(() => {});
        db.useMemory = true;
      }
    } else {
      console.warn('MONGO_URI not set. Using in-memory data (users and train times reset on every restart).');
      db.useMemory = true;
    }

    if (db.useMemory) {
      const memory = require('./services/memory.store');
      stationCount = memory.stationList.length;
      trainCount = memory.trains.length;
    }

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Stations: ${stationCount} | Trains: ${trainCount}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
