// controllers
const { Station } = require('../models');
const { findDirectTrains, findConnectingTrains } = require('../services/search.service');

// fetch stations
async function getStations(req, res) {
  try {
    const stations = await Station.find().sort({ name: 1 });
    res.json({ success: true, count: stations.length, data: stations });
  } catch (error) {
    console.error('Error fetching stations:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}

const redisClient = require('../config/redis');

// search routes
async function searchRoutes(req, res) {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ success: false, error: 'Both "from" and "to" are required' });
    }

    const fromCode = from.toUpperCase();
    const toCode = to.toUpperCase();

    if (fromCode === toCode) {
      return res.status(400).json({ success: false, error: 'Source and destination cannot be same' });
    }

    // Check cache
    const cacheKey = `search:${fromCode}:${toCode}`;
    let cachedData = null;
    
    if (redisClient.isReady) {
      try {
        cachedData = await redisClient.get(cacheKey);
      } catch (err) {
        console.error('Redis get error:', err);
      }
    }

    if (cachedData) {

      return res.json(JSON.parse(cachedData));
    }

    const direct = await findDirectTrains(fromCode, toCode);
    const connecting = await findConnectingTrains(fromCode, toCode);

    const result = {
      success: true,
      from: fromCode,
      to: toCode,
      directCount: direct.length,
      connectingCount: connecting.length,
      results: { direct, connecting }
    };

    // Cache Data
    if (redisClient.isReady) {
      try {
        await redisClient.set(cacheKey, JSON.stringify(result), {
          EX: 3600
        });
      } catch (err) {
        console.error('Redis set error:', err);
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Error in search:', error);
    res.status(500).json({ success: false, error: 'Server error during search' });
  }
}

module.exports = { getStations, searchRoutes };
