import React from 'react';
import { CheckCircle2, Radio, UserCheck, Navigation, MapPin, Building2, Flame, Shield, ShieldCheck, CheckSquare, Waves } from 'lucide-react';

export default function StatusTimeline({ currentStatus = 'CREATED', category = 'ACCIDENT' }) {
  const isFire = category === 'FIRE';
  const isPolice = category === 'POLICE' || category === 'CRIME';

  const steps = isFire ? [
    { key: 'CREATED', label: '1. FIRE SOS TRIGGERED', icon: Flame },
    { key: 'RESPONDER_ACCEPTED', label: '2. TENDER FT-09 DISPATCHED', icon: UserCheck },
    { key: 'ON_THE_WAY', label: '3. EN ROUTE TO HOUSE', icon: Navigation },
    { key: 'ARRIVED', label: '4. ARRIVED AT HOUSE', icon: MapPin },
    { key: 'TRANSIT_HOSPITAL', label: '5. HOSE LINES ACTIVE', icon: Waves },
    { key: 'ADMITTED', label: '6. FIRE EXTINGUISHED', icon: ShieldCheck }
  ] : isPolice ? [
    { key: 'CREATED', label: '1. POLICE SOS TRIGGERED', icon: Radio },
    { key: 'RESPONDER_ACCEPTED', label: '2. PCR CHEETAH-04 DISPATCHED', icon: UserCheck },
    { key: 'ON_THE_WAY', label: '3. PATROL IN TRANSIT', icon: Navigation },
    { key: 'ARRIVED', label: '4. ARRIVED ON SCENE', icon: MapPin },
    { key: 'TRANSIT_HOSPITAL', label: '5. AREA SECURED', icon: Shield },
    { key: 'ADMITTED', label: '6. SITUATION RESOLVED', icon: ShieldCheck }
  ] : [
    { key: 'CREATED', label: '1. SOS ACTIVATED', icon: Radio },
    { key: 'RESPONDER_ACCEPTED', label: '2. AMBULANCE DISPATCHED', icon: UserCheck },
    { key: 'ON_THE_WAY', label: '3. TO VICTIM', icon: Navigation },
    { key: 'ARRIVED', label: '4. ON SCENE', icon: MapPin },
    { key: 'TRANSIT_HOSPITAL', label: '5. TO SMS HOSPITAL', icon: Navigation },
    { key: 'ADMITTED', label: '6. HOSPITAL ADMITTED', icon: Building2 }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'CREATED':
      case 'AI_ANALYZING':
      case 'SEARCHING_RESPONDER':
        return 0;
      case 'RESPONDER_ASSIGNED':
      case 'RESPONDER_ACCEPTED':
        return 1;
      case 'ON_THE_WAY':
        return 2;
      case 'ARRIVED':
      case 'PATIENT_STABILIZING':
        return 3;
      case 'TRANSIT_HOSPITAL':
      case 'EN_ROUTE_TO_HOSPITAL':
      case 'FIRE_FIGHTING_ACTIVE':
      case 'AREA_SECURED':
        return 4;
      case 'ADMITTED':
      case 'RESOLVED':
        return 5;
      default:
        return 0;
    }
  };

  const activeIdx = getStepIndex(currentStatus);

  const gradientColor = isFire
    ? 'linear-gradient(90deg, #ea580c, #f97316, #10b981)'
    : isPolice
      ? 'linear-gradient(90deg, #2563eb, #3b82f6, #10b981)'
      : 'linear-gradient(90deg, #ef4444, #10b981, #0284c7)';

  return (
    <div style={{ padding: '12px 0', width: '100%', overflowX: 'auto' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        minWidth: '680px',
        position: 'relative'
      }}>
        {/* Background track line */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '30px',
          right: '30px',
          height: '3px',
          backgroundColor: '#334155',
          zIndex: 1
        }} />

        {/* Active progress line */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '30px',
          width: `${(activeIdx / (steps.length - 1)) * 92}%`,
          height: '3px',
          background: gradientColor,
          zIndex: 2,
          transition: 'width 0.5s ease'
        }} />

        {steps.map((step, index) => {
          const isDone = index < activeIdx;
          const isCurrent = index === activeIdx;
          const StepIcon = step.icon;

          let circleBg = '#1e293b';
          let circleBorder = '#475569';
          let textColor = '#64748b';

          if (isDone) {
            circleBg = '#065f46';
            circleBorder = '#10b981';
            textColor = '#34d399';
          } else if (isCurrent) {
            if (isFire) {
              circleBg = '#7c2d12';
              circleBorder = '#ea580c';
              textColor = '#fb923c';
            } else if (isPolice) {
              circleBg = '#1e3a8a';
              circleBorder = '#3b82f6';
              textColor = '#93c5fd';
            } else if (step.key === 'TRANSIT_HOSPITAL' || step.key === 'ADMITTED') {
              circleBg = '#0369a1';
              circleBorder = '#38bdf8';
              textColor = '#38bdf8';
            } else {
              circleBg = '#991b1b';
              circleBorder = '#ef4444';
              textColor = '#f87171';
            }
          }

          return (
            <div
              key={step.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 3,
                width: '100px',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: circleBg,
                border: `2px solid ${circleBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isCurrent ? `0 0 16px ${circleBorder}99` : 'none',
                transition: 'all 0.3s ease'
              }}>
                {isDone ? (
                  <CheckCircle2 size={20} color="#10b981" />
                ) : (
                  <StepIcon size={18} color={isCurrent ? '#ffffff' : '#94a3b8'} />
                )}
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: isCurrent ? '800' : '600',
                color: isCurrent ? '#f8fafc' : textColor,
                marginTop: '8px',
                lineHeight: 1.2
              }}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
