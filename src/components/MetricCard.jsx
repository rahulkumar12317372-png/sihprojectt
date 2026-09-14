import React from 'react';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = '#ef4444',
  trend = null
}) {
  return (
    <div className="glass-card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {title}
          </span>
          <div style={{
            fontSize: '30px',
            fontWeight: '900',
            fontFamily: 'Outfit, sans-serif',
            color: '#ffffff',
            marginTop: '8px',
            letterSpacing: '-0.02em'
          }}>
            {value}
          </div>
          {subtitle && (
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              {subtitle}
            </div>
          )}
          {trend && (
            <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '600', marginTop: '6px' }}>
              {trend}
            </div>
          )}
        </div>

        {Icon && (
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: `rgba(${parseInt(color.slice(1,3),16)}, ${parseInt(color.slice(3,5),16)}, ${parseInt(color.slice(5,7),16)}, 0.15)`,
            border: `1px solid ${color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={24} color={color} />
          </div>
        )}
      </div>

      {/* Accent glow bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${color}, transparent)`
      }} />
    </div>
  );
}
