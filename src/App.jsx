import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  Radio,
  Ambulance,
  Building2,
  LayoutDashboard,
  BarChart3,
  Clock,
  CheckCircle2,
  MapPin,
  Flame,
  Activity,
  Mic,
  MicOff,
  Sparkles,
  Navigation,
  Download,
  Power,
  RotateCcw,
  Bed,
  HeartPulse,
  Send,
  XCircle,
  AlertTriangle,
  Users,
  MessageSquare,
  Share2,
  Check,
  Plus,
  Crosshair,
  Compass,
  Siren,
  Shield,
  Zap,
  Loader2
} from 'lucide-react';
import SOSButton from './components/SOSButton';
import LiveMap from './components/LiveMap';
import SeverityBadge from './components/SeverityBadge';
import StatusTimeline from './components/StatusTimeline';
import MetricCard from './components/MetricCard';
import SafetyNotice from './components/SafetyNotice';
import { audioAlert } from './utils/audioAlert';
import { api } from './services/api';

// Multi-hazard Emergency Service Configuration
const EMERGENCY_SERVICES = {
  FIRE: {
    key: 'FIRE',
    title: 'Fire Brigade (Ghar Me Aag)',
    buttonLabel: '🔥 Fire / Aag (101)',
    badge: '101 FIRE BRIGADE',
    color: '#ea580c',
    responderName: 'Fire Tender FT-09 (Fire Brigade)',
    responderRole: 'Heavy Rescue & Foam Fire Tender',
    driver: 'Kailash Sharma (Station Officer)',
    commander: 'Fire Captain Rajesh Chauhan (Station 4)',
    equipment: '4,500L Water Foam Tanker & Hydraulic Ladder Ready',
    facilityName: 'Central Fire Station (Station 4), Jaipur',
    facilityAddress: 'Station Road, Near Railway Colony, Jaipur, Rajasthan 302006',
    hotline: '101',
    hotlineDisplay: '101 / +91 141 2741101',
    distance: 1.9,
    eta: 4,
    defaultDesc: 'Ghar me aag lag gayi hai! Emergency Fire Brigade & Fireforces turant bhejiye!',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Central+Fire+Station+Station+Road+Jaipur',
    actionPrompt: 'DISPATCH FIRE TENDER FT-09 TO HOUSE'
  },
  POLICE: {
    key: 'POLICE',
    title: 'Police PCR & Crime Distress',
    buttonLabel: '🚓 Police / PCR (112)',
    badge: '112 POLICE PCR',
    color: '#2563eb',
    responderName: 'Police PCR Van Cheetah-04',
    responderRole: 'Quick Response Police Interceptor',
    driver: 'Head Constable Rajesh Meena',
    commander: 'Sub-Inspector Manoj Sharma (PCR In-Charge)',
    equipment: 'Rapid Response Interceptor & Emergency Beacon Ready',
    facilityName: 'MI Road Police Station, Jaipur Police Commissionerate',
    facilityAddress: 'MI Road, Near Police Headquarters, Jaipur, Rajasthan 302001',
    hotline: '112',
    hotlineDisplay: '112 / +91 141 2362222',
    distance: 1.2,
    eta: 3,
    defaultDesc: 'Distress emergency! Immediate police assistance required at this location.',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=MI+Road+Police+Station+Jaipur',
    actionPrompt: 'DISPATCH POLICE PCR CHEETAH-04'
  },
  ACCIDENT: {
    key: 'ACCIDENT',
    title: 'Medical Ambulance & Trauma Care',
    buttonLabel: '🚑 Medical / Ambulance (108)',
    badge: '108 AMBULANCE',
    color: '#ef4444',
    responderName: 'Ambulance A102',
    responderRole: 'ALS Cardiac Life Support Ambulance',
    driver: 'Paramedic Vikram Singh',
    commander: 'Dr. Alok Mehta (HOD Trauma & Emergency)',
    equipment: 'Level 1 Trauma Care Unit (14 ICU Beds Ready)',
    facilityName: 'SMS Medical College & Trauma Hospital, Jaipur',
    facilityAddress: 'Jawahar Lal Nehru Marg, Gangawal Park, Jaipur, Rajasthan 302004',
    hotline: '108',
    hotlineDisplay: '108 / +91 141 2560291',
    distance: 1.7,
    eta: 5,
    defaultDesc: 'There has been a serious accident. One person is injured and urgent medical ambulance is required.',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=SMS+Medical+College+Jaipur',
    actionPrompt: 'DISPATCH AMBULANCE A102 TO SMS HOSPITAL'
  }
};

