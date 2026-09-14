/**
 * Nearest Responder Matching Engine
 * Implements Haversine distance, composite scoring, and ETA estimation.
 */

// Haversine distance formula in kilometers
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

/**
 * Calculates Estimated Time of Arrival (ETA) in minutes.
 * Emergency vehicles navigate at an average urban speed of ~25-35 km/h factoring siren clearance.
 */
function calculateETA(distanceKm) {
  const averageSpeedKmH = 28; // km/h
  const baseMinutes = (distanceKm / averageSpeedKmH) * 60;
  // Add 1-2 minutes dispatch/traffic buffer
  const totalMinutes = Math.max(1, Math.round(baseMinutes + 1.2));
  return totalMinutes;
}

/**
 * Composite responder scoring algorithm:
 * score = (distanceScore * 0.45) + (availabilityScore * 0.30) + (serviceMatchScore * 0.25)
 */
function scoreResponder(responder, incidentLat, incidentLon, requestedCategory, severity) {
  const distanceKm = calculateHaversineDistance(
    incidentLat,
    incidentLon,
    responder.latitude,
    responder.longitude
  );

  // Distance Score: 10 points for < 1km, degrading to 0 beyond 15km
  const distanceScore = Math.max(0, 10 - (distanceKm * 0.7));

  // Availability Score: Online + not currently assigned = 10, Busy = 2, Offline = 0
  let availabilityScore = 0;
  if (responder.isOnline) {
    availabilityScore = responder.currentIncidentId ? 2 : 10;
  }

  // Service Match Score
  let serviceMatchScore = 5;
  const responderService = (responder.serviceType || '').toUpperCase();
  const responderVehicle = (responder.vehicleType || '').toUpperCase();

  if (requestedCategory === 'ACCIDENT' || requestedCategory === 'MEDICAL') {
    if (responderService.includes('AMBULANCE') || responderVehicle.includes('AMBULANCE')) {
      serviceMatchScore = 10;
    } else if (responderService.includes('PARAMEDIC')) {
      serviceMatchScore = 8;
    }
  } else if (requestedCategory === 'FIRE') {
    if (responderService.includes('FIRE')) serviceMatchScore = 10;
  } else if (requestedCategory === 'CRIME' || requestedCategory === 'SAFETY') {
    if (responderService.includes('POLICE')) serviceMatchScore = 10;
  }

  // Verification bonus
  const verificationMultiplier = responder.verificationStatus === 'VERIFIED' ? 1.0 : 0.8;

  // Composite formula
  const compositeScore = Number(
    (
      (distanceScore * 0.45) +
      (availabilityScore * 0.30) +
      (serviceMatchScore * 0.25)
    ) * verificationMultiplier
  ).toFixed(2);

  const etaMinutes = calculateETA(distanceKm);

  return {
    responder,
    distanceKm,
    etaMinutes,
    compositeScore: parseFloat(compositeScore)
  };
}

/**
 * Find and rank nearest responders
 */
function rankResponders(responders, incidentLat, incidentLon, category = 'ACCIDENT', severity = 'CRITICAL') {
  const scored = responders
    .filter(r => r.isOnline) // Only consider online responders
    .map(r => scoreResponder(r, incidentLat, incidentLon, category, severity));

  // Sort descending by composite score
  scored.sort((a, b) => b.compositeScore - a.compositeScore);

  return scored;
}

module.exports = {
  calculateHaversineDistance,
  calculateETA,
  scoreResponder,
  rankResponders
};
