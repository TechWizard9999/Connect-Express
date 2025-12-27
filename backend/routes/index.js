// Routes - API endpoints
const express = require('express');
const router = express.Router();
const { getStations, searchRoutes } = require('../controllers');

router.get('/stations', getStations);
router.get('/search', searchRoutes);

module.exports = router;
