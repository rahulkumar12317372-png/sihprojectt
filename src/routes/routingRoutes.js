const express = require('express');
const router = express.Router();
const routingService = require('../services/routingService');

router.get('/directions', async (req, res, next) => {
  try {
    const { fromLat, fromLon, toLat, toLon } = req.query;
    if (!fromLat || !fromLon || !toLat || !toLon) {
      return res.status(400).json({ success: false, error: 'fromLat, fromLon, toLat, and toLon query parameters are required' });
    }

    const route = await routingService.getRoadRoute(
      Number(fromLat),
      Number(fromLon),
      Number(toLat),
      Number(toLon)
    );

    return res.json(route);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
