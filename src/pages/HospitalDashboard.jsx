import React, { useState, useEffect } from 'react';
import {
  Building2,
  Bed,
  HeartPulse,
  Clock,
  MapPin,
  CheckCircle,
  AlertTriangle,
  PhoneCall,
  Activity,
  Ambulance
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SeverityBadge from '../components/SeverityBadge';
import LiveMap from '../components/LiveMap';
import SafetyNotice from '../components/SafetyNotice';
import { api } from '../services/api';

export default function HospitalDashboard() {
  const { currentUser } = useAuth();
  const [bedsAvailable, setBedsAvailable] = useState(14);
  const [emergencyReady, setEmergencyReady] = useState(true);
  const [incomingIncidents, setIncomingIncidents] = useState([]);
  const [acceptedCases, setAcceptedCases] = useState({});

  const hospitalCoords = {
    latitude: 26.8928,
    longitude: 75.8118,
    hospitalName: 'SMS Trauma Center'
  };

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await api.getAllIncidents();
        if (res.success && res.data) {
          // Show active emergencies
          setIncomingIncidents(res.data.filter(i => !['RESOLVED', 'CANCELLED'].includes(i.status)));
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCases();
    const interval = setInterval(fetchCases, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleEmergency = async () => {
    const nextState = !emergencyReady;
    setEmergencyReady(nextState);
    await api.updateHospitalStatus('hosp_sms_01', { emergencyAvailable: nextState });
  };

  const handleUpdateBeds = async (delta) => {
    const nextBeds = Math.max(0, bedsAvailable + delta);
    setBedsAvailable(nextBeds);
    await api.updateHospitalStatus('hosp_sms_01', { availableBeds: nextBeds });
  };

  const handleAcceptCase = (id) => {
    setAcceptedCases(prev => ({ ...prev, [id]: true }));
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 100px 20px' }}>
      {/* Hospital Command Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0284c7, #0369a1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Building2 size={26} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff' }}>
              SMS Medical College &amp; Trauma Center
            </h1>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              Emergency Trauma Bay &bull; Level 1 Trauma Facility &bull; Jaipur
            </div>
          </div>
        </div>

        {/* Readiness Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleToggleEmergency}
            style={{
              background: emergencyReady ? '#065f46' : '#7f1d1d',
              color: '#ffffff',
              border: `1px solid ${emergencyReady ? '#10b981' : '#ef4444'}`,
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <HeartPulse size={16} />
            {emergencyReady ? 'TRAUMA BAY OPEN' : 'TRAUMA BAY AT CAPACITY'}
          </button>

          {/* Bed counter */}
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
              Beds: {bedsAvailable}
            </span>
            <button
              onClick={() => handleUpdateBeds(-1)}
              style={{ background: '#334155', border: 'none', color: 'white', width: '22px', height: '22px', borderRadius: '4px', cursor: 'pointer' }}
            >-</button>
            <button
              onClick={() => handleUpdateBeds(1)}
              style={{ background: '#334155', border: 'none', color: 'white', width: '22px', height: '22px', borderRadius: '4px', cursor: 'pointer' }}
            >+</button>
          </div>
        </div>
      </div>

      <SafetyNotice />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginTop: '20px' }}>
        {/* Incoming Emergency Cases Queue */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="#ef4444" /> Incoming En-Route Emergencies
            </h2>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
              {incomingIncidents.length} Expected Admissions
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {incomingIncidents.map(inc => {
              const isAccepted = acceptedCases[inc.id];
              return (
                <div
                  key={inc.id}
                  style={{
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    padding: '16px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>
                        #{inc.id?.substring(0, 10)}
                      </span>
                      <SeverityBadge severity={inc.severity} size="sm" />
                    </div>
                    <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '700' }}>
                      ETA: ~5 min
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '8px' }}>
                    <strong>Clinical Report: </strong>{inc.description}
                  </p>

                  <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
                    Transport: Ambulance A102 &bull; Required: ICU / Emergency Surgery
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {isAccepted ? (
                      <span style={{
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                        border: '1px solid #10b981',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <CheckCircle size={14} /> TRAUMA BAY PREPARED
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAcceptCase(inc.id)}
                        className="btn-success"
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                      >
                        PREPARE TRAUMA TEAM &amp; ACCEPT
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {incomingIncidents.length === 0 && (
              <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                No active inbound emergency transports at this moment.
              </div>
            )}
          </div>
        </div>

        {/* Hospital Sector Map */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>
              Hospital Inbound Radar
            </span>
            <span style={{ fontSize: '12px', color: '#10b981' }}>
              Trauma Bay Active
            </span>
          </div>

          <LiveMap
            userLocation={{ latitude: 26.9124, longitude: 75.7873 }}
            responderLocation={{ latitude: 26.9240, longitude: 75.8010, name: 'Ambulance A102' }}
            hospitals={[hospitalCoords]}
            height="360px"
            showRoute={true}
          />
        </div>
      </div>
    </div>
  );
}
