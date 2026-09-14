# EMERGENCYCONNECT
### "Real-Time Emergency Response & Coordination Platform"

> **IMPORTANT SAFETY NOTICE:**
> EMERGENCYCONNECT is a real-time emergency coordination prototype. It does NOT falsely claim to be officially integrated with 112/ERSS unless an authorized government API integration exists.
> **For immediate danger, call the official national emergency number: 112.**

---

## 1. Product Vision
EMERGENCYCONNECT is designed around an end-to-end real-time emergency lifecycle:
```
ONE SOS (2-Second Hold)
       ↓
CAPTURE LOCATION (GPS Precision)
       ↓
COLLECT DESCRIPTION / VOICE / EVIDENCE
       ↓
AI SEVERITY TRIAGE (Gemini / OpenAI Strict JSON)
       ↓
EMERGENCY CATEGORY & SEVERITY
       ↓
NEAREST RESPONDER MATCHING (Haversine Scoring)
       ↓
NOTIFY TRUSTED GUARDIAN CONTACTS
       ↓
LIVE REAL-TIME TRACKING (Leaflet OpenStreetMap + RTDB)
       ↓
RESPONDER ARRIVES (Ambulance A102)
       ↓
INCIDENT RESOLVED & LOGGED
       ↓
RESPONSE-TIME ANALYTICS (e.g. 4m 32s)
```

---

## 2. Mandatory Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript, React.js (React Router v6, Leaflet OpenStreetMap, Lucide icons, responsive command-center design).
- **Backend**: Node.js, Express.js (Modular REST architecture, SSE live coordinate streaming).
- **Database**:
  - **Firebase Firestore**: Permanent collections (`incidents`, `users`, `responders`, `hospitals`, `trustedContacts`, `notifications`, `analytics`).
  - **Firebase Realtime Database**: `/liveLocations/{responderId}` for ultra-low latency continuous vehicle tracking.
- **Authentication**: Firebase Authentication with Role-Based Access Control (`USER`, `RESPONDER`, `HOSPITAL`, `ADMIN`).
- **Maps**: OpenStreetMap (via Leaflet) with Google Maps provider abstraction.
- **AI**: Gemini API & OpenAI API integration with strict JSON output validation and resilient offline heuristics.
- **Notifications**: Multi-channel abstraction for Firebase Cloud Messaging (FCM), SMS, and Email.

---

## 3. Pre-Configured Demo Credentials & Roles

| Role | Name | Email | Password | Context |
|---|---|---|---|---|
| **USER** | Rahul Sharma | `rahul@example.com` | `password123` | Citizen / Person in Distress (Jaipur MI Road) |
| **RESPONDER** | Vikram Singh (A102) | `a102@responder.emergencyconnect.org` | `password123` | ALS Cardiac Ambulance A102 (1.7 km away) |
| **HOSPITAL** | SMS Trauma Center | `sms@hospital.emergencyconnect.org` | `password123` | SMS Medical College Level 1 Trauma Facility |
| **ADMIN** | Command Director | `admin@emergencyconnect.org` | `password123` | Central Emergency Command & Fleet Oversight |

*Note: You can switch roles instantly with 1-click using the floating **DEMO CONTROLLER** bar at the bottom of the screen.*

---

## 4. Controlled Jaipur Demo Scenario Walkthrough

The platform comes pre-wired with the exact competition demo scenario:
1. **User**: Rahul Sharma
2. **Location**: Jaipur Sector, Rajasthan (`26.9124° N, 75.7873° E`)
3. **Emergency Description**:
   *"There has been a serious bike accident. One person is unconscious and another is bleeding."*
4. **AI Output**:
   - Category: `ACCIDENT` / `MEDICAL`
   - Severity: `CRITICAL`
   - Suggested Services: `AMBULANCE`, `HOSPITAL`, `POLICE`
   - Reason: `Reported unconscious and bleeding person following vehicle crash`
   - Confidence: `0.94`
5. **Nearest Responder**:
   - Vehicle: **Ambulance A102** (Driver: Vikram Singh)
   - Distance: **1.7 km**
   - ETA: **5 minutes**
6. **Live Route Tracking**:
   - Status transitions to `ON_THE_WAY`.
   - Ambulance A102 moves in real time along the vector to Rahul's coordinates on the OpenStreetMap interface.
7. **Arrival & Resolution**:
   - Status updates to `ARRIVED` upon proximity.
   - Responder clicks `Resolve Incident`.
   - Incident is archived with an audited response time: **4m 32s**.
   - Analytics charts and response benchmarks update immediately.

---

