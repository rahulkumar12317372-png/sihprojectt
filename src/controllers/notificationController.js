const notificationService = require('../notifications/notificationService');
const dataStore = require('../services/dataStore');

exports.sendNotification = async (req, res, next) => {
  try {
    const { channel = 'PUSH', recipient, message, metadata } = req.body;
    if (!recipient || !message) {
      return res.status(400).json({ success: false, error: 'Recipient and message are required' });
    }

    let result;
    if (channel === 'WHATSAPP') {
      result = await notificationService.sendWhatsApp(recipient, message);
    } else if (channel === 'VOICE_CALL' || channel === 'CALL') {
      result = await notificationService.makeVoiceCall(recipient, metadata || {});
    } else if (channel === 'SMS') {
      result = await notificationService.sendSMS(recipient, message);
    } else if (channel === 'EMAIL') {
      result = await notificationService.sendEmail(recipient, 'EmergencyConnect Alert', message);
    } else {
      result = notificationService.logNotification(channel, recipient, message, metadata);
    }

    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.makeCall = async (req, res, next) => {
  try {
    const { recipient, voiceUrl } = req.body;
    if (!recipient) {
      return res.status(400).json({ success: false, error: 'Recipient phone number is required' });
    }
    const result = await notificationService.makeVoiceCall(recipient, { voiceUrl });
    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.getLogs = async (req, res, next) => {
  try {
    const logs = notificationService.getLogs();
    return res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
};

exports.getUserContacts = async (req, res, next) => {
  try {
    const userId = req.params.userId || 'usr_rahul_01';
    const contacts = dataStore.getTrustedContactsForUser(userId);
    return res.json({ success: true, data: contacts });
  } catch (err) {
    next(err);
  }
};

exports.addContact = async (req, res, next) => {
  try {
    const { userId = 'usr_rahul_01', name, phone, email, relationship } = req.body;
    if (!name || (!phone && !email)) {
      return res.status(400).json({ success: false, error: 'Name and either phone or email are required' });
    }
    const newContact = dataStore.addTrustedContact({ userId, name, phone, email, relationship });
    return res.status(201).json({ success: true, data: newContact });
  } catch (err) {
    next(err);
  }
};

exports.deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    dataStore.removeTrustedContact(id);
    return res.json({ success: true, message: 'Contact removed' });
  } catch (err) {
    next(err);
  }
};

/**
 * Send Emergency WhatsApp + SMS Alert to ALL trusted contacts at once
 * Includes live GPS location, Google Maps link, incident details
 * This is the one-click "Alert All" endpoint
 */
exports.sendEmergencyAlertToAll = async (req, res, next) => {
  try {
    const {
      userId = 'usr_rahul_01',
      userName = 'Rahul',
      latitude = 26.9124,
      longitude = 75.7873,
      description = 'Emergency SOS activated',
      category = 'ACCIDENT',
      severity = 'CRITICAL'
    } = req.body;

    // Fetch all trusted contacts for this user
    const contacts = dataStore.getTrustedContactsForUser(userId);

    if (!contacts || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No trusted contacts found for this user'
      });
    }

    const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;

    // Build a detailed emergency alert message
    const alertMessage = `🚨 EMERGENCY SOS ALERT!\n\n` +
      `👤 ${userName} has triggered an emergency SOS!\n` +
      `📋 Type: ${category} | Severity: ${severity}\n` +
      `📝 ${description}\n\n` +
      `📍 LIVE LOCATION:\n${mapsLink}\n\n` +
      `🚑 Nearest responder has been dispatched.\n` +
      `⏰ Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}\n\n` +
      `⚠️ This is an automated alert from EmergencyConnect.`;

    // Dispatch to all contacts via the notificationService
    const results = await notificationService.notifyTrustedContacts(
      contacts,
      userName,
      'SOS_ACTIVATED',
      { latitude, longitude, category, severity, description }
    );

    // Collect delivery summary
    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');

    const deliverySummary = {
      totalContacts: contacts.length,
      totalDispatched: results.length,
      successful: fulfilled.length,
      failed: rejected.length,
      contacts: contacts.map(c => ({
        name: c.name,
        phone: c.phone,
        relationship: c.relationship
      })),
      locationSent: mapsLink,
      timestamp: new Date().toISOString()
    };

    return res.json({
      success: true,
      message: `Emergency alerts dispatched to ${contacts.length} contacts`,
      data: deliverySummary
    });
  } catch (err) {
    next(err);
  }
};

