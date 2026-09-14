import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, Flame, HeartPulse, Siren, Radio } from 'lucide-react';

const HOLD_DURATION_MS = 2000; // 2 Seconds required

export default function SOSButton({ onActivate, disabled = false, category = 'ACCIDENT' }) {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const startTimeRef = useRef(0);

  const startHold = (e) => {
    if (disabled) return;
    if (e.type === 'touchstart') e.preventDefault();

    setHolding(true);
    startTimeRef.current = Date.now();

    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / HOLD_DURATION_MS) * 100);
      setProgress(pct);

      if (elapsed >= HOLD_DURATION_MS) {
        clearInterval(timerRef.current);
        setHolding(false);
        setProgress(100);
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 150]);
        }
        if (onActivate) onActivate();
      }
    }, 20);
  };

  const cancelHold = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setHolding(false);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Visual theming based on category
  const getTheme = () => {
    switch (category) {
      case 'FIRE':
        return {
          primaryColor: '#ea580c',
          glowColor: '#f97316',
          gradient: 'radial-gradient(circle, #ea580c 0%, #9a3412 100%)',
          holdingGradient: 'radial-gradient(circle, #c2410c, #7c2d12)',
          shadow: 'rgba(249, 115, 22, 0.6)',
          icon: Flame,
          label: 'FIRE SOS',
          hint: 'Hold for Fire Brigade Tender FT-09 (Water Foam & Rescue)'
        };
      case 'CRIME':
      case 'POLICE':
        return {
          primaryColor: '#2563eb',
          glowColor: '#3b82f6',
          gradient: 'radial-gradient(circle, #2563eb 0%, #1e3a8a 100%)',
          holdingGradient: 'radial-gradient(circle, #1d4ed8, #172554)',
          shadow: 'rgba(59, 130, 246, 0.6)',
          icon: Siren,
          label: 'POLICE SOS',
          hint: 'Hold for Police PCR Van Cheetah-04 (Immediate Tactical Response)'
        };
      case 'DISASTER':
        return {
          primaryColor: '#d97706',
          glowColor: '#f59e0b',
          gradient: 'radial-gradient(circle, #d97706 0%, #78350f 100%)',
          holdingGradient: 'radial-gradient(circle, #b45309, #451a03)',
          shadow: 'rgba(245, 158, 11, 0.6)',
          icon: Radio,
          label: 'RESCUE SOS',
          hint: 'Hold for SDRF Heavy Search & Rescue Team'
        };
      case 'MEDICAL':
      case 'ACCIDENT':
      default:
        return {
          primaryColor: '#dc2626',
          glowColor: '#ef4444',
          gradient: 'radial-gradient(circle, #dc2626 0%, #991b1b 100%)',
          holdingGradient: 'radial-gradient(circle, #b91c1c, #7f1d1d)',
          shadow: 'rgba(239, 68, 68, 0.6)',
          icon: HeartPulse,
          label: 'MEDICAL SOS',
          hint: 'Hold for Ambulance A102 & Transport to SMS Hospital'
        };
    }
  };

  const theme = getTheme();
  const IconComponent = theme.icon;

  // Circular progress calculations
  const size = 220;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px 0',
      userSelect: 'none'
    }}>
      <div
        style={{
          position: 'relative',
          width: `${size}px`,
          height: `${size}px`,
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        onTouchCancel={cancelHold}
      >
        {/* SVG Circular Progress Track */}
        <svg
          width={size}
          height={size}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: 'rotate(-90deg)',
            pointerEvents: 'none'
          }}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Dynamic glowing progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.glowColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: holding ? 'stroke-dashoffset 20ms linear' : 'stroke-dashoffset 200ms ease-out',
              filter: holding ? `drop-shadow(0 0 10px ${theme.glowColor})` : 'none'
            }}
          />
        </svg>

        {/* Large Central Emergency Button */}
        <button
          type="button"
          disabled={disabled}
          style={{
            position: 'absolute',
            top: `${strokeWidth + 6}px`,
            left: `${strokeWidth + 6}px`,
            width: `${size - (strokeWidth + 6) * 2}px`,
            height: `${size - (strokeWidth + 6) * 2}px`,
            borderRadius: '50%',
            background: holding ? theme.holdingGradient : theme.gradient,
            border: '3px solid rgba(255, 255, 255, 0.3)',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: holding
              ? `0 0 45px ${theme.shadow}, inset 0 0 20px rgba(0, 0, 0, 0.5)`
              : `0 10px 32px ${theme.shadow}, inset 0 2px 4px rgba(255, 255, 255, 0.35)`,
            transform: holding ? 'scale(0.97)' : 'scale(1)',
            transition: 'all 0.15s ease',
            outline: 'none'
          }}
          className={!holding ? 'pulse-emergency' : ''}
        >
          <IconComponent size={38} color="#ffffff" style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))' }} />
          <span style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: '18px',
            fontWeight: '900',
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}>
            {holding ? 'HOLDING...' : theme.label}
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: '700',
            opacity: 0.9,
            letterSpacing: '0.04em'
          }}>
            {holding ? `${Math.round(progress)}%` : 'HOLD 2 SECONDS'}
          </span>
        </button>
      </div>

      <p style={{
        marginTop: '16px',
        fontSize: '13px',
        color: holding ? theme.glowColor : '#94a3b8',
        fontWeight: '600',
        textAlign: 'center',
        maxWidth: '380px'
      }}>
        {holding
          ? `Keep holding! Dispatching ${category === 'FIRE' ? 'Fire Brigade' : (category === 'CRIME' ? 'Police PCR' : 'Ambulance')}...`
          : theme.hint}
      </p>
    </div>
  );
}
