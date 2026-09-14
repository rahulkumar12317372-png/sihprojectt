import React from 'react';
import { AlertTriangle, PhoneCall, ShieldAlert } from 'lucide-react';

export default function SafetyNotice({ compact = false }) {
  if (compact) {
    return (
      <div style={{
        background: 'linear-gradient(90deg, #7f1d1d, #991b1b)',
        color: '#fef2f2',
        padding: '6px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '13px',
        fontWeight: '500'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={16} color="#fca5a5" />
          <span>PROTOTYPE ONLY &bull; For immediate danger, call <strong>112</strong></span>
        </div>
        <a
          href="tel:112"
          style={{
            background: '#ffffff',
            color: '#dc2626',
            padding: '3px 10px',
            borderRadius: '20px',
            fontWeight: '700',
            textDecoration: 'none',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <PhoneCall size={12} /> Call 112
        </a>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(153, 27, 27, 0.2)',
      border: '1px solid rgba(239, 68, 68, 0.4)',
      borderRadius: '12px',
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      margin: '16px 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: 'rgba(239, 68, 68, 0.2)',
          padding: '10px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AlertTriangle size={22} color="#ef4444" />
        </div>
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fca5a5' }}>
            Emergency Coordination Prototype
          </h4>
          <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '2px' }}>
            EmergencyConnect is a coordination prototype. In case of active fire, severe crime, or immediate life hazard, call the official national emergency number <strong>112</strong>.
          </p>
        </div>
      </div>
      <a
        href="tel:112"
        className="btn-primary"
        style={{
          padding: '8px 16px',
          fontSize: '14px',
          whiteSpace: 'nowrap',
          textDecoration: 'none'
        }}
      >
        <PhoneCall size={16} /> Call 112
      </a>
    </div>
  );
}