const getServiceConfig = (cat) => {
  if (cat === 'FIRE') return EMERGENCY_SERVICES.FIRE;
  if (cat === 'POLICE' || cat === 'CRIME') return EMERGENCY_SERVICES.POLICE;
  return EMERGENCY_SERVICES.ACCIDENT;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('SOS'); // 'SOS' | 'RESPONDER' | 'HOSPITAL' | 'ADMIN' | 'ANALYTICS'

  // --- Live Device GPS Location State ---
  const [locationMode, setLocationMode] = useState('REAL_GPS'); // 'REAL_GPS' | 'JAIPUR_DEMO'
  const [userLocation, setUserLocation] = useState({
    latitude: 26.9124,
    longitude: 75.7873,
    accuracy: 15,
    cityName: 'Jaipur Sector (MI Road)',
    isRealGps: false
  });
  const [userAddress, setUserAddress] = useState('MI Road, Gangawal Park, Jaipur, Rajasthan 302004');
  const [gpsStatus, setGpsStatus] = useState({
    active: false,
    error: null,
    locating: false,
    lastSync: null
  });

  // --- SOS / Citizen State ---
  const [sosStep, setSosStep] = useState('IDLE'); // 'IDLE' | 'REPORT' | 'TRACKING'
  const [description, setDescription] = useState('There has been a serious accident. One person is injured and urgent medical ambulance is required.');
  const [category, setCategory] = useState('ACCIDENT');
  const [isListening, setIsListening] = useState(false);
  const [activeIncident, setActiveIncident] = useState(null);

  // Live moving coordinates & live telemetry countdown
  const [responderCoords, setResponderCoords] = useState({ latitude: 26.9240, longitude: 75.8010, name: 'Ambulance A102' });
  const [hospitalCoords, setHospitalCoords] = useState({ latitude: 26.8928, longitude: 75.8118, name: 'SMS Medical College & Trauma Hospital, Jaipur' });
  const [liveDistanceKm, setLiveDistanceKm] = useState(1.7);
  const [liveEtaMin, setLiveEtaMin] = useState(5);
  const [isSimulating, setIsSimulating] = useState(false);
  const [transitPhase, setTransitPhase] = useState('TO_VICTIM'); // 'TO_VICTIM' | 'TO_HOSPITAL' | 'AT_HOSPITAL'
  const simulationTimerRef = useRef(null);
  const isSimulatingRef = useRef(false);

  useEffect(() => {
    isSimulatingRef.current = isSimulating;
  }, [isSimulating]);

  // --- Emergency Family Contacts (Ghar Pe Alert) ---
  const [familyContacts, setFamilyContacts] = useState([
    { id: 'fc_rahul', name: 'Rahul (My Mobile)', relation: 'Primary Emergency Mobile', phone: '+91 9263293460', alertStatus: 'READY', isPrimary: true, autoSend: true },
    { id: 'fc_auto_9135', name: 'Emergency Contact (Auto-Alert)', relation: 'Immediate Family Mobile', phone: '+91 9135722473', alertStatus: 'READY', isPrimary: true, autoSend: true },
    { id: 'fc_1', name: 'Sunita Sharma', relation: 'Mummy (Mother)', phone: '+91 98290 12345', alertStatus: 'READY' },
    { id: 'fc_2', name: 'Amit Sharma', relation: 'Bhai (Brother)', phone: '+91 98290 67890', alertStatus: 'READY' },
    { id: 'fc_3', name: 'Priya Verma', relation: 'Friend / Family', phone: '+91 98290 54321', alertStatus: 'READY' }
  ]);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('Family');

  // --- Destination Hospital Details (Always SMS Medical College & Trauma Hospital, Jaipur) ---
  const [destinationHospital, setDestinationHospital] = useState({
    name: 'SMS Medical College & Trauma Hospital, Jaipur',
    address: 'Jawahar Lal Nehru Marg, Gangawal Park, Jaipur, Rajasthan 302004',
    traumaLevel: 'LEVEL 1 TRAUMA CARE UNIT',
    inchargeDoctor: 'Dr. Alok Mehta (HOD Trauma & Emergency)',
    availableBeds: 14,
    emergencyHotline: '+91 141 2560291'
  });

  // --- Twilio Server-Side Automatic WhatsApp State ---
  const [twilioSending, setTwilioSending] = useState({});
  const [twilioFeedback, setTwilioFeedback] = useState({});

  const handleTriggerTwilioWhatsApp = async (phone, contactName) => {
    setTwilioSending(prev => ({ ...prev, [phone]: true }));
    try {
      const res = await api.sendWhatsAppAlert(
        phone,
        `🚨 EMERGENCY SOS: Immediate alert for ${contactName}. Live location locked at Jaipur. Help has been dispatched via EmergencyConnect.`
      );
      if (res.success && res.data) {
        setTwilioFeedback(prev => ({
          ...prev,
          [phone]: {
            status: 'SUCCESS',
            sid: res.data.metadata?.messageSid || 'QUEUED',
            time: new Date().toLocaleTimeString()
          }
        }));
      } else {
        setTwilioFeedback(prev => ({
          ...prev,
          [phone]: {
            status: 'ERROR',
            error: res.error || 'Dispatch error'
          }
        }));
      }
    } catch (err) {
      setTwilioFeedback(prev => ({
        ...prev,
        [phone]: {
          status: 'ERROR',
          error: err.message
        }
      }));
    } finally {
      setTwilioSending(prev => ({ ...prev, [phone]: false }));
    }
  };

  // --- Responder State ---
  const [responderOnline, setResponderOnline] = useState(true);

  // --- Hospital State ---
  const [availableBeds, setAvailableBeds] = useState(14);
  const [traumaBayOpen, setTraumaBayOpen] = useState(true);

  // --- Incidents & Live Locations ---
  const [allIncidents, setAllIncidents] = useState([]);
  const [analytics, setAnalytics] = useState({
    averageResponseTime: '4m 32s',
    totalIncidentsResolved: 142,
    averageDispatchTime: '31s',
    responderAcceptanceRate: '96.4%'
  });

  // REVERSE GEOCODING HELPER
  const fetchAddressForCoords = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          setUserAddress(data.display_name);
          const road = data.address?.road || data.address?.neighbourhood || data.address?.suburb || '';
          const city = data.address?.city || data.address?.state_district || data.address?.state || '';
          const areaTitle = road ? `${road}, ${city}` : (city || `Sector ${lat.toFixed(3)}N, ${lon.toFixed(3)}E`);
          setUserLocation(prev => ({
            ...prev,
            cityName: areaTitle
          }));
        }
      }
    } catch (e) {
      setUserAddress(`Near Coordinates ${lat.toFixed(5)}N, ${lon.toFixed(5)}E`);
    }
  };

  // EXPLICIT LIVE GPS REQUEST
  const requestLiveLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatus({ active: false, error: 'Browser does not support GPS', locating: false, lastSync: null });
      return;
    }

    setGpsStatus(prev => ({ ...prev, locating: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);

        setUserLocation({
          latitude: lat,
          longitude: lon,
          accuracy: acc,
          cityName: `Live GPS (${lat.toFixed(4)}, ${lon.toFixed(4)})`,
          isRealGps: true
        });

        setGpsStatus({
          active: true,
          error: null,
          locating: false,
          lastSync: new Date().toLocaleTimeString()
        });

        // Set ambulance starting position 1.5 km away from user's REAL coordinates if not currently simulating
        if (!isSimulatingRef.current) {
          setResponderCoords({
            latitude: lat + 0.0120,
            longitude: lon + 0.0105,
            name: 'Ambulance A102'
          });
          setHospitalCoords({
            latitude: lat - 0.0160,
            longitude: lon + 0.0140,
            name: 'SMS Medical College & Trauma Hospital, Jaipur'
          });
        }

        fetchAddressForCoords(lat, lon);
      },
      (err) => {
        console.warn('Live device GPS error:', err.message);
        setGpsStatus({
          active: false,
          error: err.code === 1 ? 'Location permission denied' : 'GPS signal weak',
          locating: false,
          lastSync: null
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // HIGH ACCURACY LIVE DEVICE GPS WATCHER
  useEffect(() => {
    let watchId = null;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const acc = Math.round(pos.coords.accuracy);

          setUserLocation(prev => {
            if (prev.isRealGps && Math.abs(prev.latitude - lat) < 0.0001 && Math.abs(prev.longitude - lon) < 0.0001) {
              return prev;
            }
            return {
              latitude: lat,
              longitude: lon,
              accuracy: acc,
              cityName: prev.cityName.includes('GPS') || prev.cityName.includes('Jaipur') ? `Live GPS (${lat.toFixed(4)}, ${lon.toFixed(4)})` : prev.cityName,
              isRealGps: true
            };
          });

          setGpsStatus({
            active: true,
            error: null,
            locating: false,
            lastSync: new Date().toLocaleTimeString()
          });

          // Only reposition responder if not actively simulating
          if (!isSimulatingRef.current) {
            setResponderCoords({
              latitude: lat + 0.0120,
              longitude: lon + 0.0105,
              name: 'Ambulance A102'
            });
          }
        },
        (err) => {
          console.warn('watchPosition error:', err.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }

    // Initial GPS poll
    requestLiveLocation();

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Fetch backend records
  const refreshData = async () => {
    try {
      const [incRes, anaRes] = await Promise.all([
        api.getAllIncidents(),
        api.getAnalyticsSummary()
      ]);
      if (incRes.success && incRes.data) setAllIncidents(incRes.data);
      if (anaRes.success && anaRes.data) setAnalytics(anaRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 3500);
    return () => {
      clearInterval(interval);
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    };
  }, []);

  // Toggle between Real GPS and Jaipur Demo
  const handleToggleLocationMode = (mode) => {
    setLocationMode(mode);
    if (mode === 'JAIPUR_DEMO') {
      setUserLocation({
        latitude: 26.9124,
        longitude: 75.7873,
        accuracy: 12,
        cityName: 'Jaipur Sector (MI Road)',
        isRealGps: false
      });
      setUserAddress('MI Road, Gangawal Park, Jaipur, Rajasthan 302004');
      setResponderCoords({
        latitude: 26.9240,
        longitude: 75.8010,
        name: 'Ambulance A102'
      });
      setHospitalCoords({
        latitude: 26.8928,
        longitude: 75.8118,
        name: 'SMS Medical College & Trauma Hospital, Jaipur'
      });
      setGpsStatus({
        active: true,
        error: null,
        locating: false,
        lastSync: 'Demo Mode'
      });
    } else {
      requestLiveLocation();
    }
  };

  // Web Speech recognition
  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setDescription(prev => (prev ? `${prev} ${transcript}` : transcript));
    };
    rec.start();
  };

  // Add new family contact
  const handleAddFamilyContact = (e) => {
    e.preventDefault();
    if (!newContactName || !newContactPhone) return;
    const newEntry = {
      id: 'fc_' + Date.now(),
      name: newContactName,
      phone: newContactPhone,
      relation: newContactRelation,
      alertStatus: 'READY'
    };
    setFamilyContacts(prev => [...prev, newEntry]);
    setNewContactName('');
    setNewContactPhone('');
    setShowAddContact(false);
  };

  // Helper to switch category & update responder/facility positions
  const handleSelectCategory = (cat) => {
    setCategory(cat);
    const cfg = getServiceConfig(cat);
    setDescription(cfg.defaultDesc);
    setLiveDistanceKm(cfg.distance);
    setLiveEtaMin(cfg.eta);

    if (!isSimulatingRef.current) {
      if (cat === 'FIRE') {
        setResponderCoords({
          latitude: Number((userLocation.latitude + 0.0150).toFixed(5)),
          longitude: Number((userLocation.longitude - 0.0120).toFixed(5)),
          name: cfg.responderName
        });
        setHospitalCoords({
          latitude: Number((userLocation.latitude + 0.0180).toFixed(5)),
          longitude: Number((userLocation.longitude - 0.0140).toFixed(5)),
          name: cfg.facilityName
        });
      } else if (cat === 'POLICE' || cat === 'CRIME') {
        setResponderCoords({
          latitude: Number((userLocation.latitude - 0.0100).toFixed(5)),
          longitude: Number((userLocation.longitude - 0.0110).toFixed(5)),
          name: cfg.responderName
        });
        setHospitalCoords({
          latitude: Number((userLocation.latitude - 0.0130).toFixed(5)),
          longitude: Number((userLocation.longitude - 0.0150).toFixed(5)),
          name: cfg.facilityName
        });
      } else {
        setResponderCoords({
          latitude: Number((userLocation.latitude + 0.0120).toFixed(5)),
          longitude: Number((userLocation.longitude + 0.0105).toFixed(5)),
          name: cfg.responderName
        });
        setHospitalCoords({
          latitude: Number((userLocation.latitude - 0.0160).toFixed(5)),
          longitude: Number((userLocation.longitude + 0.0140).toFixed(5)),
          name: cfg.facilityName
        });
      }
    }
  };

  // Holding SOS button directly triggers the specialized emergency service!
  const handleSOSHoldActivated = () => {
    handleDispatchSOS(category);
  };

  // MULTI-HAZARD REAL-TIME VEHICLE MOVEMENT:
  // - FIRE: Dispatches Fire Tender FT-09, fights fire on scene, saves house & extinguishes fire.
  // - POLICE: Dispatches Police PCR Cheetah-04, secures perimeter, safety resolved.
  // - MEDICAL: Dispatches Ambulance A102, picks up patient, transports to SMS Medical College & Trauma Hospital.
  const startRealtimeMovement = (incidentId, targetCategory = category) => {
    if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);

    const cfg = getServiceConfig(targetCategory);
    setTransitPhase('TO_VICTIM');
    setLiveDistanceKm(cfg.distance);
    setLiveEtaMin(cfg.eta);

    const startLat = responderCoords.latitude;
    const startLon = responderCoords.longitude;
    const victimLat = userLocation.latitude;
    const victimLon = userLocation.longitude;
    const facilityLat = hospitalCoords.latitude;
    const facilityLon = hospitalCoords.longitude;

    let phase1Progress = 0;
    audioAlert.playDispatchChime();

    // 1. Initial Emergency Alert to Family Contacts
    if (targetCategory === 'FIRE') {
      setFamilyContacts(prev => prev.map(c => ({
        ...c,
        alertStatus: 'SENT',
        lastSentMsg: `🔥 URGENT FIRE ALERT: Rahul ke ghar me aag lag gayi hai! Fire Brigade Tender FT-09 (Central Fire Station 4) raste me hai! Water Tanker ETA: ~${cfg.eta} min. Live track: http://localhost:3000`
      })));
    } else if (targetCategory === 'POLICE' || targetCategory === 'CRIME') {
      setFamilyContacts(prev => prev.map(c => ({
        ...c,
        alertStatus: 'SENT',
        lastSentMsg: `🚓 POLICE ALERT: Rahul ne Police SOS trigger kiya hai! Police PCR Cheetah-04 (MI Road Station) dispatch ho chuka hai. ETA: ~${cfg.eta} min. Live track: http://localhost:3000`
      })));
    } else {
      setFamilyContacts(prev => prev.map(c => ({
        ...c,
        alertStatus: 'SENT',
        lastSentMsg: `🚨 EMERGENCY ALERT: Rahul activated SOS at (${victimLat.toFixed(4)}, ${victimLon.toFixed(4)}). Ambulance A102 dispatched. Transport: ${destinationHospital.name}. Track live: http://localhost:3000`
      })));
    }

    // ==========================================
    // PHASE 1: DISPATCH TO VICTIM (Standby -> Scene / House)
    // ==========================================
    simulationTimerRef.current = setInterval(() => {
      phase1Progress += 10;

      const currentLat = startLat + (victimLat - startLat) * (phase1Progress / 100);
      const currentLon = startLon + (victimLon - startLon) * (phase1Progress / 100);

      setResponderCoords({
        latitude: Number(currentLat.toFixed(5)),
        longitude: Number(currentLon.toFixed(5)),
        name: cfg.responderName
      });

      const remainingDistance = Number((cfg.distance * (1 - phase1Progress / 100)).toFixed(1));
      const remainingEta = Math.max(1, Math.ceil(cfg.eta * (1 - phase1Progress / 100)));

      setLiveDistanceKm(remainingDistance > 0.05 ? remainingDistance : 0);
      setLiveEtaMin(remainingDistance > 0.05 ? remainingEta : 0);

      if (phase1Progress >= 30 && phase1Progress < 40) {
        setActiveIncident(prev => ({ ...prev, status: 'ON_THE_WAY' }));
      }

      // Reached victim location!
      if (phase1Progress >= 100) {
        clearInterval(simulationTimerRef.current);
        audioAlert.playArrivalChime();

        setActiveIncident(prev => ({
          ...prev,
          status: 'ARRIVED',
          arrivedAt: new Date().toISOString()
        }));

        if (targetCategory === 'FIRE') {
          // Fire Brigade Arrived at user's house!
          setFamilyContacts(prev => prev.map(c => ({
            ...c,
            alertStatus: 'ON_SCENE',
            lastSentMsg: `🚒 UPDATE: Fire Brigade Tender FT-09 ghar pahunch chuki hai! Hose lines deployed, water monitors active. Fire Captain Rajesh Chauhan aag bujha rahe hain.`
          })));

          // Wait 2.2 seconds: Active firefighting
          setTimeout(() => {
            setActiveIncident(prev => ({
              ...prev,
              status: 'TRANSIT_HOSPITAL', // advances timeline to step 5: HOSE LINES ACTIVE
              operationNote: 'Water foam monitors active & hose lines suppressing house fire'
            }));

            setFamilyContacts(prev => prev.map(c => ({
              ...c,
              alertStatus: 'FIRE_FIGHTING',
              lastSentMsg: `🚒 OPERATION UPDATE: Firefighters deploying 4,500L water foam canon. Flames controlled, building cooling in progress.`
            })));

            // Wait 3.2 seconds: Fire completely extinguished!
            setTimeout(async () => {
              setActiveIncident(prev => ({
                ...prev,
                status: 'ADMITTED', // advances timeline to step 6: FIRE EXTINGUISHED
                responseTime: '3m 48s',
                resolvedAt: new Date().toLocaleTimeString()
              }));

              setFamilyContacts(prev => prev.map(c => ({
                ...c,
                alertStatus: 'RESOLVED',
                lastSentMsg: `✅ FIRE RESOLVED: Ghar ki aag poori tarah bujha di gayi hai! Sabhi sadasya surakshit hain. Fire Brigade operation successful.`
              })));

              setTimeout(async () => {
                await api.resolveIncident(incidentId);
                setIsSimulating(false);
                refreshData();
              }, 2500);
            }, 3200);

          }, 2000);

        } else if (targetCategory === 'POLICE' || targetCategory === 'CRIME') {
          // Police PCR arrived on scene
          setFamilyContacts(prev => prev.map(c => ({
            ...c,
            alertStatus: 'ON_SCENE',
            lastSentMsg: `🚓 UPDATE: Police PCR Cheetah-04 scene par pahunch chuki hai. Sub-Inspector Manoj Sharma ne perimeter secure kar liya hai.`
          })));

          setTimeout(() => {
            setActiveIncident(prev => ({
              ...prev,
              status: 'TRANSIT_HOSPITAL',
              operationNote: 'Perimeter secured by PCR Cheetah-04'
            }));

            setTimeout(async () => {
              setActiveIncident(prev => ({
                ...prev,
                status: 'ADMITTED',
                responseTime: '2m 54s',
                resolvedAt: new Date().toLocaleTimeString()
              }));

              setFamilyContacts(prev => prev.map(c => ({
                ...c,
                alertStatus: 'RESOLVED',
                lastSentMsg: `✅ SITUATION SECURED: Police patrol on-site. Situation normal and citizen safe.`
              })));

              setTimeout(async () => {
                await api.resolveIncident(incidentId);
                setIsSimulating(false);
                refreshData();
              }, 2500);
            }, 3000);
          }, 1800);

        } else {
          // Medical: Ambulance boards patient and transports to SMS Hospital
          setFamilyContacts(prev => prev.map(c => ({
            ...c,
            alertStatus: 'ON_SCENE',
            lastSentMsg: `🚑 UPDATE: Ambulance A102 has ARRIVED on scene. Rahul is secured on cardiac stretcher. Preparing immediate emergency transfer to ${destinationHospital.name}.`
          })));

          setTimeout(() => {
            setTransitPhase('TO_HOSPITAL');
            audioAlert.playDispatchChime();

            setActiveIncident(prev => ({
              ...prev,
              status: 'TRANSIT_HOSPITAL',
              hospitalName: destinationHospital.name
            }));

            setFamilyContacts(prev => prev.map(c => ({
              ...c,
              alertStatus: 'HOSPITAL_TRANSIT_SENT',
              lastSentMsg: `🚨 URGENT HOSPITAL UPDATE: Rahul is now in Ambulance A102 & EN ROUTE to ${destinationHospital.name} (JLN Marg, Jaipur). Live Hospital Location: https://maps.google.com/?q=${facilityLat},${facilityLon}. Incharge: ${destinationHospital.inchargeDoctor}. 14 ICU Beds ready.`
            })));

            let phase2Progress = 0;
            const phase2TotalDist = 3.4;

            simulationTimerRef.current = setInterval(() => {
              phase2Progress += 8;

              const currentHospLat = victimLat + (facilityLat - victimLat) * (phase2Progress / 100);
              const currentHospLon = victimLon + (facilityLon - victimLon) * (phase2Progress / 100);

              setResponderCoords({
                latitude: Number(currentHospLat.toFixed(5)),
                longitude: Number(currentHospLon.toFixed(5)),
                name: 'Ambulance A102 (Patient En Route to Hospital)'
              });

              const remainingHospDist = Number((phase2TotalDist * (1 - phase2Progress / 100)).toFixed(1));
              const remainingHospEta = Math.max(1, Math.ceil(7 * (1 - phase2Progress / 100)));

              setLiveDistanceKm(remainingHospDist > 0.05 ? remainingHospDist : 0);
              setLiveEtaMin(remainingHospDist > 0.05 ? remainingHospEta : 0);

              if (phase2Progress >= 100) {
                clearInterval(simulationTimerRef.current);
                audioAlert.playArrivalChime();

                setTransitPhase('AT_HOSPITAL');
                setAvailableBeds(prev => Math.max(0, prev - 1));

                setActiveIncident(prev => ({
                  ...prev,
                  status: 'ADMITTED',
                  hospitalAdmittedAt: new Date().toLocaleTimeString(),
                  responseTime: '6m 24s',
                  allocatedBed: 'ICU Trauma Bay #04'
                }));

                setFamilyContacts(prev => prev.map(c => ({
                  ...c,
                  alertStatus: 'ADMITTED_CONFIRMED',
                  lastSentMsg: `✅ SAFELY ADMITTED: Rahul has arrived at ${destinationHospital.name}. Admitted into Emergency Trauma Bay #04 under ${destinationHospital.inchargeDoctor}. Family may visit at JLN Marg, Jaipur.`
                })));

                setTimeout(async () => {
                  await api.resolveIncident(incidentId);
                  setIsSimulating(false);
                  refreshData();
                }, 2000);
              }
            }, 700);

          }, 2200);
        }
      }
    }, 700);
  };

  // Submit Emergency & Dispatch with selected category
  const handleDispatchSOS = async (customCategory) => {
    const chosenCat = customCategory || category;
    const cfg = getServiceConfig(chosenCat);

    setIsSimulating(true);
    setSosStep('TRACKING');
    setTransitPhase('TO_VICTIM');
    setLiveDistanceKm(cfg.distance);
    setLiveEtaMin(cfg.eta);

    try {
      // 1. AI Triage
      const triageRes = await api.classifyAI(description);
      const triage = triageRes.data || {
        category: chosenCat,
        severity: 'CRITICAL',
        suggestedServices: chosenCat === 'FIRE' ? ['FIRE_DEPARTMENT'] : chosenCat === 'POLICE' ? ['POLICE'] : ['AMBULANCE', 'HOSPITAL'],
        reason: cfg.defaultDesc,
        confidence: 0.95
      };

      // 2. Create Incident with user's real GPS coordinates
      const createRes = await api.createIncident({
        userId: 'usr_rahul_01',
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        description,
        category: chosenCat,
        severity: triage.severity || 'CRITICAL',
        confidence: triage.confidence || 0.95,
        suggestedServices: triage.suggestedServices,
        aiReason: triage.reason,
        hospitalName: cfg.facilityName
      });

      const inc = createRes.data;
      setActiveIncident({
        ...inc,
        status: 'RESPONDER_ACCEPTED',
        hospitalName: cfg.facilityName,
        category: chosenCat
      });

      // Start real-time movement specialized for this category
      startRealtimeMovement(inc.id, chosenCat);

      // 3. AUTOMATIC REAL MESSAGE DISPATCH TO 9135722473 & 9263293460
      try {
        const autoTargetPhone = '+91 9135722473';
        const autoWhatsAppUrl = getWhatsappShareUrl(autoTargetPhone, { name: 'Emergency Family', relation: 'Immediate Alert' });
        window.open(autoWhatsAppUrl, '_blank');
      } catch (e) {
        console.log('Auto WhatsApp popup:', e);
      }

    } catch (err) {
      console.error(err);
      setIsSimulating(false);
    }
  };

  // 1-Click Fast Scenario Runner
  const handleQuickDemoRun = () => {
    setActiveTab('SOS');
    const cfg = getServiceConfig(category);
    setDescription(cfg.defaultDesc);
    handleDispatchSOS(category);
  };

  const handleResetSOS = () => {
    if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    setActiveIncident(null);
    setSosStep('IDLE');
    setTransitPhase('TO_VICTIM');
    setIsSimulating(false);
    const cfg = getServiceConfig(category);
    setLiveDistanceKm(cfg.distance);
    setLiveEtaMin(cfg.eta);

    if (category === 'FIRE') {
      setResponderCoords({
        latitude: Number((userLocation.latitude + 0.0150).toFixed(5)),
        longitude: Number((userLocation.longitude - 0.0120).toFixed(5)),
        name: cfg.responderName
      });
      setHospitalCoords({
        latitude: Number((userLocation.latitude + 0.0180).toFixed(5)),
        longitude: Number((userLocation.longitude - 0.0140).toFixed(5)),
        name: cfg.facilityName
      });
    } else if (category === 'POLICE' || category === 'CRIME') {
      setResponderCoords({
        latitude: Number((userLocation.latitude - 0.0100).toFixed(5)),
        longitude: Number((userLocation.longitude - 0.0110).toFixed(5)),
        name: cfg.responderName
      });
      setHospitalCoords({
        latitude: Number((userLocation.latitude - 0.0130).toFixed(5)),
        longitude: Number((userLocation.longitude - 0.0150).toFixed(5)),
        name: cfg.facilityName
      });
    } else {
      setResponderCoords({
        latitude: Number((userLocation.latitude + 0.0120).toFixed(5)),
        longitude: Number((userLocation.longitude + 0.0105).toFixed(5)),
        name: cfg.responderName
      });
      setHospitalCoords({
        latitude: Number((userLocation.latitude - 0.0160).toFixed(5)),
        longitude: Number((userLocation.longitude + 0.0140).toFixed(5)),
        name: cfg.facilityName
      });
    }

    setFamilyContacts(prev => prev.map(c => ({ ...c, alertStatus: 'READY' })));
  };

  // Direct Google Maps Link to Facility
  const facilityGoogleMapsUrl = getServiceConfig(category).googleMapsUrl;
  const hospitalGoogleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    'SMS Medical College & Hospital, Jawahar Lal Nehru Marg, Gangawal Park, Jaipur, Rajasthan'
  )}`;

  // Helper to compose full emergency alert text
  const getAlertMessageText = (customContact = null) => {
    const cfg = getServiceConfig(category);
    const recipient = customContact ? `${customContact.name} (${customContact.relation})` : 'Emergency Contacts';
    const cleanUserLoc = `${userLocation.latitude?.toFixed(4)}, ${userLocation.longitude?.toFixed(4)}`;

    if (category === 'FIRE') {
      return `🔥 EMERGENCY FIRE ALERT FOR ${recipient.toUpperCase()}!\nRahul ke ghar par aag lag gayi hai!\n\n🚒 Dispatched Unit: ${cfg.responderName}\n🏢 Fire Station: ${cfg.facilityName}\n📍 Scene Location: https://maps.google.com/?q=${cleanUserLoc}\n📞 Fire Helpline: 101 / ${cfg.hotlineDisplay}\n\nTrack live on dashboard: http://localhost:3000`;
    }
    if (category === 'POLICE' || category === 'CRIME') {
      return `🚓 POLICE EMERGENCY ALERT FOR ${recipient.toUpperCase()}!\nRahul ne Police SOS alert bheja hai!\n\n🚓 Dispatched PCR: ${cfg.responderName}\n🏢 Station: ${cfg.facilityName}\n📍 Distress Location: https://maps.google.com/?q=${cleanUserLoc}\n📞 Police Helpline: 112 / ${cfg.hotlineDisplay}\n\nTrack live on dashboard: http://localhost:3000`;
    }
    if (transitPhase === 'TO_HOSPITAL' || transitPhase === 'AT_HOSPITAL') {
      return `🏥 HOSPITAL PATIENT UPDATE FOR ${recipient.toUpperCase()}!\nRahul ko Ambulance A102 me SMS Medical College & Trauma Hospital le जाया जा raha hai.\n\n🏥 Hospital: ${destinationHospital.name}\n📍 Address: ${destinationHospital.address}\n🗺️ Hospital Google Maps: ${hospitalGoogleMapsUrl}\n👨‍⚕️ Incharge: ${destinationHospital.inchargeDoctor}\n📞 Hotline: ${destinationHospital.emergencyHotline}\n\nTrack live on dashboard: http://localhost:3000`;
    }
    return `🚨 CRITICAL EMERGENCY SOS FOR ${recipient.toUpperCase()}!\nRahul ne EmergencyConnect SOS dabaya hai!\n\n🚑 Dispatched: ${getServiceConfig(category).responderName}\n📍 GPS Location: https://maps.google.com/?q=${cleanUserLoc}\n🏥 Designated Hospital: ${destinationHospital.name}\n📞 Helpline: 108\n\nTrack live on dashboard: http://localhost:3000`;
  };

  // WhatsApp SOS prefilled link (targeted to a specific phone number or general share)
  const getWhatsappShareUrl = (targetPhone = null, customContact = null) => {
    const text = getAlertMessageText(customContact);
    if (targetPhone) {
      const clean = targetPhone.replace(/[^0-9]/g, '');
      const fullNum = clean.startsWith('91') && clean.length === 12 ? clean : (clean.length === 10 ? `91${clean}` : clean);
      return `https://api.whatsapp.com/send?phone=${fullNum}&text=${encodeURIComponent(text)}`;
    }
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  // Direct Mobile/Device SMS protocol link (opens native SMS app prefilled)
  const getSmsShareUrl = (targetPhone = null, customContact = null) => {
    const text = getAlertMessageText(customContact);
    if (targetPhone) {
      const clean = targetPhone.replace(/[^0-9]/g, '');
      const fullNum = clean.startsWith('91') && clean.length === 12 ? `+${clean}` : (clean.length === 10 ? `+91${clean}` : targetPhone);
      return `sms:${fullNum}?body=${encodeURIComponent(text)}`;
    }
    return `sms:?body=${encodeURIComponent(text)}`;
  };

  const whatsappUrl = getWhatsappShareUrl();

  // CSV Export for Admin
  const handleExportCSV = () => {
    const headers = ['Incident ID', 'Category', 'Severity', 'Status', 'Hospital', 'Response Time', 'Created At'];
    const rows = allIncidents.map(i => [i.id, i.category, i.severity, i.status, destinationHospital.name, i.responseTime || '4m 32s', i.createdAt]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `EmergencyConnect_Report_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0b1120', color: '#f8fafc', paddingBottom: '60px' }}>
      {/* 1. Header with 112 Dial & Safety Fallback */}
      <header style={{
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid #1e293b',
        padding: '12px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ef4444, #991b1b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(239, 68, 68, 0.5)'
            }}>
              <ShieldAlert size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: '900', color: '#ffffff' }}>
                EMERGENCY<span style={{ color: '#ef4444' }}>CONNECT</span>
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                Live Real-Time GPS Tracking &bull; Family Alert Active
              </div>
            </div>
          </div>

          {/* Location Mode Selector (Live Real GPS vs Jaipur Demo) */}
          <div style={{ display: 'flex', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '2px' }}>
            <button
              type="button"
              onClick={() => handleToggleLocationMode('REAL_GPS')}
              style={{
                background: locationMode === 'REAL_GPS' ? '#0284c7' : 'transparent',
                color: locationMode === 'REAL_GPS' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Crosshair size={13} /> My Live GPS
            </button>
            <button
              type="button"
              onClick={() => handleToggleLocationMode('JAIPUR_DEMO')}
              style={{
                background: locationMode === 'JAIPUR_DEMO' ? '#0284c7' : 'transparent',
                color: locationMode === 'JAIPUR_DEMO' ? '#ffffff' : '#94a3b8',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '11px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <MapPin size={13} /> Jaipur Demo
            </button>
          </div>

          {/* Right Action: Quick Demo Run & 112 Call */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleQuickDemoRun}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Sparkles size={14} color="#ef4444" />
              <span>Real-Time Demo</span>
            </button>

            <a
              href="tel:112"
              style={{
                background: '#dc2626',
                color: '#ffffff',
                borderRadius: '8px',
                padding: '7px 14px',
                fontSize: '13px',
                fontWeight: '800',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 0 12px rgba(220, 38, 38, 0.4)'
              }}
            >
              <PhoneCall size={14} />
              <span>Call 112</span>
            </a>
          </div>
        </div>

        {/* Top Clean Tab Switcher */}
        <div style={{
          maxWidth: '1280px',
          margin: '12px auto 0 auto',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px'
        }}>
          {[
            { key: 'SOS', label: 'Citizen SOS', icon: Radio, color: '#ef4444' },
            { key: 'RESPONDER', label: 'Responder (A102)', icon: Ambulance, color: '#10b981' },
            { key: 'HOSPITAL', label: 'Hospital Terminal', icon: Building2, color: '#38bdf8' },
            { key: 'ADMIN', label: 'Admin Command', icon: LayoutDashboard, color: '#f59e0b' },
            { key: 'ANALYTICS', label: 'Analytics', icon: BarChart3, color: '#a855f7' }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  background: isSelected ? tab.color : '#1e293b',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  border: `1px solid ${isSelected ? tab.color : '#334155'}`,
                  borderRadius: '8px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1200px', margin: '20px auto 0 auto', padding: '0 20px' }}>

        {/* ========================================================
            TAB 1: CITIZEN SOS & FAMILY ALERT
            ======================================================== */}
        {activeTab === 'SOS' && (
          <div>
            {/* Step 1: Initial Idle SOS Button & Live Radar Map */}
            {sosStep === 'IDLE' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', alignItems: 'start', padding: '10px 0 30px 0' }}>
                {/* Left Column: SOS Controls, Location Status, Hospital & Family Contacts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Live GPS Telemetry Status Card */}
                  <div className="glass-card" style={{ padding: '16px 20px', borderLeft: '4px solid #10b981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} className="pulse-emergency" />
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {userLocation.isRealGps ? 'REAL DEVICE GPS ACTIVE' : 'JAIPUR DEMO SECTOR ACTIVE'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={requestLiveLocation}
                        style={{
                          background: '#1e293b',
                          border: '1px solid #334155',
                          color: '#38bdf8',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Crosshair size={13} /> {gpsStatus.locating ? 'Acquiring...' : 'Locate Me Now'}
                      </button>
                    </div>

                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                      {userLocation.cityName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px', lineHeight: '1.4' }}>
                      {userAddress}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '11px', color: '#64748b' }}>
                      <span>Lat: {userLocation.latitude?.toFixed(5)}</span>
                      <span>Lon: {userLocation.longitude?.toFixed(5)}</span>
                      <span>Accuracy: &plusmn;{userLocation.accuracy}m</span>
                    </div>
                  </div>

                  {/* Main Hold-to-SOS Trigger Card */}
                  <div className="glass-card" style={{ padding: '24px 20px', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', marginBottom: '6px' }}>
                      Emergency SOS
                    </h1>

                    {/* Multi-Hazard Emergency Type Selector */}
                    <div style={{ margin: '14px auto 18px auto', maxWidth: '480px', textAlign: 'left' }}>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.05em' }}>
                        SELECT EMERGENCY TYPE (चुनें किस प्रकार की आपातकाल है)
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                        {[
                          { key: 'ACCIDENT', label: '🚑 Medical / 108', sub: 'Ambulance & Hospital', color: '#ef4444' },
                          { key: 'FIRE', label: '🔥 Fire / 101', sub: 'Ghar Me Aag • Brigade', color: '#ea580c' },
                          { key: 'POLICE', label: '🚓 Police / 112', sub: 'PCR Cheetah • Suraksha', color: '#2563eb' }
                        ].map(item => {
                          const isSelected = category === item.key || (item.key === 'ACCIDENT' && category === 'MEDICAL');
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => handleSelectCategory(item.key)}
                              style={{
                                background: isSelected ? `${item.color}25` : '#0f172a',
                                border: `2px solid ${isSelected ? item.color : '#334155'}`,
                                borderRadius: '10px',
                                padding: '10px 8px',
                                cursor: 'pointer',
                                textAlign: 'center',
                                transition: 'all 0.2s ease',
                                boxShadow: isSelected ? `0 0 14px ${item.color}40` : 'none'
                              }}
                            >
                              <div style={{ fontSize: '13px', fontWeight: '900', color: isSelected ? '#ffffff' : '#cbd5e1' }}>
                                {item.label}
                              </div>
                              <div style={{ fontSize: '10px', color: isSelected ? item.color : '#64748b', marginTop: '3px', fontWeight: '600' }}>
                                {item.sub}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <p style={{ fontSize: '13px', color: '#cbd5e1', maxWidth: '440px', margin: '0 auto 16px auto', lineHeight: '1.5' }}>
                      {category === 'FIRE'
                        ? <>Ghar me aag lagne par <strong>2 second hold karein</strong>. Fire Brigade Tender FT-09 (4,500L Water Foam) turant dispatch hogi aur ghar par aag bujhane aayegi.</>
                        : category === 'POLICE' || category === 'CRIME'
                          ? <>Distress ya suraksha khatre par <strong>2 second hold karein</strong>. Police PCR Van Cheetah-04 turant scene par dispatch hogi.</>
                          : <>Emergency me <strong>2 second hold karein</strong>. Live GPS capture hoga, nearest ALS Ambulance dispatch hogi aur family ko SMS alert jayega.</>
                      }
                    </p>

                    {/* 2-Second Hold Circular Button (Themed by category) */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <SOSButton onActivate={handleSOSHoldActivated} category={category} />
                    </div>

                    {/* 1-Click direct demo run & form link */}
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <button
                        onClick={handleQuickDemoRun}
                        className="btn-secondary"
                        style={{
                          padding: '10px 18px',
                          fontSize: '13px',
                          width: '100%',
                          justifyContent: 'center',
                          borderColor: getServiceConfig(category).color,
                          color: '#ffffff'
                        }}
                      >
                        <Sparkles size={15} color={getServiceConfig(category).color} />
                        <span>
                          {category === 'FIRE'
                            ? 'Run Real-Time Fire Brigade FT-09 Dispatch Flow'
                            : category === 'POLICE' || category === 'CRIME'
                              ? 'Run Real-Time Police PCR Cheetah-04 Flow'
                              : 'Run Real-Time SOS & Ambulance Dispatch Flow'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSosStep('REPORT')}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#94a3b8',
                          fontSize: '11px',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Want to write custom description or upload photo first? Click here
                      </button>
                    </div>
                  </div>

                  {/* Destination Facility Preview Box */}
                  <div className="glass-card" style={{ padding: '18px', borderLeft: `4px solid ${getServiceConfig(category).color}` }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        {category === 'FIRE' ? (
                          <Flame size={22} color="#ea580c" style={{ marginTop: '2px' }} />
                        ) : category === 'POLICE' || category === 'CRIME' ? (
                          <Siren size={22} color="#3b82f6" style={{ marginTop: '2px' }} />
                        ) : (
                          <Building2 size={22} color="#38bdf8" style={{ marginTop: '2px' }} />
                        )}
                        <div>
                          <span style={{ fontSize: '11px', color: getServiceConfig(category).color, fontWeight: '800', textTransform: 'uppercase' }}>
                            {category === 'FIRE' ? 'DESIGNATED FIRE STATION' : category === 'POLICE' || category === 'CRIME' ? 'DESIGNATED POLICE STATION' : 'DESIGNATED ADMISSION HOSPITAL'}
                          </span>
                          <div style={{ fontSize: '16px', fontWeight: '900', color: '#ffffff', marginTop: '2px' }}>
                            {getServiceConfig(category).facilityName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                            {getServiceConfig(category).facilityAddress}
                          </div>
                          <div style={{ fontSize: '11px', color: getServiceConfig(category).color, marginTop: '4px' }}>
                            Incharge: {getServiceConfig(category).commander} &bull; Hotline: {getServiceConfig(category).hotlineDisplay}
                          </div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '800',
                        color: getServiceConfig(category).color,
                        background: `${getServiceConfig(category).color}18`,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: `1px solid ${getServiceConfig(category).color}`,
                        whiteSpace: 'nowrap'
                      }}>
                        {category === 'FIRE' ? '4,500L Foam Ready' : category === 'POLICE' || category === 'CRIME' ? 'Cheetah-04 Ready' : '14 Beds Ready'}
                      </span>
                    </div>
                  </div>

                  {/* Saved Emergency Family Contacts Card */}
                  <div className="glass-card" style={{ padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={18} color="#ef4444" />
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff' }}>
                          Ghar Ke Emergency Contacts ({familyContacts.length})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowAddContact(!showAddContact)}
                        style={{
                          background: '#1e293b',
                          border: '1px solid #334155',
                          color: '#38bdf8',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Plus size={14} /> Add Contact
                      </button>
                    </div>

                    {showAddContact && (
                      <form onSubmit={handleAddFamilyContact} style={{ background: '#0f172a', padding: '14px', borderRadius: '8px', border: '1px solid #334155', marginBottom: '14px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                          <input
                            type="text"
                            required
                            placeholder="Name (e.g. Papa)"
                            value={newContactName}
                            onChange={(e) => setNewContactName(e.target.value)}
                            style={{ background: '#1e293b', border: '1px solid #334155', color: 'white', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }}
                          />
                          <input
                            type="tel"
                            required
                            placeholder="Phone (+91...)"
                            value={newContactPhone}
                            onChange={(e) => setNewContactPhone(e.target.value)}
                            style={{ background: '#1e293b', border: '1px solid #334155', color: 'white', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }}
                          />
                          <input
                            type="text"
                            placeholder="Relation (Father/Sister)"
                            value={newContactRelation}
                            onChange={(e) => setNewContactRelation(e.target.value)}
                            style={{ background: '#1e293b', border: '1px solid #334155', color: 'white', padding: '6px 10px', borderRadius: '6px', fontSize: '12px' }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button type="submit" className="btn-success" style={{ padding: '6px 12px', fontSize: '12px' }}>Save</button>
                          <button type="button" onClick={() => setShowAddContact(false)} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>Cancel</button>
                        </div>
                      </form>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {familyContacts.map(c => {
                        const isRahulPrimary = c.phone?.includes('9263293460') || c.isPrimary;
                        return (
                          <div
                            key={c.id}
                            style={{
                              background: isRahulPrimary ? 'rgba(16, 185, 129, 0.08)' : '#0f172a',
                              border: isRahulPrimary ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #334155',
                              borderRadius: '8px',
                              padding: '10px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              flexWrap: 'wrap',
                              gap: '8px'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontWeight: '700', color: '#ffffff', fontSize: '13px' }}>{c.name}</span>
                                <span style={{ color: '#38bdf8', fontSize: '12px' }}>({c.relation})</span>
                                {isRahulPrimary && (
                                  <span style={{ fontSize: '10px', background: '#10b981', color: '#000000', fontWeight: '800', padding: '1px 6px', borderRadius: '4px' }}>
                                    PRIMARY
                                  </span>
                                )}
                              </div>
                              <div style={{ color: isRahulPrimary ? '#34d399' : '#94a3b8', fontSize: '12px', marginTop: '2px', fontWeight: isRahulPrimary ? '700' : 'normal' }}>
                                {c.phone}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <a
                                href={getWhatsappShareUrl(c.phone, c)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Send test emergency message to this number on WhatsApp"
                                style={{
                                  background: '#25D36620',
                                  border: '1px solid #25D36660',
                                  color: '#25D366',
                                  padding: '4px 8px',
                                  borderRadius: '5px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  textDecoration: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Share2 size={11} /> WhatsApp
                              </a>
                              <a
                                href={getSmsShareUrl(c.phone, c)}
                                title="Send test emergency SMS from your device"
                                style={{
                                  background: '#3b82f620',
                                  border: '1px solid #3b82f660',
                                  color: '#38bdf8',
                                  padding: '4px 8px',
                                  borderRadius: '5px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  textDecoration: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <MessageSquare size={11} /> SMS
                              </a>
                              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', background: '#10b98115', border: '1px solid #10b98140', padding: '3px 8px', borderRadius: '4px' }}>
                                Armed
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Interactive GPS Radar Map */}
                <div className="glass-card" style={{ padding: '16px', position: 'sticky', top: '90px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Navigation size={16} color={getServiceConfig(category).color} />
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff' }}>
                        Live Emergency Sector Radar
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: getServiceConfig(category).color, fontWeight: '700', background: `${getServiceConfig(category).color}20`, border: `1px solid ${getServiceConfig(category).color}`, padding: '3px 8px', borderRadius: '5px' }}>
                      {getServiceConfig(category).responderName} Ready ({liveDistanceKm} km)
                    </span>
                  </div>

                  <LiveMap
                    userLocation={userLocation}
                    responderLocation={responderCoords}
                    hospitalLocation={hospitalCoords}
                    height="530px"
                    showRoute={true}
                    isLiveTracking={false}
                    transitPhase={transitPhase}
                    category={category}
                    customAddress={userAddress}
                  />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '11px', color: '#94a3b8', flexWrap: 'wrap', gap: '8px' }}>
                    <span>
                      {category === 'FIRE'
                        ? '📍 Red: Your House • 🚒 Orange: Fire Tender FT-09 • 🏢 Central Fire Station'
                        : category === 'POLICE' || category === 'CRIME'
                          ? '📍 Red: Distress Spot • 🚓 Blue: Police PCR Cheetah-04 • 🏢 MI Road Police Station'
                          : '📍 Red: Your Live GPS • 🚑 Green: Standby Ambulance • 🏥 Blue: SMS Hospital'}
                    </span>
                    <span style={{ color: '#38bdf8' }}>Authentic OpenStreetMap / Esri Satellite</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Emergency Description & AI Trigger */}
            {sosStep === 'REPORT' && (
              <div className="glass-card" style={{ maxWidth: '720px', margin: '20px auto', padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase' }}>
                      SOS ACTIVATED &bull; STEP 2
                    </span>
                    <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', marginTop: '2px' }}>
                      What Happened?
                    </h2>
                  </div>
                  <button
                    onClick={handleResetSOS}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                  >
                    <XCircle size={22} />
                  </button>
                </div>

                {/* Quick categories */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {['ACCIDENT', 'FIRE', 'POLICE', 'MEDICAL'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      style={{
                        background: category === cat ? `${getServiceConfig(cat).color}25` : '#0f172a',
                        border: `1px solid ${category === cat ? getServiceConfig(cat).color : '#334155'}`,
                        color: category === cat ? '#ffffff' : '#94a3b8',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {cat === 'FIRE' ? '🔥 FIRE / 101' : cat === 'POLICE' ? '🚓 POLICE / 112' : cat === 'ACCIDENT' ? '🚑 ACCIDENT / 108' : '🏥 MEDICAL / 108'}
                    </button>
                  ))}
                </div>

                {/* Textarea */}
                <div style={{ position: 'relative', marginBottom: '16px' }}>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      padding: '12px',
                      color: '#ffffff',
                      fontSize: '14px',
                      outline: 'none',
                      lineHeight: '1.5'
                    }}
                  />
                  <button
                    type="button"
                    onClick={toggleVoice}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      bottom: '12px',
                      background: isListening ? '#dc2626' : '#1e293b',
                      border: '1px solid #334155',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                    {isListening ? 'Listening...' : 'Voice'}
                  </button>
                </div>

                {/* Destination facility note */}
                <div style={{ background: '#0f172a', border: `1px solid ${getServiceConfig(category).color}50`, borderRadius: '8px', padding: '12px', marginBottom: '16px', fontSize: '12px', color: '#cbd5e1' }}>
                  <strong>Designated Unit: </strong> {getServiceConfig(category).responderName} from {getServiceConfig(category).facilityName} ({getServiceConfig(category).commander})
                </div>

                {/* Dispatch Button */}
                <button
                  type="button"
                  onClick={() => handleDispatchSOS(category)}
                  className="btn-primary"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '15px',
                    background: `linear-gradient(135deg, ${getServiceConfig(category).color}, #0f172a)`,
                    border: `1px solid ${getServiceConfig(category).color}`
                  }}
                >
                  <Send size={16} />
                  <span>ALERT FAMILY &amp; {getServiceConfig(category).actionPrompt}</span>
                </button>
              </div>
            )}

            {/* Step 3: Live Real-Time Tracking & AI Result */}
            {sosStep === 'TRACKING' && (
              <div>
                {/* Emergency Active Banner */}
                <div style={{
                  background: activeIncident?.status === 'ADMITTED' || activeIncident?.status === 'RESOLVED'
                    ? 'linear-gradient(90deg, #064e3b, #022c22)'
                    : category === 'FIRE'
                      ? 'linear-gradient(90deg, #9a3412, #431407)'
                      : (category === 'POLICE' || category === 'CRIME'
                          ? 'linear-gradient(90deg, #1e3a8a, #0f172a)'
                          : (transitPhase === 'TO_HOSPITAL'
                              ? 'linear-gradient(90deg, #0369a1, #0c4a6e)'
                              : 'linear-gradient(90deg, #7f1d1d, #450a0a)')),
                  border: `1px solid ${activeIncident?.status === 'ADMITTED' || activeIncident?.status === 'RESOLVED' ? '#10b981' : getServiceConfig(category).color}`,
                  borderRadius: '12px',
                  padding: '14px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: activeIncident?.status === 'ADMITTED' || activeIncident?.status === 'RESOLVED' ? '#10b981' : getServiceConfig(category).color
                    }} className={activeIncident?.status !== 'ADMITTED' && activeIncident?.status !== 'RESOLVED' ? 'pulse-emergency' : ''} />
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '800', color: activeIncident?.status === 'ADMITTED' || activeIncident?.status === 'RESOLVED' ? '#6ee7b7' : getServiceConfig(category).color }}>
                        {activeIncident?.status === 'ADMITTED' || activeIncident?.status === 'RESOLVED'
                          ? (category === 'FIRE' ? 'FIRE EXTINGUISHED • HOUSE SAFELY SECURED' : category === 'POLICE' || category === 'CRIME' ? 'SITUATION RESOLVED • CITIZEN PROTECTED' : 'PATIENT SAFELY ADMITTED AT HOSPITAL')
                          : category === 'FIRE'
                            ? (activeIncident?.status === 'ARRIVED' || activeIncident?.status === 'TRANSIT_HOSPITAL' ? 'FIRE BRIGADE ON SCENE • WATER FOAM MONITORS ACTIVE' : 'FIRE RESCUE ACTIVE • LIVE FIRE BRIGADE DISPATCH')
                            : category === 'POLICE' || category === 'CRIME'
                              ? (activeIncident?.status === 'ARRIVED' || activeIncident?.status === 'TRANSIT_HOSPITAL' ? 'POLICE ON SCENE • PERIMETER SECURED' : 'POLICE DISTRESS ACTIVE • LIVE PCR DISPATCH')
                              : (transitPhase === 'TO_HOSPITAL'
                                  ? 'AMBULANCE IN TRANSIT • TRANSPORTING PATIENT TO SMS HOSPITAL'
                                  : 'EMERGENCY ACTIVE • LIVE AMBULANCE DISPATCH')}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff' }}>
                        {category === 'FIRE'
                          ? `Unit: ${getServiceConfig(category).responderName}`
                          : category === 'POLICE' || category === 'CRIME'
                            ? `Unit: ${getServiceConfig(category).responderName}`
                            : (transitPhase === 'TO_HOSPITAL'
                                ? `Destination: ${destinationHospital.name}`
                                : (activeIncident?.status === 'ADMITTED' ? `Admitted: ${destinationHospital.name}` : `Incident #${activeIncident?.id?.substring(0, 10) || 'DEMO_01'}`))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <SeverityBadge severity={activeIncident?.severity || 'CRITICAL'} />
                    <button
                      type="button"
                      onClick={handleResetSOS}
                      style={{
                        background: '#1e293b',
                        color: '#cbd5e1',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <RotateCcw size={13} /> Reset
                    </button>
                  </div>
                </div>

                {/* Status Timeline (Category-specific 6 steps) */}
                <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
                  <StatusTimeline currentStatus={activeIncident?.status || 'CREATED'} category={category} />
                </div>

                {/* Map & Live Details Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  {/* REAL Map Component with Live Vehicle Follow Camera & Dynamic Markers */}
                  <div className="glass-card" style={{ padding: '14px', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Navigation size={15} color={getServiceConfig(category).color} />
                        {category === 'FIRE'
                          ? 'Live Route • Fire Station 4 to Rahul\'s House'
                          : category === 'POLICE' || category === 'CRIME'
                            ? 'Live Route • PCR Cheetah-04 to Distress Spot'
                            : (transitPhase === 'TO_HOSPITAL' ? 'Live Route to SMS Hospital' : 'Live GPS Map • Auto-Pan Camera Active')}
                      </span>
                      <span style={{ fontSize: '11px', color: getServiceConfig(category).color, fontWeight: '800' }}>
                        {category === 'FIRE'
                          ? 'Fire Engine Tracking'
                          : category === 'POLICE' || category === 'CRIME'
                            ? 'Police PCR Tracking'
                            : (transitPhase === 'TO_HOSPITAL' ? 'Hospital Transit Active' : 'Live Tracking Mode')}
                      </span>
                    </div>

                    <LiveMap
                      userLocation={userLocation}
                      responderLocation={responderCoords}
                      hospitalLocation={hospitalCoords}
                      height="440px"
                      showRoute={true}
                      isLiveTracking={true}
                      transitPhase={transitPhase}
                      category={category}
                      customAddress={userAddress}
                    />
                  </div>

                  {/* Incident, Facility & Family Alert Status */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* PROMINENT DESIGNATED FACILITY CARD */}
                    <div className="glass-card" style={{ padding: '18px', borderLeft: `4px solid ${getServiceConfig(category).color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          {category === 'FIRE' ? (
                            <Flame size={22} color="#ea580c" style={{ marginTop: '2px' }} />
                          ) : category === 'POLICE' || category === 'CRIME' ? (
                            <Siren size={22} color="#3b82f6" style={{ marginTop: '2px' }} />
                          ) : (
                            <Building2 size={22} color="#38bdf8" style={{ marginTop: '2px' }} />
                          )}
                          <div>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: getServiceConfig(category).color, textTransform: 'uppercase' }}>
                              {category === 'FIRE'
                                ? '🚒 DISPATCH FIRE STATION (HQ 4)'
                                : category === 'POLICE' || category === 'CRIME'
                                  ? '🚓 DISPATCH POLICE COMMISSIONERATE'
                                  : (transitPhase === 'TO_HOSPITAL' ? '🚨 IN TRANSIT TO HOSPITAL (ADMISSION PREPARED)' : 'DESIGNATED ADMISSION HOSPITAL')}
                            </span>
                            <div style={{ fontSize: '17px', fontWeight: '900', color: '#ffffff', marginTop: '2px' }}>
                              {getServiceConfig(category).facilityName}
                            </div>
                            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                              {getServiceConfig(category).facilityAddress}
                            </div>
                          </div>
                        </div>

                        <span style={{ fontSize: '12px', fontWeight: '800', color: getServiceConfig(category).color, background: `${getServiceConfig(category).color}20`, border: `1px solid ${getServiceConfig(category).color}`, padding: '3px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                          {category === 'FIRE' ? '4,500L Foam Ready' : category === 'POLICE' || category === 'CRIME' ? 'Cheetah-04 Ready' : 'Level 1 Trauma'}
                        </span>
                      </div>

                      <div style={{
                        marginTop: '12px',
                        background: '#0f172a',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #1e293b',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '8px',
                        fontSize: '12px'
                      }}>
                        <div>
                          <span style={{ color: '#94a3b8' }}>Incharge Officer:</span>
                          <div style={{ fontWeight: '700', color: '#f8fafc' }}>{getServiceConfig(category).commander}</div>
                        </div>
                        <div>
                          <span style={{ color: '#94a3b8' }}>Available Capacity:</span>
                          <div style={{ fontWeight: '700', color: getServiceConfig(category).color }}>{getServiceConfig(category).equipment}</div>
                        </div>
                      </div>

                      {/* Open Facility in Google Maps + Hotline Button */}
                      <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <a
                          href={facilityGoogleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary"
                          style={{
                            flex: 1,
                            textDecoration: 'none',
                            padding: '8px 12px',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            background: `linear-gradient(135deg, ${getServiceConfig(category).color}, #0f172a)`,
                            border: `1px solid ${getServiceConfig(category).color}`
                          }}
                        >
                          <MapPin size={14} />
                          <span>Open on Google Maps</span>
                        </a>
                        <a
                          href={`tel:${getServiceConfig(category).hotline}`}
                          className="btn-secondary"
                          style={{ textDecoration: 'none', padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          <PhoneCall size={14} color={getServiceConfig(category).color} />
                          <span>Call Hotline ({getServiceConfig(category).hotline})</span>
                        </a>
                      </div>
                    </div>

                    {/* GHAR PE EMERGENCY MESSAGE SENT CARD (Automatic Updates) */}
                    <div className="glass-card" style={{ padding: '18px', borderLeft: `4px solid ${getServiceConfig(category).color}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MessageSquare size={16} color={getServiceConfig(category).color} />
                          <span style={{ fontSize: '12px', fontWeight: '800', color: getServiceConfig(category).color, textTransform: 'uppercase' }}>
                            {category === 'FIRE'
                              ? 'Fire Alerts Auto-Sent to Family'
                              : category === 'POLICE' || category === 'CRIME'
                                ? 'Police Alerts Auto-Sent to Family'
                                : (transitPhase === 'TO_HOSPITAL' ? 'Hospital Location Auto-Sent to Family' : 'Ghar Pe Emergency Alerts Dispatched')}
                          </span>
                        </div>
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            background: '#059669',
                            color: '#ffffff',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Share2 size={12} /> Share Status on WhatsApp
                        </a>
                      </div>

                      {/* DEDICATED REAL ALERT DISPATCH ACTION BOX FOR BOTH 9135722473 & 9263293460 */}
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 78, 59, 0.35))',
                        border: '1px solid #10b981',
                        borderRadius: '8px',
                        padding: '14px',
                        marginBottom: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '20px' }}>⚡</span>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '900', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                AUTOMATIC EMERGENCY ALERT DISPATCHED
                                <span style={{ fontSize: '10px', background: '#10b981', color: '#000000', fontWeight: '800', padding: '1px 6px', borderRadius: '4px' }}>
                                  AUTO-SENT
                                </span>
                              </div>
                              <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>
                                Ghar ke dono primary numbers par emergency alert message automatic dispatch ho chuka hai:
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Recipient 1: 9135722473 */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid #334155', borderRadius: '6px', padding: '10px 12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                            <div>
                              <span style={{ fontWeight: '800', color: '#38bdf8', fontSize: '12px' }}>Emergency Contact (Auto-Alert): </span>
                              <span style={{ fontWeight: '800', color: '#ffffff', fontSize: '12px' }}>+91 9135722473</span>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <span style={{ fontSize: '10px', color: '#25D366', fontWeight: '800', background: 'rgba(37, 211, 102, 0.15)', border: '1px solid #25D366', padding: '2px 6px', borderRadius: '4px' }}>
                                ✓ Twilio WhatsApp Dispatched
                              </span>
                              <span style={{ fontSize: '10px', color: '#10b981', fontWeight: '800', background: '#10b98120', border: '1px solid #10b981', padding: '2px 6px', borderRadius: '4px' }}>
                                ✓ SMS Dispatched
                              </span>
                            </div>
                          </div>

                          {twilioFeedback['+91 9135722473'] && (
                            <div style={{
                              marginBottom: '8px',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '700',
                              background: twilioFeedback['+91 9135722473'].status === 'SUCCESS' ? 'rgba(37, 211, 102, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                              color: twilioFeedback['+91 9135722473'].status === 'SUCCESS' ? '#25D366' : '#ef4444'
                            }}>
                              {twilioFeedback['+91 9135722473'].status === 'SUCCESS'
                                ? `✓ Dispatched via Twilio WhatsApp Gateway (SID: ${twilioFeedback['+91 9135722473'].sid})`
                                : `⚠️ ${twilioFeedback['+91 9135722473'].error}`}
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => handleTriggerTwilioWhatsApp('+91 9135722473', 'Emergency Family')}
                              disabled={twilioSending['+91 9135722473']}
                              style={{
                                background: '#25D366',
                                color: '#000000',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '5px',
                                fontSize: '11px',
                                fontWeight: '900',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              {twilioSending['+91 9135722473'] ? (
                                <>
                                  <Loader2 size={12} className="animate-spin" /> Dispatching...
                                </>
                              ) : (
                                <>
                                  <Zap size={12} /> ⚡ Re-Send Server WhatsApp (Zero Clicks)
                                </>
                              )}
                            </button>
                            <a
                              href={getWhatsappShareUrl('+91 9135722473', { name: 'Emergency Family', relation: 'Auto-Alert' })}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                background: '#1e293b',
                                color: '#94a3b8',
                                border: '1px solid #334155',
                                padding: '6px 10px',
                                borderRadius: '5px',
                                fontSize: '11px',
                                fontWeight: '700',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <Share2 size={12} /> Open WhatsApp Web
                            </a>
                            <a
                              href={getSmsShareUrl('+91 9135722473', { name: 'Emergency Family', relation: 'Auto-Alert' })}
                              style={{
                                background: '#3b82f6',
                                color: '#ffffff',
                                padding: '6px 12px',
                                borderRadius: '5px',
                                fontSize: '11px',
                                fontWeight: '800',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <MessageSquare size={12} /> 💬 Real SMS to 9135722473
                            </a>
                          </div>
                        </div>

                        {/* Recipient 2: 9263293460 */}
                        <div style={{ background: 'rgba(15, 23, 42, 0.7)', border: '1px solid #334155', borderRadius: '6px', padding: '10px 12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                            <div>
                              <span style={{ fontWeight: '800', color: '#38bdf8', fontSize: '12px' }}>Rahul (Primary Mobile): </span>
                              <span style={{ fontWeight: '800', color: '#ffffff', fontSize: '12px' }}>+91 9263293460</span>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <span style={{ fontSize: '10px', color: '#25D366', fontWeight: '800', background: 'rgba(37, 211, 102, 0.15)', border: '1px solid #25D366', padding: '2px 6px', borderRadius: '4px' }}>
                                ✓ Twilio WhatsApp Dispatched
                              </span>
                              <span style={{ fontSize: '10px', color: '#10b981', fontWeight: '800', background: '#10b98120', border: '1px solid #10b981', padding: '2px 6px', borderRadius: '4px' }}>
                                ✓ SMS Dispatched
                              </span>
                            </div>
                          </div>

                          {twilioFeedback['+91 9263293460'] && (
                            <div style={{
                              marginBottom: '8px',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: '700',
                              background: twilioFeedback['+91 9263293460'].status === 'SUCCESS' ? 'rgba(37, 211, 102, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                              color: twilioFeedback['+91 9263293460'].status === 'SUCCESS' ? '#25D366' : '#ef4444'
                            }}>
                              {twilioFeedback['+91 9263293460'].status === 'SUCCESS'
                                ? `✓ Dispatched via Twilio WhatsApp Gateway (SID: ${twilioFeedback['+91 9263293460'].sid})`
                                : `⚠️ ${twilioFeedback['+91 9263293460'].error}`}
                            </div>
                          )}

                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => handleTriggerTwilioWhatsApp('+91 9263293460', 'Rahul (My Mobile)')}
                              disabled={twilioSending['+91 9263293460']}
                              style={{
                                background: '#25D366',
                                color: '#000000',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '5px',
                                fontSize: '11px',
                                fontWeight: '900',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              {twilioSending['+91 9263293460'] ? (
                                <>
                                  <Loader2 size={12} className="animate-spin" /> Dispatching...
                                </>
                              ) : (
                                <>
                                  <Zap size={12} /> ⚡ Re-Send Server WhatsApp (Zero Clicks)
                                </>
                              )}
                            </button>
                            <a
                              href={getWhatsappShareUrl('+91 9263293460', { name: 'Rahul (My Mobile)', relation: 'Primary' })}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                background: '#1e293b',
                                color: '#94a3b8',
                                border: '1px solid #334155',
                                padding: '6px 10px',
                                borderRadius: '5px',
                                fontSize: '11px',
                                fontWeight: '700',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <Share2 size={12} /> Open WhatsApp Web
                            </a>
                            <a
                              href={getSmsShareUrl('+91 9263293460', { name: 'Rahul (My Mobile)', relation: 'Primary' })}
                              style={{
                                background: '#3b82f6',
                                color: '#ffffff',
                                padding: '6px 12px',
                                borderRadius: '5px',
                                fontSize: '11px',
                                fontWeight: '800',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px'
                              }}
                            >
                              <MessageSquare size={12} /> 💬 Real SMS to 9263293460
                            </a>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {familyContacts.map(c => {
                          const isRahulPrimary = c.phone?.includes('9263293460') || c.isPrimary;
                          return (
                            <div
                              key={c.id}
                              style={{
                                background: isRahulPrimary ? 'rgba(16, 185, 129, 0.08)' : '#0f172a',
                                border: isRahulPrimary ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #1e293b',
                                padding: '10px 12px',
                                borderRadius: '6px'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', flexWrap: 'wrap', gap: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontWeight: '700', color: '#f8fafc' }}>
                                    {c.name} ({c.relation})
                                  </span>
                                  {isRahulPrimary && (
                                    <span style={{ fontSize: '10px', background: '#10b981', color: '#000000', fontWeight: '800', padding: '1px 6px', borderRadius: '4px' }}>
                                      PRIMARY
                                    </span>
                                  )}
                                  <span style={{ fontSize: '11px', color: isRahulPrimary ? '#34d399' : '#94a3b8' }}>
                                    {c.phone}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <a
                                    href={getWhatsappShareUrl(c.phone, c)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      background: '#25D36620',
                                      border: '1px solid #25D36660',
                                      color: '#25D366',
                                      padding: '3px 8px',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <Share2 size={11} /> WhatsApp
                                  </a>
                                  <a
                                    href={getSmsShareUrl(c.phone, c)}
                                    style={{
                                      background: '#3b82f620',
                                      border: '1px solid #3b82f660',
                                      color: '#38bdf8',
                                      padding: '3px 8px',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      fontWeight: '700',
                                      textDecoration: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}
                                  >
                                    <MessageSquare size={11} /> SMS
                                  </a>
                                  <span style={{ color: '#10b981', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                                    <Check size={13} />
                                    {category === 'FIRE'
                                      ? (activeIncident?.status === 'ADMITTED' || activeIncident?.status === 'RESOLVED' ? 'Aag Bujh Gayi' : 'Fire Brigade En Route')
                                      : category === 'POLICE' || category === 'CRIME'
                                        ? (activeIncident?.status === 'ADMITTED' || activeIncident?.status === 'RESOLVED' ? 'Situation Safe' : 'Police Dispatched')
                                        : (transitPhase === 'TO_HOSPITAL'
                                            ? 'Hospital Sent'
                                            : (activeIncident?.status === 'ADMITTED' ? 'Admitted' : 'SMS Sent'))}
                                  </span>
                                </div>
                              </div>
                              <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', background: '#090d16', padding: '6px 8px', borderRadius: '4px', border: '1px solid #1e293b' }}>
                                "{c.lastSentMsg || `EMERGENCY ALERT: Rahul activated SOS. Dispatched: ${getServiceConfig(category).responderName}. Hotline: ${getServiceConfig(category).hotlineDisplay}`}"
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Live ETA & Distance Countdown Box */}
                    <div className="glass-card" style={{ padding: '18px', borderLeft: `4px solid ${getServiceConfig(category).color}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ fontSize: '11px', fontWeight: '800', color: getServiceConfig(category).color, textTransform: 'uppercase' }}>
                            {category === 'FIRE'
                              ? (activeIncident?.status === 'ARRIVED' || activeIncident?.status === 'TRANSIT_HOSPITAL' ? 'FIREFIGHTING OPERATION ACTIVE' : (activeIncident?.status === 'ADMITTED' ? 'FIRE EXTINGUISHED' : 'LIVE DISPATCHED FIRE TENDER'))
                              : category === 'POLICE' || category === 'CRIME'
                                ? (activeIncident?.status === 'ARRIVED' || activeIncident?.status === 'TRANSIT_HOSPITAL' ? 'AREA SECURED' : (activeIncident?.status === 'ADMITTED' ? 'SITUATION NORMAL' : 'LIVE DISPATCHED PCR'))
                                : (transitPhase === 'TO_HOSPITAL' ? 'LIVE HOSPITAL TRANSIT COUNTDOWN' : (activeIncident?.status === 'ADMITTED' ? 'HOSPITAL ADMISSION COMPLETE' : 'LIVE DISPATCHED UNIT'))}
                          </span>
                          <div style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {category === 'FIRE' ? <Flame size={20} color="#ea580c" /> : category === 'POLICE' || category === 'CRIME' ? <Siren size={20} color="#3b82f6" /> : (transitPhase === 'TO_HOSPITAL' ? <Building2 size={20} color="#38bdf8" /> : <Ambulance size={20} color="#10b981" />)}
                            {getServiceConfig(category).responderName}
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                            {category === 'FIRE'
                              ? `Station Officer: ${getServiceConfig(category).driver} • 4,500L Water Foam Stream`
                              : category === 'POLICE' || category === 'CRIME'
                                ? `Head Constable: ${getServiceConfig(category).driver} • Quick Response Interceptor`
                                : (transitPhase === 'TO_HOSPITAL' ? 'Transporting Rahul to Trauma Bay 4 • Paramedic: Vikram Singh' : 'Driver: Vikram Singh • ALS Cardiac Ambulance')}
                          </div>
                        </div>

                        {/* Countdown Pill */}
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '22px', fontWeight: '900', color: getServiceConfig(category).color }}>
                            {activeIncident?.status === 'ADMITTED' || activeIncident?.status === 'RESOLVED'
                              ? 'COMPLETED'
                              : (activeIncident?.status === 'ARRIVED' || activeIncident?.status === 'TRANSIT_HOSPITAL' ? 'ON SCENE' : `${liveDistanceKm} km`)}
                          </div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#10b981' }}>
                            {activeIncident?.status === 'ADMITTED' || activeIncident?.status === 'RESOLVED'
                              ? 'Safe & Resolved'
                              : (activeIncident?.status === 'ARRIVED' || activeIncident?.status === 'TRANSIT_HOSPITAL' ? (category === 'FIRE' ? 'Extinguishing Fire' : category === 'POLICE' ? 'Securing Scene' : 'Patient Boarding') : `ETA: ~${liveEtaMin} min`)}
                          </div>
                        </div>
                      </div>

                      {/* Audited timer */}
                      {activeIncident?.responseTime && (
                        <div style={{
                          marginTop: '12px',
                          background: '#064e3b30',
                          border: '1px solid #10b981',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <span style={{ fontSize: '12px', color: '#34d399', fontWeight: '700' }}>
                            Audited Response Time:
                          </span>
                          <span style={{ fontSize: '16px', fontWeight: '900', color: '#10b981' }}>
                            {activeIncident.responseTime}
                          </span>
                        </div>
                      )}

                      <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
                        <a
                          href={`tel:${getServiceConfig(category).hotline}`}
                          className="btn-success"
                          style={{
                            flex: 1,
                            textDecoration: 'none',
                            padding: '8px',
                            fontSize: '13px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            background: getServiceConfig(category).color
                          }}
                        >
                          <PhoneCall size={14} /> Call {getServiceConfig(category).responderName} ({getServiceConfig(category).hotline})
                        </a>
                      </div>
                    </div>

                    {/* AI Classification Card */}
                    <div className="glass-card" style={{ padding: '16px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase' }}>
                        AI Triage Result (Gemini / OpenAI Engine)
                      </span>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff', marginTop: '4px' }}>
                        Severity: <span style={{ color: '#ef4444' }}>CRITICAL</span> &bull; Category: {activeIncident?.category || 'ACCIDENT'}
                      </div>
                      <p style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>
                        <strong>Clinical Reason: </strong>{activeIncident?.aiReason || 'Reported unconscious and bleeding person'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: RESPONDER TERMINAL (A102)
            ======================================================== */}
        {activeTab === 'RESPONDER' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff' }}>
                  Ambulance A102 Dispatch Terminal
                </h1>
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                  Driver: Vikram Singh &bull; Transporting to {destinationHospital.name}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setResponderOnline(!responderOnline)}
                style={{
                  background: responderOnline ? '#065f46' : '#1e293b',
                  color: responderOnline ? '#34d399' : '#94a3b8',
                  border: `1px solid ${responderOnline ? '#10b981' : '#334155'}`,
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Power size={14} />
                {responderOnline ? 'ONLINE & READY' : 'OFFLINE'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {/* Emergency Alert Card */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase' }}>
                  Active Emergency Mission
                </span>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#ffffff', marginTop: '4px' }}>
                  Road Accident (Bike Crash)
                </h3>
                <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '6px' }}>
                  "There has been a serious bike accident. One person is unconscious and another is bleeding."
                </p>

                <div style={{
                  margin: '16px 0',
                  background: '#0f172a',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '13px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Distance to Victim: <strong>1.7 km</strong></span>
                    <span>Severity: <strong style={{ color: '#ef4444' }}>CRITICAL</strong></span>
                  </div>
                  <div style={{ borderTop: '1px solid #1e293b', paddingTop: '6px', color: '#38bdf8' }}>
                    <strong>Destination Hospital: </strong> {destinationHospital.name}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => alert('Mission Accepted! On the way to Jaipur sector.')}
                    className="btn-primary"
                    style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                  >
                    Accept Case
                  </button>
                  <button
                    onClick={() => alert('Arrived on scene logged!')}
                    className="btn-secondary"
                    style={{ padding: '10px 14px', fontSize: '13px' }}
                  >
                    I've Arrived
                  </button>
                  <button
                    onClick={() => alert('Incident resolved and archived (4m 32s)!')}
                    className="btn-success"
                    style={{ padding: '10px 14px', fontSize: '13px' }}
                  >
                    Resolve
                  </button>
                </div>
              </div>

              {/* Responder Real Map */}
              <div className="glass-card" style={{ padding: '14px', overflow: 'hidden' }}>
                <LiveMap
                  userLocation={userLocation}
                  responderLocation={responderCoords}
                  hospitalLocation={hospitalCoords}
                  height="300px"
                  showRoute={true}
                  transitPhase={transitPhase}
                  customAddress={userAddress}
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: HOSPITAL TERMINAL (SMS)
            ======================================================== */}
        {activeTab === 'HOSPITAL' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff' }}>
                  {destinationHospital.name}
                </h1>
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                  {destinationHospital.traumaLevel} &bull; {destinationHospital.address}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setTraumaBayOpen(!traumaBayOpen)}
                  style={{
                    background: traumaBayOpen ? '#065f46' : '#7f1d1d',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {traumaBayOpen ? 'TRAUMA BAY OPEN' : 'AT CAPACITY'}
                </button>

                {/* Bed Counter */}
                <div style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '4px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Bed size={16} color="#38bdf8" />
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>
                    Available Beds: {availableBeds}
                  </span>
                  <button onClick={() => setAvailableBeds(Math.max(0, availableBeds - 1))} style={{ background: '#334155', border: 'none', color: 'white', width: '22px', height: '22px', borderRadius: '4px', cursor: 'pointer' }}>-</button>
                  <button onClick={() => setAvailableBeds(availableBeds + 1)} style={{ background: '#334155', border: 'none', color: 'white', width: '22px', height: '22px', borderRadius: '4px', cursor: 'pointer' }}>+</button>
                </div>
              </div>
            </div>

            {/* Inbound Emergencies */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', marginBottom: '14px' }}>
                Inbound Ambulances to {destinationHospital.name}
              </h2>

              <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '800', color: '#ffffff' }}>Ambulance A102</span>
                    <SeverityBadge severity="CRITICAL" size="sm" />
                  </div>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '4px' }}>
                    Bike collision &bull; Unconscious &amp; bleeding patient (Rahul)
                  </p>
                  <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '2px' }}>
                    ETA to Hospital: ~7 minutes &bull; Incharge: {destinationHospital.inchargeDoctor}
                  </div>
                </div>

                <button
                  onClick={() => alert(`Trauma Bay prepared at ${destinationHospital.name}! Emergency team notified.`)}
                  className="btn-success"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Prepare Trauma Bay &amp; Accept
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 4: ADMIN COMMAND CENTER
            ======================================================== */}
        {activeTab === 'ADMIN' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff' }}>
                  Admin Emergency Command Center
                </h1>
                <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                  Master Fleet &bull; Real Map Oversight &bull; Jaipur Sector
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportCSV}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                <Download size={14} /> Export CSV Report
              </button>
            </div>

            {/* 4 Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
              <MetricCard title="Active Emergencies" value={allIncidents.filter(i => !['RESOLVED', 'CANCELLED'].includes(i.status)).length} subtitle="Ongoing dispatches" icon={Activity} color="#ef4444" />
              <MetricCard title="Responders Online" value="3" subtitle="Ambulance, Police, Fire" icon={Ambulance} color="#10b981" />
              <MetricCard title="Avg. Response Time" value="4m 32s" subtitle="Target < 8 min" icon={Clock} color="#38bdf8" trend="38% faster" />
              <MetricCard title="Resolved Cases" value="24" subtitle="Safely closed today" icon={CheckCircle2} color="#a855f7" />
            </div>

            {/* Master Map */}
            <div className="glass-card" style={{ padding: '16px', marginBottom: '20px' }}>
              <LiveMap
                userLocation={userLocation}
                responderLocation={responderCoords}
                hospitalLocation={hospitalCoords}
                height="340px"
                showRoute={true}
              />
            </div>

            {/* Incidents Table */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', marginBottom: '12px' }}>
                Recent Incidents Register
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>ID</th>
                      <th style={{ padding: '8px' }}>Category</th>
                      <th style={{ padding: '8px' }}>Severity</th>
                      <th style={{ padding: '8px' }}>Hospital</th>
                      <th style={{ padding: '8px' }}>Status</th>
                      <th style={{ padding: '8px' }}>Response Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allIncidents.map(i => (
                      <tr key={i.id} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '10px 8px', fontWeight: '700', color: '#ffffff' }}>#{i.id.substring(0, 8)}</td>
                        <td style={{ padding: '10px 8px' }}>{i.category}</td>
                        <td style={{ padding: '10px 8px' }}><SeverityBadge severity={i.severity} size="sm" /></td>
                        <td style={{ padding: '10px 8px', color: '#38bdf8' }}>{destinationHospital.name}</td>
                        <td style={{ padding: '10px 8px', color: '#10b981' }}>{i.status}</td>
                        <td style={{ padding: '10px 8px', color: '#10b981', fontWeight: '700' }}>{i.responseTime || '4m 32s'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 5: PUBLIC ANALYTICS
            ======================================================== */}
        {activeTab === 'ANALYTICS' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#ffffff' }}>
                Public Emergency Analytics
              </h1>
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                Privacy-preserving aggregate metrics. Personal names and exact home addresses are never exposed.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              <MetricCard title="Average Response Time" value="4m 32s" subtitle="SOS to arrival" icon={Clock} color="#ef4444" />
              <MetricCard title="Incidents Resolved" value="142" subtitle="This month" icon={CheckCircle2} color="#10b981" />
              <MetricCard title="Average Dispatch Time" value="31s" subtitle="AI triage speed" icon={Activity} color="#38bdf8" />
              <MetricCard title="Acceptance Rate" value="96.4%" subtitle="Fleet readiness" icon={HeartPulse} color="#f59e0b" />
            </div>

            {/* Category Bars */}
            <div className="glass-card" style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', marginBottom: '16px' }}>
                Emergency Category Distribution
              </h3>
              {[
                { label: 'Road Accidents', pct: 42, color: '#ef4444' },
                { label: 'Acute Medical', pct: 28, color: '#38bdf8' },
                { label: 'Fire & Hazards', pct: 14, color: '#f59e0b' },
                { label: 'Public Safety', pct: 11, color: '#a855f7' },
                { label: 'Other', pct: 5, color: '#10b981' }
              ].map(c => (
                <div key={c.label} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#f8fafc', fontWeight: '600' }}>{c.label}</span>
                    <span style={{ color: '#94a3b8' }}>{c.pct}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${c.pct}%`, height: '100%', background: c.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
