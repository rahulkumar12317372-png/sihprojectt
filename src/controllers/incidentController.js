const dataStore = require('../services/dataStore');
const notificationService = require('../notifications/notificationService');
const { rankResponders } = require('../matching/responderMatching');

exports.createIncident = async (req, res, next) => {
  try {
    const {
      userId = 'usr_rahul_01',
      latitude = 26.9124,
      longitude = 75.7873,
      description = '',
      category = 'ACCIDENT',
      severity = 'CRITICAL',
      confidence = 0.94,
      suggestedServices = ['AMBULANCE', 'HOSPITAL', 'POLICE'],
      aiReason = 'Reported severe road collision',
      photoUrls = [],
      videoUrls = []
    } = req.body;

    const incident = dataStore.createIncident({
      userId,
      latitude: Number(latitude),
      longitude: Number(longitude),
      description,
      category,
      severity,
      confidence,
      suggestedServices,
      aiReason,
      photoUrls,
      videoUrls,
      status: 'CREATED'
    });

    // Automatically trigger notification to trusted contacts
    const contacts = dataStore.getTrustedContactsForUser(userId);
    notificationService.notifyTrustedContacts(contacts, 'Rahul', 'SOS_ACTIVATED', incident);

    return res.status(201).json({
      success: true,
      data: incident
    });
  } catch (err) {
    next(err);
  }
};

exports.getIncidentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const incident = dataStore.getIncident(id);
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    // Attach responder details if assigned
    let responderDetails = null;
    if (incident.responderId) {
      responderDetails = dataStore.getResponder(incident.responderId);
    }

    // Attach hospital details if assigned
    let hospitalDetails = null;
    if (incident.hospitalId) {
      hospitalDetails = dataStore.hospitals.get(incident.hospitalId) || null;
    }

    return res.json({
      success: true,
      data: {
        ...incident,
        responder: responderDetails,
        hospital: hospitalDetails
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllIncidents = async (req, res, next) => {
  try {
    const { category, severity, status, search } = req.query;
    let list = dataStore.getAllIncidents();

    if (category) {
      list = list.filter(i => i.category.toUpperCase() === category.toUpperCase());
    }
    if (severity) {
      list = list.filter(i => i.severity.toUpperCase() === severity.toUpperCase());
    }
    if (status) {
      list = list.filter(i => i.status.toUpperCase() === status.toUpperCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.id.toLowerCase().includes(q) ||
        (i.description && i.description.toLowerCase().includes(q))
      );
    }

    return res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (err) {
    next(err);
  }
};

exports.updateIncident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const existing = dataStore.getIncident(id);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    const updated = dataStore.updateIncident(id, updates);

    // Notify contacts on specific status transitions
    if (updates.status && updates.status !== existing.status) {
      const contacts = dataStore.getTrustedContactsForUser(updated.userId);
      const responder = updated.responderId ? dataStore.getResponder(updated.responderId) : null;
      notificationService.notifyTrustedContacts(contacts, 'Rahul', updates.status, {
        ...updated,
        responderName: responder ? `${responder.serviceType} ${responder.responderId}` : null
      });
    }

    return res.json({
      success: true,
      data: updated
    });
  } catch (err) {
    next(err);
  }
};

exports.cancelIncident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = dataStore.updateIncident(id, {
      status: 'CANCELLED',
      cancellationReason: req.body.reason || 'User cancelled'
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.resolveIncident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = dataStore.updateIncident(id, {
      status: 'RESOLVED',
      resolvedAt: new Date().toISOString()
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    const contacts = dataStore.getTrustedContactsForUser(updated.userId);
    notificationService.notifyTrustedContacts(contacts, 'Rahul', 'RESOLVED', updated);

    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};
