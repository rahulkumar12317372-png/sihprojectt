const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');

router.post('/', incidentController.createIncident);
router.get('/', incidentController.getAllIncidents);
router.get('/:id', incidentController.getIncidentById);
router.patch('/:id', incidentController.updateIncident);
router.post('/:id/cancel', incidentController.cancelIncident);
router.post('/:id/resolve', incidentController.resolveIncident);

module.exports = router;
