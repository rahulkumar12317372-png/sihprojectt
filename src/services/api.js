/**
 * Frontend API Service
 * Handles communication with Node.js + Express backend and SSE live coordinate feed.
 */

const API_BASE = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '') + '/api';

export const api = {
  // Incidents
  async createIncident(incidentData) {
    const res = await fetch(`${API_BASE}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incidentData)
    });
    return res.json();
  },

  async getIncident(id) {
    const res = await fetch(`${API_BASE}/incidents/${id}`);
    return res.json();
  },

  async getAllIncidents(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/incidents?${query}`);
    return res.json();
  },

  async updateIncident(id, updates) {
    const res = await fetch(`${API_BASE}/incidents/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async cancelIncident(id, reason = '') {
    const res = await fetch(`${API_BASE}/incidents/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    return res.json();
  },

  async resolveIncident(id) {
    const res = await fetch(`${API_BASE}/incidents/${id}/resolve`, {
      method: 'POST'
    });
    return res.json();
  },

  // AI Triage
  async classifyAI(description, evidenceMeta = {}) {
    const res = await fetch(`${API_BASE}/ai/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, evidenceMeta })
    });
    return res.json();
  },

  // Responders
  async getNearbyResponders(lat, lon, category = 'ACCIDENT', severity = 'CRITICAL') {
    const res = await fetch(`${API_BASE}/responders/nearby?latitude=${lat}&longitude=${lon}&category=${category}&severity=${severity}`);
    return res.json();
  },

  async getAllResponders() {
    const res = await fetch(`${API_BASE}/responders`);
    return res.json();
  },

  async acceptIncident(responderId, incidentId) {
    const res = await fetch(`${API_BASE}/responders/${responderId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incidentId })
    });
    return res.json();
  },

  async updateResponderLocation(responderId, latitude, longitude, incidentId) {
    const res = await fetch(`${API_BASE}/responders/${responderId}/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude, incidentId })
    });
    return res.json();
  },

  // Hospitals
  async getNearbyHospitals(lat, lon) {
    const res = await fetch(`${API_BASE}/hospitals/nearby?latitude=${lat}&longitude=${lon}`);
    return res.json();
  },

  async getAllHospitals() {
    const res = await fetch(`${API_BASE}/hospitals`);
    return res.json();
  },

  async updateHospitalStatus(hospitalId, updates) {
    const res = await fetch(`${API_BASE}/hospitals/${hospitalId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Analytics
  async getAnalyticsSummary() {
    const res = await fetch(`${API_BASE}/analytics/summary`);
    return res.json();
  },

  async getPublicAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/public`);
    return res.json();
  },

  // Trusted Contacts
  async getContacts(userId = 'usr_rahul_01') {
    const res = await fetch(`${API_BASE}/notifications/contacts/${userId}`);
    return res.json();
  },

  async addContact(contactData) {
    const res = await fetch(`${API_BASE}/notifications/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactData)
    });
    return res.json();
  },

  async deleteContact(id) {
    const res = await fetch(`${API_BASE}/notifications/contacts/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Direct Automatic Notifications
  async sendNotification(channel, recipient, message) {
    const res = await fetch(`${API_BASE}/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, recipient, message })
    });
    return res.json();
  },

  async sendWhatsAppAlert(recipient, message) {
    return this.sendNotification('WHATSAPP', recipient, message);
  },

  async makeEmergencyCall(recipient, voiceUrl) {
    const res = await fetch(`${API_BASE}/notifications/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient, voiceUrl })
    });
    return res.json();
  },

  // Send emergency alert to ALL trusted contacts at once
  async sendEmergencyAlertToAll(alertData) {
    const res = await fetch(`${API_BASE}/notifications/emergency-alert-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertData)
    });
    return res.json();
  },

  // Get notification delivery logs
  async getNotificationLogs(limit = 50) {
    const res = await fetch(`${API_BASE}/notifications/logs?limit=${limit}`);
    return res.json();
  }
};

