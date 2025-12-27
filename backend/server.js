// Server - main entry point
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');

const { PORT } = require('./config');
const apiRoutes = require('./routes');
const { seedDatabase } = require('./services/seeder.service');

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

// start server with in-memory database
async function startServer() {
  try {
    console.log('🚂 Starting Connect Express...\n');

    console.log('📦 Setting up in-memory database...');
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to in-memory MongoDB\n');

    const { stationCount, trainCount } = await seedDatabase();

    app.listen(PORT, () => {
      console.log('\n========================================');
      console.log('🎉 Connect Express is ready!');
      console.log('========================================');
      console.log(`   API Server: http://localhost:${PORT}`);
      console.log(`   Stations: ${stationCount}`);
      console.log(`   Trains: ${trainCount}`);
      console.log('========================================\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
