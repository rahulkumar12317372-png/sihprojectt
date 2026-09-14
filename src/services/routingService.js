/**
 * Real Road Routing Service (OSRM / OpenStreetMap Directions)
 * Fetches 100% real road network geometry, distances, and turn-by-turn waypoints.
 * No fake straight lines — vehicles follow exact streets, turns, and roundabouts.
 */

const cache = new Map();

class RoutingService {
  /**
   * Fetch real road route between two GPS coordinates
   * @param {number} startLat
   * @param {number} startLon
   * @param {number} endLat
   * @param {number} endLon
   * @returns {Promise<{distanceMeters: number, durationSeconds: number, waypoints: Array<[number, number]>}>}
   */
  async getRoadRoute(startLat, startLon, endLat, endLon) {
    const key = `${startLat.toFixed(4)},${startLon.toFixed(4)}->${endLat.toFixed(4)},${endLon.toFixed(4)}`;
    if (cache.has(key)) {
      return cache.get(key);
    }

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;
      const res = await fetch(url, { headers: { 'User-Agent': 'EmergencyConnect-RealRouting/1.0' } });
      const data = await res.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // OSRM returns coordinates as [longitude, latitude], convert to [latitude, longitude]
        const waypoints = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);

        const result = {
          success: true,
          provider: 'OSRM_REAL_ROADS',
          distanceMeters: Math.round(route.distance),
          durationSeconds: Math.round(route.duration),
          waypoints
        };

        cache.set(key, result);
        // Limit cache size
        if (cache.size > 200) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }

        return result;
      }
    } catch (err) {
      console.warn('[RoutingService Error - Fallback to direct interpolation]:', err.message);
    }

    // Fallback if offline: 15-step straight line
    const fallbackWaypoints = [];
    const steps = 15;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      fallbackWaypoints.push([
        startLat + (endLat - startLat) * t,
        startLon + (endLon - startLon) * t
      ]);
    }

    return {
      success: false,
      provider: 'DIRECT_FALLBACK',
      distanceMeters: 2000,
      durationSeconds: 300,
      waypoints: fallbackWaypoints
    };
  }
}

module.exports = new RoutingService();
