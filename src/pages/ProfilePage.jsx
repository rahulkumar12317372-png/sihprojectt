import React from 'react';
import { User, Phone, Mail, MapPin, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SafetyNotice from '../components/SafetyNotice';

export default function ProfilePage() {
  const { currentUser } = useAuth();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 20px 100px 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff' }}>
          User Profile &amp; Emergency Telemetry
        </h1>
        <p style={{ fontSize: '14px', color: '#94a3b8' }}>
          Identity and clinical emergency contact credentials
        </p>
      </div>

      <SafetyNotice />

      <div className="glass-card" style={{ padding: '32px', marginTop: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef4444, #991b1b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)'
          }}>
            <User size={36} color="#ffffff" />
          </div>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff' }}>
              {currentUser?.name || 'Rahul Sharma'}
            </h2>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#0f172a',
              color: '#38bdf8',
              border: '1px solid #334155',
              padding: '2px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '700',
              marginTop: '4px'
            }}>
              Role: {currentUser?.role || 'USER'}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
          <div style={{ background: '#0f172a', padding: '16px', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} color="#38bdf8" /> Email
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', marginTop: '4px' }}>
              {currentUser?.email || 'rahul@example.com'}
            </div>
          </div>

          <div style={{ background: '#0f172a', padding: '16px', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={14} color="#10b981" /> Emergency Phone
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', marginTop: '4px' }}>
              {currentUser?.phone || '+91 98765 43210'}
            </div>
          </div>

          <div style={{ background: '#0f172a', padding: '16px', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} color="#ef4444" /> Sector / City
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', marginTop: '4px' }}>
              Jaipur, Rajasthan (26.9124, 75.7873)
            </div>
          </div>

          <div style={{ background: '#0f172a', padding: '16px', borderRadius: '10px', border: '1px solid #334155' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} color="#f59e0b" /> Medical Readiness
            </div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={15} /> Blood Group: O+ &bull; No Allergies
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
