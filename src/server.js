const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { authMiddleware } = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');
const dataStore = require('./services/dataStore');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role', 'x-user-id']
}));
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(authMiddleware);

// Health check & Safety fallback declaration
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'EMERGENCYCONNECT Core Backend',
    mode: 'PROTOTYPE_DEMO',
    safetyNotice: 'For immediate danger, call official emergency number 112.',
    timestamp: new Date().toISOString()
  });
});

// Mount modular routes
app.use('/api/incidents', require('./routes/incidentRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/responders', require('./routes/responderRoutes'));
app.use('/api/hospitals', require('./routes/hospitalRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Server-Sent Events (SSE) for Real-Time Location & Status Streaming
// Simulates Firebase Realtime Database live streaming to clients
app.get('/api/stream/live-tracking', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendUpdate = () => {
    const locations = dataStore.getAllLiveLocations();
    const incidents = dataStore.getAllIncidents();
    const active = incidents.find(i => !['RESOLVED', 'CANCELLED'].includes(i.status));

    const payload = JSON.stringify({
      locations,
      activeIncident: active || null,
      timestamp: Date.now()
    });

    res.write(`data: ${payload}\n\n`);
  };

  sendUpdate();
  const intervalId = setInterval(sendUpdate, 1500);

  req.on('close', () => {
    clearInterval(intervalId);
  });
});

// Demo vehicle movement ticker:
// When responder A102 is ON_THE_WAY to Rahul's location (26.9124, 75.7873),
// interpolate coordinates smoothly from initial (26.9240, 75.8010) towards incident!
setInterval(() => {
  const resp = dataStore.getResponder('resp_a102');
  if (!resp || !resp.currentIncidentId) return;

  const inc = dataStore.getIncident(resp.currentIncidentId);
  if (!inc || inc.status !== 'ON_THE_WAY') return;

  const targetLat = inc.latitude;
  const targetLon = inc.longitude;

  // Step 5% closer each tick
  const step = 0.08;
  const newLat = resp.latitude + (targetLat - resp.latitude) * step;
  const newLon = resp.longitude + (targetLon - resp.longitude) * step;

  dataStore.updateLiveLocation('resp_a102', Number(newLat.toFixed(5)), Number(newLon.toFixed(5)), inc.id);

  // Check if arrived (within 100 meters)
  const dist = Math.sqrt(Math.pow(targetLat - newLat, 2) + Math.pow(targetLon - newLon, 2));
  if (dist < 0.0008 && inc.status === 'ON_THE_WAY') {
    dataStore.updateIncident(inc.id, { status: 'ARRIVED' });
  }
}, 2000);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[EMERGENCYCONNECT Server] Running on http://localhost:${PORT}`);
  console.log(`[Safety Notice] Prototype coordination platform. Call 112 for immediate danger.`);
});
