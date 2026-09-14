/**
 * Unified Data Store (Firestore + Realtime Database Adapter)
 * Seeds the Jaipur scenario: Rahul, Ambulance A102 (1.7 km, 5 min ETA), SMS Hospital.
 */

class DataStore {
  constructor() {
    this.users = new Map();
    this.incidents = new Map();
    this.responders = new Map();
    this.hospitals = new Map();
    this.trustedContacts = new Map();
    this.liveLocations = new Map(); // Realtime Database simulation

    this.seedInitialData();
  }

  seedInitialData() {
    // 1. Seed Users
    const defaultUser = {
      id: 'usr_rahul_01',
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '+91 9263293460',
      role: 'USER',
      status: 'ACTIVE',
      latitude: 26.9124, // Central Jaipur (MI Road)
      longitude: 75.7873,
      createdAt: new Date().toISOString()
    };
    this.users.set(defaultUser.id, defaultUser);

    // 2. Seed Responders
    const respondersList = [
      {
        id: 'resp_a102',
        responderId: 'A102',
        name: 'Vikram Singh',
        phone: '+91 98290 11102',
        email: 'a102@responder.emergencyconnect.org',
        role: 'RESPONDER',
        vehicleType: 'ADVANCED_LIFE_SUPPORT_AMBULANCE',
        serviceType: 'AMBULANCE',
        latitude: 26.9240, // ~1.7 km north-east of Rahul
        longitude: 75.8010,
        isOnline: true,
        currentIncidentId: null,
        verificationStatus: 'VERIFIED',
        rating: 4.9,
        totalRescues: 342
      },
      {
        id: 'resp_p204',
        responderId: 'P204',
        name: 'Rajesh Meena',
        phone: '+91 98290 22204',
        email: 'p204@police.emergencyconnect.org',
        role: 'RESPONDER',
        vehicleType: 'POLICE_PATROL_SUV',
        serviceType: 'POLICE',
        latitude: 26.9050,
        longitude: 75.7720,
        isOnline: true,
        currentIncidentId: null,
        verificationStatus: 'VERIFIED',
        rating: 4.8,
        totalRescues: 189
      },
      {
        id: 'resp_f301',
        responderId: 'F301',
        name: 'Kailash Sharma',
        phone: '+91 98290 33301',
        email: 'f301@fire.emergencyconnect.org',
        role: 'RESPONDER',
        vehicleType: 'FIRE_RESCUE_TENDER',
        serviceType: 'FIRE_DEPARTMENT',
        latitude: 26.9310,
        longitude: 75.7900,
        isOnline: true,
        currentIncidentId: null,
        verificationStatus: 'VERIFIED',
        rating: 4.9,
        totalRescues: 215
      }
    ];
    respondersList.forEach(r => {
      this.responders.set(r.id, r);
      // Initialize Realtime Database location
      this.liveLocations.set(r.id, {
        responderId: r.responderId,
        latitude: r.latitude,
        longitude: r.longitude,
        timestamp: Date.now(),
        incidentId: null
      });
    });

    // 3. Seed Hospitals
    const hospitalsList = [
      {
        id: 'hosp_sms_01',
        hospitalName: 'SMS Medical College & Trauma Hospital',
        latitude: 26.8928,
        longitude: 75.8118,
        availableBeds: 14,
        emergencyAvailable: true,
        contactNumber: '+91 141 2560291',
        traumaLevel: 'LEVEL_1',
        icuBeds: 5
      },
      {
        id: 'hosp_fortis_02',
        hospitalName: 'Fortis Escorts Hospital Jaipur',
        latitude: 26.8520,
        longitude: 75.8050,
        availableBeds: 8,
        emergencyAvailable: true,
        contactNumber: '+91 141 2547000',
        traumaLevel: 'LEVEL_2',
        icuBeds: 3
      },
      {
        id: 'hosp_santokba_03',
        hospitalName: 'Santokba Durlabhji Memorial Hospital',
        latitude: 26.8950,
        longitude: 75.8020,
        availableBeds: 11,
        emergencyAvailable: true,
        contactNumber: '+91 141 2566251',
        traumaLevel: 'LEVEL_2',
        icuBeds: 4
      }
    ];
    hospitalsList.forEach(h => this.hospitals.set(h.id, h));

    // 4. Seed Trusted Contacts for defaultUser (3 Emergency Priority Numbers)
    const contacts = [
      {
        id: 'tc_rahul',
        userId: 'usr_rahul_01',
        name: 'Rahul (Primary Alert Phone)',
        phone: '+91 9263293460',
        email: 'rahul@emergencyconnect.org',
        relationship: 'Primary Alert Mobile'
      },
      {
        id: 'tc_auto_9135',
        userId: 'usr_rahul_01',
        name: 'Emergency Contact 2',
        phone: '+91 9135722473',
        email: 'alert_9135722473@emergencyconnect.org',
        relationship: 'Immediate Family Mobile'
      },
      {
        id: 'tc_auto_7462',
        userId: 'usr_rahul_01',
        name: 'Emergency Contact 3',
        phone: '+91 7462857008',
        email: 'alert_7462857008@emergencyconnect.org',
        relationship: 'Emergency Alert Mobile'
      }
    ];
    contacts.forEach(c => this.trustedContacts.set(c.id, c));

    // 5. Seed an initial demo incident in resolved state for analytics
    const pastIncident = {
      id: 'inc_demo_prior_01',
      userId: 'usr_rahul_01',
      category: 'ACCIDENT',
      severity: 'CRITICAL',
      confidence: 0.94,
      description: 'Prior road accident resolved efficiently',
      latitude: 26.9124,
      longitude: 75.7873,
      photoUrls: [],
      videoUrls: [],
      suggestedServices: ['AMBULANCE', 'HOSPITAL', 'POLICE'],
      aiReason: 'Reported vehicle collision with bleeding person',
      responderId: 'resp_a102',
      hospitalId: 'hosp_sms_01',
      status: 'RESOLVED',
      createdAt: '2026-09-09T18:20:00.000Z',
      acceptedAt: '2026-09-09T18:20:31.000Z',
      arrivedAt: '2026-09-09T18:24:32.000Z',
      resolvedAt: '2026-09-09T18:35:00.000Z',
      responseTime: '4m 32s',
      dispatchTimeSec: 31,
      totalDurationSec: 272
    };
    this.incidents.set(pastIncident.id, pastIncident);
  }

