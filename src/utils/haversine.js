/**
 * Haversine Distance & ETA Calculation Utilities (Frontend)
 */

export function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 1.7;
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export function calculateETA(distanceKm) {
  if (!distanceKm) return 5;
  const averageSpeedKmH = 28;
  const mins = (distanceKm / averageSpeedKmH) * 60;
  return Math.max(1, Math.round(mins + 1));
}
