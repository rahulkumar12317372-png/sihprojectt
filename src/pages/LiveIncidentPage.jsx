import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  PhoneCall,
  Share2,
  XCircle,
  Navigation,
  Clock,
  MapPin,
  CheckCircle2,
  Ambulance,
  Building2,
  Sparkles
} from 'lucide-react';
import { useEmergency } from '../context/EmergencyContext';
import SafetyNotice from '../components/SafetyNotice';
import StatusTimeline from '../components/StatusTimeline';
import SeverityBadge from '../components/SeverityBadge';
import LiveMap from '../components/LiveMap';
import { api } from '../services/api';

export default function LiveIncidentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeIncident, setActiveIncident, refreshActiveIncident, liveLocations } = useEmergency();

  const [incidentData, setIncidentData] = useState(activeIncident);
  const [responderCoords, setResponderCoords] = useState({
    latitude: 26.9240,
    longitude: 75.8010,
    name: 'Ambulance A102'
  });
  const [shareCopied, setShareCopied] = useState(false);

  // Poll or sync incident data
  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const res = await api.getIncident(id);
        if (res.success && res.data) {
          setIncidentData(res.data);
          setActiveIncident(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchIncident();
    const interval = setInterval(fetchIncident, 2000);
    return () => clearInterval(interval);
  }, [id]);

  // Sync moving responder coordinates from Realtime Database stream
  useEffect(() => {
    const a102Location = liveLocations.find(l => l.responderId === 'A102' || l.responderId === 'resp_a102');
    if (a102Location) {
      setResponderCoords({
        latitude: a102Location.latitude,
        longitude: a102Location.longitude,
        name: 'Ambulance A102'
      });
    }
  }, [liveLocations]);

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this emergency call?')) {
      await api.cancelIncident(id, 'User cancelled');
      navigate('/dashboard');
    }
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  };

  const currentStatus = incidentData?.status || 'CREATED';
  const isResolved = currentStatus === 'RESOLVED';

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 20px 100px 20px' }}>
      {/* Emergency Active Header */}
      <div style={{
        background: isResolved
          ? 'linear-gradient(90deg, #064e3b, #022c22)'
          : 'linear-gradient(90deg, #7f1d1d, #450a0a)',
        border: `1px solid ${isResolved ? '#10b981' : '#ef4444'}`,
        borderRadius: '14px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px',
        boxShadow: isResolved ? '0 0 20px rgba(16, 185, 129, 0.3)' : '0 0 25px rgba(239, 68, 68, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: isResolved ? '#10b981' : '#ef4444'
          }} className={!isResolved ? 'pulse-emergency' : ''} />
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', color: isResolved ? '#6ee7b7' : '#fca5a5', letterSpacing: '0.08em' }}>
              {isResolved ? 'INCIDENT COMPLETED & LOGGED' : 'LIVE EMERGENCY ACTIVE &bull; BROADCASTING GPS'}
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', marginTop: '2px' }}>
              Incident #{id?.substring(0, 12)}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SeverityBadge severity={incidentData?.severity || 'CRITICAL'} />
          <a
            href="tel:112"
            style={{
              background: '#ffffff',
              color: '#dc2626',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: '800',
              fontSize: '13px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <PhoneCall size={14} /> Call 112
          </a>
        </div>
      </div>

      <SafetyNotice compact />

      {/* Real-time Status Progress Timeline */}
      <div className="glass-card" style={{ padding: '20px', margin: '16px 0' }}>
        <StatusTimeline currentStatus={currentStatus} />
      </div>

      {/* Main Map & Telemetry Panel */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '20px'
      }}>
        {/* Live Interactive Map */}
        <div className="glass-card" style={{ padding: '16px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={18} color="#10b981" />
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#f8fafc' }}>
                Live GPS Vector (Jaipur Sector)
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '700' }}>
              Ambulance A102 moving in real time
            </div>
          </div>

          <LiveMap
            userLocation={{ latitude: incidentData?.latitude || 26.9124, longitude: incidentData?.longitude || 75.7873 }}
            responderLocation={responderCoords}
            incident={incidentData}
            height="440px"
            showRoute={true}
          />
        </div>

        {/* Bottom Detailed Coordination Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ background: '#0f172a', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>
                Emergency Type
              </span>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', marginTop: '4px' }}>
                {incidentData?.category || 'Road Accident'}
              </div>
            </div>

            <div style={{ background: '#0f172a', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>
                Assigned Unit
              </span>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Ambulance size={18} /> Ambulance A102
              </div>
            </div>

            <div style={{ background: '#0f172a', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>
                Distance &bull; ETA
              </span>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#38bdf8', marginTop: '4px' }}>
                {isResolved ? 'Arrived' : '1.7 km &bull; ~5 min'}
              </div>
            </div>

            <div style={{ background: '#0f172a', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>
                Current Status
              </span>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#f59e0b', marginTop: '4px' }}>
                {incidentData?.status?.replace(/_/g, ' ') || 'SEARCHING'}
              </div>
            </div>
          </div>

          {/* AI Reasoning Summary */}
          {incidentData?.aiReason && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '13px',
              color: '#cbd5e1',
              marginBottom: '20px'
            }}>
              <span style={{ color: '#ef4444', fontWeight: '700' }}>AI Clinical Reason: </span>
              {incidentData.aiReason} (Confidence: {incidentData.confidence ? Math.round(incidentData.confidence * 100) : 94}%)
            </div>
          )}

          {/* Action Buttons Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href="tel:+919829011102"
                className="btn-success"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
              >
                <PhoneCall size={16} /> Call Responder (Vikram Singh)
              </a>

              <button
                type="button"
                onClick={handleShare}
                className="btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Share2 size={16} /> {shareCopied ? 'Link Copied!' : 'Share Live Tracking'}
              </button>
            </div>

            {!isResolved && (
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  background: 'transparent',
                  color: '#ef4444',
                  border: '1px solid #7f1d1d',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <XCircle size={16} /> Cancel Emergency
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
