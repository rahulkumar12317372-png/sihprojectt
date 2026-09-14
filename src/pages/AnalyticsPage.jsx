import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Zap,
  Activity,
  Calendar
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import SafetyNotice from '../components/SafetyNotice';
import { api } from '../services/api';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    averageResponseTime: '4m 32s',
    totalIncidentsResolved: 142,
    averageDispatchTime: '31s',
    responderAcceptanceRate: '96.4%',
    categories: [
      { name: 'Road Accidents', percentage: 42, count: 184 },
      { name: 'Acute Medical', percentage: 28, count: 122 },
      { name: 'Fire & Hazard', percentage: 14, count: 61 },
      { name: 'Public Safety', percentage: 11, count: 48 },
      { name: 'Other Urgent', percentage: 5, count: 22 }
    ],
    hourlyDistribution: [
      { period: '12am - 4am', volume: '6%' },
      { period: '4am - 8am', volume: '12%' },
      { period: '8am - 12pm', volume: '26%' },
      { period: '12pm - 4pm', volume: '20%' },
      { period: '4pm - 8pm', volume: '28%' },
      { period: '8pm - 12am', volume: '8%' }
    ]
  });

  useEffect(() => {
    api.getPublicAnalytics().then(res => {
      if (res.success && res.data) setAnalytics(res.data);
    });
  }, []);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 100px 20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(16, 185, 129, 0.15)',
          color: '#34d399',
          padding: '4px 14px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '700',
          marginBottom: '10px'
        }}>
          <ShieldCheck size={15} /> PRIVACY-PRESERVING PUBLIC METRICS
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff' }}>
          Emergency Response Analytics &amp; Performance
        </h1>
        <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '640px', margin: '0 auto' }}>
          Transparent aggregate emergency system performance. Individual patient identities and private home locations are strictly excluded.
        </p>
      </div>

      <SafetyNotice />

      {/* Top 4 Hero KPIs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <MetricCard
          title="Average Response Time"
          value={analytics.averageResponseTime || '4m 32s'}
          subtitle="SOS activation to responder arrival"
          icon={Clock}
          color="#ef4444"
          trend="&uarr; 4.2 min benchmark beaten"
        />
        <MetricCard
          title="Total Incidents Resolved"
          value={analytics.totalIncidentsResolved || 142}
          subtitle="Verified successful dispatches"
          icon={CheckCircle2}
          color="#10b981"
        />
        <MetricCard
          title="Average Dispatch Speed"
          value={analytics.averageDispatchTime || '31s'}
          subtitle="AI triage to responder accept"
          icon={Zap}
          color="#38bdf8"
        />
        <MetricCard
          title="Responder Acceptance Rate"
          value={analytics.responderAcceptanceRate || '96.4%'}
          subtitle="Immediate fleet acknowledgment"
          icon={TrendingUp}
          color="#f59e0b"
        />
      </div>

      {/* Visual Analytics Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px'
      }}>
        {/* Category Breakdown */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>
            Incident Category Breakdown
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>
            Relative proportion of handled distress calls
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {analytics.categories.map((cat, idx) => {
              const colors = ['#ef4444', '#38bdf8', '#f59e0b', '#a855f7', '#10b981'];
              const color = colors[idx % colors.length];
              return (
                <div key={cat.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '600', color: '#f8fafc' }}>{cat.name}</span>
                    <span style={{ color: '#94a3b8' }}>{cat.percentage}% ({cat.count} cases)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#0f172a', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${cat.percentage}%`,
                      height: '100%',
                      background: color,
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Hourly Volume Distribution */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', marginBottom: '6px' }}>
            Hourly Incident Volume
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '24px' }}>
            Peak emergency hours throughout the day
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {analytics.hourlyDistribution.map(h => (
              <div
                key={h.period}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#0f172a',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #334155'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Calendar size={16} color="#38bdf8" />
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>
                    {h.period}
                  </span>
                </div>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: h.volume.includes('Peak') ? '#ef4444' : '#10b981'
                }}>
                  {h.volume}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
