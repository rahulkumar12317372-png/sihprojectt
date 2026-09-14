const express = require('express');
const router = express.Router();
const responderController = require('../controllers/responderController');

router.get('/nearby', responderController.getNearbyResponders);
router.get('/live-locations', responderController.getLiveLocations);
router.get('/', responderController.getAllResponders);
router.patch('/:id/status', responderController.updateStatus);
router.post('/:id/accept', responderController.acceptIncident);
router.post('/:id/location', responderController.updateLocation);

module.exports = router;
