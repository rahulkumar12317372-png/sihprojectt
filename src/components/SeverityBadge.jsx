import React from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, Flame } from 'lucide-react';
import { getSeverityStyle } from '../utils/formatters';

export default function SeverityBadge({ severity = 'HIGH', showIcon = true, size = 'md' }) {
  const style = getSeverityStyle(severity);

  const getIcon = () => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return <Flame size={size === 'sm' ? 12 : 16} color={style.iconColor} />;
      case 'HIGH':
        return <AlertTriangle size={size === 'sm' ? 12 : 16} color={style.iconColor} />;
      case 'MEDIUM':
        return <AlertCircle size={size === 'sm' ? 12 : 16} color={style.iconColor} />;
      default:
        return <ShieldCheck size={size === 'sm' ? 12 : 16} color={style.iconColor} />;
    }
  };

  const isSmall = size === 'sm';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: isSmall ? '4px' : '6px',
      background: style.badgeBg,
      color: style.text,
      border: `1px solid ${style.border}`,
      padding: isSmall ? '2px 8px' : '4px 12px',
      borderRadius: '20px',
      fontSize: isSmall ? '11px' : '12px',
      fontWeight: '700',
      letterSpacing: '0.05em',
      textTransform: 'uppercase'
    }}>
      {showIcon && getIcon()}
      {severity}
    </span>
  );
}