## 5. Project Directory Structure
```
emergencyconnect/
├── backend/
│   ├── src/
│   │   ├── ai/
│   │   │   ├── aiService.js          # Gemini & OpenAI client + mock fallback
│   │   │   └── triageEngine.js       # Strict JSON validation & prompt
│   │   ├── matching/
│   │   │   └── responderMatching.js  # Haversine distance, scoring & ETA
│   │   ├── notifications/
│   │   │   └── notificationService.js# Multi-channel notification dispatcher
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js     # RBAC verification
│   │   │   └── errorHandler.js       # Safe error response
│   │   ├── routes/
│   │   │   ├── incidentRoutes.js     # /api/incidents
│   │   │   ├── aiRoutes.js           # /api/ai/classify
│   │   │   ├── responderRoutes.js    # /api/responders
│   │   │   ├── hospitalRoutes.js     # /api/hospitals
│   │   │   ├── notificationRoutes.js # /api/notifications
│   │   │   └── analyticsRoutes.js    # /api/analytics
│   │   ├── services/
│   │   │   └── dataStore.js          # Unified Firestore & RTDB adapter
│   │   ├── controllers/
│   │   │   └── [handlers].js
│   │   └── server.js                 # Express server & live coordinate SSE
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── manifest.json             # PWA manifest
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Responsive header with 112 quick dial
│   │   │   ├── SOSButton.jsx         # 2-second hold circular SVG progress
│   │   │   ├── LiveMap.jsx           # OpenStreetMap Leaflet moving markers
│   │   │   ├── StatusTimeline.jsx    # 7-step lifecycle progression
│   │   │   ├── SeverityBadge.jsx     # Visual triage tags
│   │   │   ├── SafetyNotice.jsx      # 112 emergency fallback banner
│   │   │   ├── DemoControlBar.jsx    # 1-click evaluator launcher
│   │   │   └── MetricCard.jsx        # Command center KPI card
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # RBAC & demo switching
│   │   │   └── EmergencyContext.jsx  # Active incident state & GPS feed
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx       # Full presentation showcase
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── UserDashboard.jsx     # 2-second hold SOS & sector radar
│   │   │   ├── EmergencyReportPage.jsx# Voice transcription & AI triage
│   │   │   ├── LiveIncidentPage.jsx  # Live map, ETA, 112 call
│   │   │   ├── ResponderDashboard.jsx# Online/Offline, Accept, Arrived, Resolve
│   │   │   ├── HospitalDashboard.jsx # Beds counter, Trauma bay readiness
│   │   │   ├── AdminDashboard.jsx    # Command Center, AI override, CSV export
│   │   │   ├── AnalyticsPage.jsx     # Public privacy-safe aggregate data
│   │   │   ├── ContactsPage.jsx      # Trusted guardians
│   │   │   ├── HistoryPage.jsx       # Incident history
│   │   │   └── ProfilePage.jsx
│   │   ├── services/
│   │   │   ├── api.js                # Backend REST connector
│   │   │   └── firebase.js           # Firebase configuration
│   │   ├── utils/
│   │   │   ├── haversine.js          # Distance math
│   │   │   └── formatters.js
│   │   ├── App.jsx                   # Router & mobile bottom navigation
│   │   ├── main.jsx
│   │   └── index.css                 # Emergency dark navy design tokens
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── firebase/
│   ├── firestore.rules               # RBAC rules
│   └── database.rules.json           # Live location tracking rules
├── .env.example
└── README.md
```

---

## 6. Installation & Running Locally

### Step 1: Install Dependencies
Open two terminals:

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm run dev
```
*Backend runs at `http://localhost:5000` with live SSE on `/api/stream/live-tracking`.*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:3000`.*

---

## 7. AI Service Configuration (Gemini & OpenAI)
To enable cloud AI generation, set your API key in `backend/.env`:
```ini
GEMINI_API_KEY=your_gemini_key_here
AI_PROVIDER=gemini
```
Or for OpenAI:
```ini
OPENAI_API_KEY=your_openai_key_here
AI_PROVIDER=openai
```
*Note: If no external key is provided, the platform automatically utilizes its high-fidelity clinical heuristic triage engine so demos NEVER break.*

---

## 8. Security & RBAC Policies
- **Role-Based Access Control**: Normal users registering via `/register` cannot self-assign `ADMIN` role.
- **Safety First**: Dispatchers and responders retain 100% authority to override AI triage results.
- **Privacy Assurance**: Public analytics (`/analytics`) strictly aggregate metrics and NEVER expose private victim identities, medical files, or residential addresses.
