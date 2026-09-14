import React, { useState, useEffect } from 'react';
import { History, Clock, CheckCircle2, MapPin, Ambulance } from 'lucide-react';
import SeverityBadge from '../components/SeverityBadge';
import SafetyNotice from '../components/SafetyNotice';
import { api } from '../services/api';
import { formatDate, formatTimestamp } from '../utils/formatters';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    api.getAllIncidents().then(res => {
      if (res.success && res.data) setHistory(res.data);
    });
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 20px 100px 20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff' }}>
          Emergency History
        </h1>
        <p style={{ fontSize: '14px', color: '#94a3b8' }}>
          Past distress activations, responder units, and clinical resolution logs
        </p>
      </div>

      <SafetyNotice />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '20px' }}>
        {history.map(item => (
          <div key={item.id} className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#ffffff' }}>
                  #{item.id?.substring(0, 12)}
                </span>
                <SeverityBadge severity={item.severity} size="sm" />
                <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: '600' }}>
                  {item.category}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                {formatDate(item.createdAt)} at {formatTimestamp(item.createdAt)}
              </span>
            </div>

            <p style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '12px' }}>
              {item.description || 'Emergency SOS signal'}
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              fontSize: '12px',
              color: '#94a3b8',
              borderTop: '1px solid #334155',
              paddingTop: '12px'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Ambulance size={14} color="#10b981" /> Unit: {item.responderId ? 'Ambulance A102' : 'Dispatched'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} color="#38bdf8" /> Response Time: <strong>{item.responseTime || '4m 32s'}</strong>
              </span>
              <span style={{ color: '#10b981', fontWeight: '700' }}>
                &check; Status: {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
