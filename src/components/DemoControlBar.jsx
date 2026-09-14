import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, RotateCcw, User, Ambulance, Building2, Shield, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';

export default function DemoControlBar() {
  const { currentUser, switchRole } = useAuth();
  const { runFullDemoSimulation, resetIncident, isSimulatingDemo, demoStep } = useEmergency();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const roles = [
    { key: 'USER', label: 'Rahul (User)', icon: User, color: '#38bdf8' },
    { key: 'RESPONDER', label: 'A102 (Ambulance)', icon: Ambulance, color: '#10b981' },
    { key: 'HOSPITAL', label: 'SMS Hospital', icon: Building2, color: '#a855f7' },
    { key: 'ADMIN', label: 'Command Center', icon: Shield, color: '#f59e0b' }
  ];

  const handleRunDemo = () => {
    switchRole('USER');
    runFullDemoSimulation(navigate);
  };

  const getStepText = () => {
    switch (demoStep) {
      case 1: return 'Step 1: SOS Distress Activated (Jaipur Grid)';
      case 2: return 'Step 2: AI Triage Analyzing (CRITICAL / ACCIDENT)';
      case 3: return 'Step 3: Calculating Nearest Responder (Haversine)';
      case 4: return 'Step 4: Ambulance A102 Dispatched (1.7 km, 5 min ETA)';
      case 5: return 'Step 5: Live GPS Route Tracking Active';
      case 6: return 'Step 6: Responder Arrived on Scene';
      case 7: return 'Step 7: Incident Resolved & Analytics Updated (4m 32s)';
      default: return 'Ready to run Jaipur Road Accident Demo Flow';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '94%',
      maxWidth: '960px',
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(16px)',
      border: '1px solid #334155',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(239, 68, 68, 0.2)',
      padding: collapsed ? '10px 18px' : '14px 20px',
      zIndex: 2000,
      transition: 'all 0.3s ease'
    }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer'
      }} onClick={() => setCollapsed(!collapsed)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: '800',
            padding: '3px 8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Sparkles size={13} /> DEMO CONTROLLER
          </span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: isSimulatingDemo ? '#fca5a5' : '#cbd5e1' }}>
            {getStepText()}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {collapsed ? <ChevronUp size={18} color="#94a3b8" /> : <ChevronDown size={18} color="#94a3b8" />}
        </div>
      </div>

      {/* Expanded Controls */}
      {!collapsed && (
        <div style={{ marginTop: '12px', borderTop: '1px solid #334155', paddingTop: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {/* 1-Click Role Switcher */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                Role:
              </span>
              {roles.map(r => {
                const isSelected = currentUser?.role === r.key;
                const Icon = r.icon;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => {
                      switchRole(r.key);
                      if (r.key === 'USER') navigate('/dashboard');
                      else if (r.key === 'RESPONDER') navigate('/responder/dashboard');
                      else if (r.key === 'HOSPITAL') navigate('/hospital/dashboard');
                      else if (r.key === 'ADMIN') navigate('/admin/dashboard');
                    }}
                    style={{
                      background: isSelected ? r.color : '#1e293b',
                      color: isSelected ? '#0b1120' : '#e2e8f0',
                      border: `1px solid ${isSelected ? r.color : '#334155'}`,
                      borderRadius: '8px',
                      padding: '6px 10px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={14} />
                    {r.label}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleRunDemo}
                disabled={isSimulatingDemo}
                style={{
                  background: isSimulatingDemo
                    ? '#475569'
                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: isSimulatingDemo ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                }}
              >
                <Play size={15} />
                {isSimulatingDemo ? 'Simulating Jaipur Flow...' : 'Run Jaipur SOS Scenario'}
              </button>

              <button
                type="button"
                onClick={resetIncident}
                style={{
                  background: '#1e293b',
                  color: '#cbd5e1',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
                title="Reset simulation state"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