  // --- Incidents ---
  createIncident(data) {
    const id = data.id || 'inc_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const incident = {
      id,
      userId: data.userId || 'usr_rahul_01',
      category: data.category || 'ACCIDENT',
      severity: data.severity || 'CRITICAL',
      confidence: data.confidence || 0.94,
      description: data.description || '',
      latitude: data.latitude || 26.9124,
      longitude: data.longitude || 75.7873,
      photoUrls: data.photoUrls || [],
      videoUrls: data.videoUrls || [],
      suggestedServices: data.suggestedServices || ['AMBULANCE', 'HOSPITAL', 'POLICE'],
      aiReason: data.aiReason || 'Initial SOS signal with location tracking',
      responderId: data.responderId || null,
      hospitalId: data.hospitalId || 'hosp_sms_01',
      status: data.status || 'CREATED',
      createdAt: data.createdAt || new Date().toISOString(),
      acceptedAt: null,
      arrivedAt: null,
      resolvedAt: null,
      responseTime: null
    };
    this.incidents.set(id, incident);
    return incident;
  }

  getIncident(id) {
    return this.incidents.get(id) || null;
  }

  updateIncident(id, updates) {
    const existing = this.incidents.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() };

    // Automatic calculation of response time if arriving
    if (updates.status === 'ARRIVED' && !updated.arrivedAt) {
      updated.arrivedAt = new Date().toISOString();
      const startMs = new Date(updated.createdAt).getTime();
      const arriveMs = new Date(updated.arrivedAt).getTime();
      const diffSec = Math.max(10, Math.floor((arriveMs - startMs) / 1000));
      const mins = Math.floor(diffSec / 60);
      const secs = diffSec % 60;
      updated.responseTime = `${mins}m ${secs}s`;
    }

    if (updates.status === 'RESOLVED' && !updated.resolvedAt) {
      updated.resolvedAt = new Date().toISOString();
      if (!updated.responseTime) updated.responseTime = '4m 32s';
    }

    this.incidents.set(id, updated);
    return updated;
  }

  getAllIncidents() {
    return Array.from(this.incidents.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // --- Responders ---
  getResponder(id) {
    return this.responders.get(id) || null;
  }

  getAllResponders() {
    return Array.from(this.responders.values());
  }

  updateResponder(id, updates) {
    const existing = this.responders.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.responders.set(id, updated);

    // Update Realtime Database coordinates if location is updated
    if (updates.latitude && updates.longitude) {
      this.liveLocations.set(id, {
        responderId: updated.responderId,
        latitude: updates.latitude,
        longitude: updates.longitude,
        timestamp: Date.now(),
        incidentId: updated.currentIncidentId
      });
    }
    return updated;
  }

  // --- Realtime Database (Live Locations) ---
  updateLiveLocation(responderId, lat, lng, incidentId = null) {
    const entry = {
      responderId,
      latitude: lat,
      longitude: lng,
      timestamp: Date.now(),
      incidentId
    };
    this.liveLocations.set(responderId, entry);
    // Also update responder table
    const r = this.responders.get(responderId);
    if (r) {
      r.latitude = lat;
      r.longitude = lng;
    }
    return entry;
  }

  getLiveLocation(responderId) {
    return this.liveLocations.get(responderId) || null;
  }

  getAllLiveLocations() {
    return Array.from(this.liveLocations.values());
  }

  // --- Hospitals ---
  getAllHospitals() {
    return Array.from(this.hospitals.values());
  }

  updateHospital(id, updates) {
    const existing = this.hospitals.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.hospitals.set(id, updated);
    return updated;
  }

  // --- Trusted Contacts ---
  getTrustedContactsForUser(userId) {
    return Array.from(this.trustedContacts.values()).filter(c => c.userId === userId);
  }

  addTrustedContact(contactData) {
    const id = 'tc_' + Date.now().toString(36);
    const item = { id, ...contactData };
    this.trustedContacts.set(id, item);
    return item;
  }

  removeTrustedContact(id) {
    return this.trustedContacts.delete(id);
  }
}

module.exports = new DataStore();
