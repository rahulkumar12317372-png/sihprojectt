const dataStore = require('../services/dataStore');
const { calculateHaversineDistance } = require('../matching/responderMatching');

exports.getNearbyHospitals = async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.latitude) || 26.9124;
    const lon = parseFloat(req.query.longitude) || 75.7873;

    const hospitals = dataStore.getAllHospitals().map(h => {
      const distanceKm = calculateHaversineDistance(lat, lon, h.latitude, h.longitude);
      return {
        ...h,
        distanceKm,
        etaMinutes: Math.max(2, Math.round((distanceKm / 30) * 60) + 1)
      };
    });

    hospitals.sort((a, b) => a.distanceKm - b.distanceKm);

    return res.json({
      success: true,
      data: hospitals
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllHospitals = async (req, res, next) => {
  try {
    const hospitals = dataStore.getAllHospitals();
    return res.json({
      success: true,
      data: hospitals
    });
  } catch (err) {
    next(err);
  }
};

exports.updateHospitalStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { availableBeds, emergencyAvailable, icuBeds } = req.body;

    const updated = dataStore.updateHospital(id, {
      ...(availableBeds !== undefined && { availableBeds: Number(availableBeds) }),
      ...(emergencyAvailable !== undefined && { emergencyAvailable: Boolean(emergencyAvailable) }),
      ...(icuBeds !== undefined && { icuBeds: Number(icuBeds) })
    });

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Hospital not found' });
    }

    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};
