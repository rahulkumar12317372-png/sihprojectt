const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.post('/send', notificationController.sendNotification);
router.post('/call', notificationController.makeCall);
router.post('/emergency-alert-all', notificationController.sendEmergencyAlertToAll);
router.get('/logs', notificationController.getLogs);
router.get('/contacts/:userId', notificationController.getUserContacts);
router.post('/contacts', notificationController.addContact);
router.delete('/contacts/:id', notificationController.deleteContact);

module.exports = router;

