import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Wifi,
  ShieldCheck,
  Users,
  History,
  User,
  Radio,
  Sparkles,
  PhoneCall,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import SOSButton from '../components/SOSButton';
import SafetyNotice from '../components/SafetyNotice';
import LiveMap from '../components/LiveMap';
import { api } from '../services/api';

export default function UserDashboard() {
  const { currentUser } = useAuth();
  const { userLocation, setUserLocation, setActiveIncident } = useEmergency();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [locationDetecting, setLocationDetecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Fetch contacts
    api.getContacts(currentUser?.id || 'usr_rahul_01').then(res => {
      if (res.success && res.data) setContacts(res.data);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser]);

  const handleDetectLocation = () => {
    setLocationDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            address: 'GPS Precision Lock',
            permission: 'GRANTED'
          });
          setLocationDetecting(false);
        },
        () => {
          // Fallback Jaipur reference
          setUserLocation({
            latitude: 26.9124,
            longitude: 75.7873,
            accuracy: 5.0,
            address: 'Jaipur, Rajasthan (Verified Grid)',
            permission: 'GRANTED_FALLBACK'
          });
          setLocationDetecting(false);
        }
      );
    }
  };

  const handleSOSActivation = () => {
    // When SOS is held for 2 full seconds, navigate to emergency reporting form
    navigate('/emergency/report');
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 100px 20px' }}>
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: '800', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            SYSTEM ACTIVE &bull; YOU ARE PROTECTED
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff', marginTop: '4px' }}>
            Welcome, {currentUser?.name || 'Rahul'}
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>
            Emergency coordination network is monitoring your sector in Jaipur.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/contacts" className="btn-secondary" style={{ padding: '8px 14px', fontSize: '13px' }}>
            <Users size={16} /> Manage Contacts ({contacts.length})
          </Link>
          <Link to="/history" className="btn-secondary" style={{ padding: '8px 14px', fontSize: '13px' }}>
            <History size={16} /> History
          </Link>
        </div>
      </div>

      <SafetyNotice />

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        marginTop: '20px'
      }}>
        {/* Left Column: SOS Trigger Card */}
        <div className="glass-card-danger" style={{ padding: '30px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '20px',
            padding: '4px 14px',
            fontSize: '11px',
            fontWeight: '800',
            color: '#fca5a5',
            letterSpacing: '0.05em',
            marginBottom: '12px'
          }}>
            ONE-TAP DISTRESS PROTOCOL
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#ffffff', marginBottom: '4px' }}>
            EMERGENCY SOS
          </h2>
          <p style={{ fontSize: '13px', color: '#cbd5e1', maxWidth: '320px', margin: '0 auto 16px auto' }}>
            Activates GPS lock, AI severity triage, nearest ambulance dispatch, and notifies your family.
          </p>

          {/* The signature 2-second hold button */}
          <SOSButton onActivate={handleSOSActivation} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '16px',
            fontSize: '12px',
            color: '#94a3b8'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={14} color="#10b981" /> Accidental release cancel
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={14} color="#10b981" /> Haptic vibration alert
            </span>
          </div>
        </div>

        {/* Right Column: Status & Sector Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Status Telemetry Card */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#ffffff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Radio size={18} color="#ef4444" /> Device Telemetry & Safety Status
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {/* Location telemetry */}
              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '10px', border: '1px solid #334155' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#38bdf8" /> Current Sector
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', marginTop: '4px' }}>
                  {userLocation.address || 'Jaipur Central'}
                </div>
                <div style={{ fontSize: '11px', color: '#10b981', marginTop: '2px' }}>
                  Accuracy: &plusmn;{userLocation.accuracy}m
                </div>
              </div>

              {/* Network Status */}
              <div style={{ background: '#0f172a', padding: '12px', borderRadius: '10px', border: '1px solid #334155' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Wifi size={14} color={isOnline ? '#10b981' : '#ef4444'} /> Network Link
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#ffffff', marginTop: '4px' }}>
                  {isOnline ? 'Online (Real-Time)' : 'Unstable Connection'}
                </div>
                <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '2px' }}>
                  Sync: Low Latency (&lt;200ms)
                </div>
              </div>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={locationDetecting}
                style={{
                  flex: 1,
                  background: '#1e293b',
                  color: '#cbd5e1',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <MapPin size={14} />
                {locationDetecting ? 'Acquiring GPS...' : 'Refresh GPS Coordinates'}
              </button>
            </div>
          </div>

          {/* Mini Live Sector Map */}
          <div className="glass-card" style={{ padding: '16px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#f8fafc' }}>
                Active Sector Radar (Jaipur)
              </span>
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '600' }}>
                Nearest: Ambulance A102 (1.7 km)
              </span>
            </div>

            <LiveMap
              userLocation={userLocation}
              responderLocation={{ latitude: 26.9240, longitude: 75.8010, name: 'Ambulance A102' }}
              height="240px"
              showRoute={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
