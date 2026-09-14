import React, { useState, useEffect } from 'react';
import {
  Ambulance,
  Radio,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Navigation,
  PhoneCall,
  Power,
  AlertTriangle,
  Flame,
  ShieldAlert,
  CheckSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import SeverityBadge from '../components/SeverityBadge';
import LiveMap from '../components/LiveMap';
import SafetyNotice from '../components/SafetyNotice';
import { api } from '../services/api';

export default function ResponderDashboard() {
  const { currentUser } = useAuth();
  const { liveLocations } = useEmergency();

  const [isOnline, setIsOnline] = useState(true);
  const [incidents, setIncidents] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [responderLocation, setResponderLocation] = useState({
    latitude: 26.9240,
    longitude: 75.8010,
    name: 'Ambulance A102'
  });

  const fetchIncidents = async () => {
    try {
      const res = await api.getAllIncidents();
      if (res.success && res.data) {
        setIncidents(res.data);
        // Check if responder has an active accepted job
        const job = res.data.find(i =>
          i.responderId === 'resp_a102' && !['RESOLVED', 'CANCELLED'].includes(i.status)
        );
        setActiveJob(job || null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptIncident = async (incidentId) => {
    try {
      await api.acceptIncident('resp_a102', incidentId);
      // Move to ON_THE_WAY shortly
      setTimeout(async () => {
        await api.updateIncident(incidentId, { status: 'ON_THE_WAY' });
        fetchIncidents();
      }, 1000);
      fetchIncidents();
    } catch (e) {
      console.error(e);
    }
  };

  const handleArrived = async () => {
    if (!activeJob) return;
    try {
      await api.updateIncident(activeJob.id, {
        status: 'ARRIVED',
        arrivedAt: new Date().toISOString()
      });
      fetchIncidents();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolve = async () => {
    if (!activeJob) return;
    try {
      await api.resolveIncident(activeJob.id);
      setActiveJob(null);
      fetchIncidents();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 100px 20px' }}>
      {/* Top Status Header */}
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
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Ambulance size={26} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff' }}>
              Unit A102 Dispatch Terminal
            </h1>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              Driver: Vikram Singh &bull; ALS Ambulance &bull; Jaipur North Sector
            </div>
          </div>
        </div>

        {/* Online / Offline Toggle */}
        <button
          type="button"
          onClick={() => setIsOnline(!isOnline)}
          style={{
            background: isOnline ? '#065f46' : '#1e293b',
            color: isOnline ? '#34d399' : '#94a3b8',
            border: `1px solid ${isOnline ? '#10b981' : '#334155'}`,
            borderRadius: '10px',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s ease'
          }}
        >
          <Power size={16} />
          {isOnline ? 'ONLINE & DISPATCHABLE' : 'OFFLINE'}
        </button>
      </div>

      <SafetyNotice />

      {/* Active En-Route Job View (If Responder has accepted an emergency) */}
      {activeJob && (
        <div className="glass-card-danger" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase' }}>
                CURRENT ACTIVE MISSION
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', marginTop: '2px' }}>
                Incident #{activeJob.id?.substring(0, 10)} &bull; {activeJob.category}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <SeverityBadge severity={activeJob.severity} />
              <span style={{
                background: '#1e293b',
                color: '#38bdf8',
                border: '1px solid #334155',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                Status: {activeJob.status}
              </span>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ background: '#0f172a', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Victim Report:</div>
              <div style={{ fontSize: '14px', color: '#f8fafc', fontWeight: '600', marginTop: '4px' }}>
                "{activeJob.description || 'Distress signal'}"
              </div>
              <div style={{ fontSize: '12px', color: '#ef4444', marginTop: '6px' }}>
                <strong>AI Alert: </strong>{activeJob.aiReason}
              </div>
            </div>

            <div style={{ background: '#0f172a', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Target Coordinates & ETA:</div>
              <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '700', marginTop: '4px' }}>
                Jaipur Sector (26.9124, 75.7873) &bull; 1.7 km (~5 min)
              </div>
              <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                <a
                  href="tel:+919876543210"
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px', textDecoration: 'none' }}
                >
                  <PhoneCall size={13} /> Call Victim (Rahul)
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Map */}
          <div style={{ borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }}>
            <LiveMap
              userLocation={{ latitude: activeJob.latitude, longitude: activeJob.longitude }}
              responderLocation={responderLocation}
              incident={activeJob}
              height="300px"
              showRoute={true}
            />
          </div>

          {/* Action buttons: I'm Arrived and Resolve */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {activeJob.status !== 'ARRIVED' && (
              <button
                type="button"
                onClick={handleArrived}
                className="btn-primary"
                style={{ padding: '12px 24px', fontSize: '14px', background: 'linear-gradient(135deg, #0284c7, #0369a1)' }}
              >
                <MapPin size={18} />
                <span>I'VE ARRIVED ON SCENE</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResolve}
              className="btn-success"
              style={{ padding: '12px 24px', fontSize: '14px' }}
            >
              <CheckSquare size={18} />
              <span>RESOLVE INCIDENT (LOG REPORT)</span>
            </button>
          </div>
        </div>
      )}

      {/* Available Emergency Dispatches Queue */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
              Pending Sector Emergencies
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>
              Incoming distress alerts within 5km radius
            </p>
          </div>
          <span style={{
            background: '#1e293b',
            color: '#cbd5e1',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            {incidents.filter(i => !['RESOLVED', 'CANCELLED'].includes(i.status)).length} Active Cases
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {incidents
            .filter(i => !['RESOLVED', 'CANCELLED'].includes(i.status))
            .map(inc => (
              <div
                key={inc.id}
                style={{
                  background: '#0f172a',
                  border: inc.severity === 'CRITICAL' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid #334155',
                  borderRadius: '12px',
                  padding: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>
                      #{inc.id?.substring(0, 10)}
                    </span>
                    <SeverityBadge severity={inc.severity} size="sm" />
                    <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '600' }}>
                      {inc.category}
                    </span>
                  </div>

                  <p style={{ fontSize: '14px', color: '#cbd5e1', maxWidth: '600px', lineHeight: '1.4' }}>
                    {inc.description}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    fontSize: '12px',
                    color: '#94a3b8',
                    marginTop: '8px'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="#ef4444" /> 1.7 km away (Jaipur MI Road)
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} color="#38bdf8" /> ETA: ~5 min
                    </span>
                    <span>Status: {inc.status}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {inc.responderId !== 'resp_a102' ? (
                    <button
                      type="button"
                      onClick={() => handleAcceptIncident(inc.id)}
                      className="btn-primary"
                      style={{ padding: '8px 18px', fontSize: '13px' }}
                    >
                      <CheckCircle size={15} /> ACCEPT CASE
                    </button>
                  ) : (
                    <span style={{ color: '#10b981', fontWeight: '700', fontSize: '13px' }}>
                      &check; ASSIGNED TO YOU
                    </span>
                  )}
                </div>
              </div>
            ))}

          {incidents.filter(i => !['RESOLVED', 'CANCELLED'].includes(i.status)).length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              No pending distress calls in this sector. Standby active.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
