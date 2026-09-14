const dataStore = require('../services/dataStore');
const { rankResponders } = require('../matching/responderMatching');

exports.getNearbyResponders = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.latitude) || 26.9124;
    const lon = parseFloat(req.query.longitude) || 75.7873;
    const category = req.query.category || 'ACCIDENT';
    const severity = req.query.severity || 'CRITICAL';

    const allResponders = dataStore.getAllResponders();
    const ranked = rankResponders(allResponders, lat, lon, category, severity);

    return res.json({
      success: true,
      count: ranked.length,
      nearest: ranked[0] || null,
      data: ranked
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllResponders = async (req, res, next) => {
  try {
    const responders = dataStore.getAllResponders();
    return res.json({
      success: true,
      count: responders.length,
      data: responders
    });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isOnline, vehicleType, serviceType } = req.body;

    const updated = dataStore.updateResponder(id, {
      ...(typeof isOnline === 'boolean' && { isOnline }),
      ...(vehicleType && { vehicleType }),
      ...(serviceType && { serviceType })
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Responder not found' });
    }

    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

exports.acceptIncident = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { incidentId } = req.body;

    const responder = dataStore.getResponder(id);
    if (!responder) {
      return res.status(404).json({ success: false, error: 'Responder not found' });
    }

    const incident = dataStore.getIncident(incidentId);
    if (!incident) {
      return res.status(404).json({ success: false, error: 'Incident not found' });
    }

    // Update responder
    dataStore.updateResponder(id, { currentIncidentId: incidentId });

    // Update incident status
    const updatedIncident = dataStore.updateIncident(incidentId, {
      responderId: id,
      status: 'RESPONDER_ACCEPTED',
      acceptedAt: new Date().toISOString()
    });

    return res.json({
      success: true,
      data: {
        responder,
        incident: updatedIncident
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, incidentId } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, error: 'Latitude and Longitude are required' });
    }

    const liveEntry = dataStore.updateLiveLocation(id, Number(latitude), Number(longitude), incidentId);

    return res.json({
      success: true,
      data: liveEntry
    });
  } catch (err) {
    next(err);
  }
};

exports.getLiveLocations = async (req, res, next) => {
  try {
    const locations = dataStore.getAllLiveLocations();
    return res.json({
      success: true,
      data: locations
    });
  } catch (err) {
    next(err);
  }
};
