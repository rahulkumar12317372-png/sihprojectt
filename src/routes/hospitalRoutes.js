const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospitalController');

router.get('/nearby', hospitalController.getNearbyHospitals);
router.get('/', hospitalController.getAllHospitals);
router.patch('/:id/status', hospitalController.updateHospitalStatus);

module.exports = router;
