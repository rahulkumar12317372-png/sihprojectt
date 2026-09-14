const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/classify', aiController.classifyEmergency);
router.post('/classify-evidence', aiController.classifyEvidence);

module.exports = router;
