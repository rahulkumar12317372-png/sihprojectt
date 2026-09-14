import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Activity,
  Ambulance,
  Clock,
  CheckCircle2,
  Search,
  Filter,
  Download,
  Flame,
  AlertTriangle,
  RotateCcw,
  Edit,
  UserCheck
} from 'lucide-react';
import MetricCard from '../components/MetricCard';
import SeverityBadge from '../components/SeverityBadge';
import LiveMap from '../components/LiveMap';
import SafetyNotice from '../components/SafetyNotice';
import { api } from '../services/api';
import { formatTimestamp, formatDate } from '../utils/formatters';

export default function AdminDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [summary, setSummary] = useState({
    activeIncidentsCount: 1,
    criticalIncidentsCount: 1,
    respondersOnlineCount: 3,
    averageResponseTime: '4m 32s',
    resolvedCount: 24
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchAdminData = async () => {
    try {
      const [incRes, sumRes] = await Promise.all([
        api.getAllIncidents(),
        api.getAnalyticsSummary()
      ]);

      if (incRes.success && incRes.data) setIncidents(incRes.data);
      if (sumRes.success && sumRes.data) setSummary(sumRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 3000);
    return () => clearInterval(interval);
  }, []);

  // AI Severity Override
  const handleOverrideSeverity = async (incidentId, newSeverity) => {
    await api.updateIncident(incidentId, { severity: newSeverity });
    fetchAdminData();
  };

  // Reassign Responder
  const handleReassignResponder = async (incidentId, responderId) => {
    await api.updateIncident(incidentId, {
      responderId,
      status: 'RESPONDER_ASSIGNED'
    });
    fetchAdminData();
  };

  // Resolve Incident
  const handleResolveIncident = async (incidentId) => {
    await api.resolveIncident(incidentId);
    fetchAdminData();
  };

  // Export CSV Report
  const handleExportCSV = () => {
    const headers = ['Incident ID', 'Category', 'Severity', 'Status', 'Response Time', 'Created At'];
    const rows = incidents.map(i => [
      i.id,
      i.category,
      i.severity,
      i.status,
      i.responseTime || 'Pending',
      i.createdAt
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EmergencyConnect_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered incidents list
  const filteredIncidents = incidents.filter(i => {
    const matchesSearch =
      i.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.description && i.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSeverity = filterSeverity === 'ALL' || i.severity === filterSeverity;
    const matchesCategory = filterCategory === 'ALL' || i.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || i.status === filterStatus;

    return matchesSearch && matchesSeverity && matchesCategory && matchesStatus;
  });

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px 100px 20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ef4444, #991b1b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)'
          }}>
            <ShieldAlert size={28} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#ffffff' }}>
              Central Emergency Command Center
            </h1>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>
              Master Fleet &bull; AI Oversight &bull; Dispatch Coordination &bull; Jaipur Sector
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="btn-secondary"
          style={{ padding: '10px 18px', fontSize: '13px' }}
        >
          <Download size={16} /> Export Incident Report (CSV)
        </button>
      </div>

      <SafetyNotice />

      {/* Metric Cards Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        margin: '24px 0'
      }}>
        <MetricCard
          title="Active Emergencies"
          value={summary.activeIncidentsCount || 1}
          subtitle="Real-time ongoing missions"
          icon={Activity}
          color="#ef4444"
        />
        <MetricCard
          title="Critical Alerts"
          value={summary.criticalIncidentsCount || 1}
          subtitle="Immediate life hazards"
          icon={Flame}
          color="#dc2626"
        />
        <MetricCard
          title="Responders Online"
          value={summary.respondersOnlineCount || 3}
          subtitle="Ambulance &bull; Police &bull; Fire"
          icon={Ambulance}
          color="#10b981"
        />
        <MetricCard
          title="Avg. Response Time"
          value={summary.averageResponseTime || '4m 32s'}
          subtitle="Target under 8 minutes"
          icon={Clock}
          color="#38bdf8"
          trend="&uarr; 38% faster than benchmark"
        />
        <MetricCard
          title="Resolved Cases"
          value={summary.resolvedCount || 24}
          subtitle="Safely closed today"
          icon={CheckCircle2}
          color="#a855f7"
        />
      </div>

      {/* Command Map */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
              Master Sector Fleet Map
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>
              Live triangulation of Rahul (victim), Ambulance A102, Police P204, and SMS Hospital
            </p>
          </div>
          <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '700' }}>
            GPS Stream Active
          </span>
        </div>

        <LiveMap
          userLocation={{ latitude: 26.9124, longitude: 75.7873 }}
          responderLocation={{ latitude: 26.9240, longitude: 75.8010, name: 'Ambulance A102' }}
          height="380px"
          showRoute={true}
        />
      </div>

      {/* Incidents Table & Override Controls */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
              Incident Command &amp; AI Override Register
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>
              Dispatchers have 100% authority to override AI triage, reassign vehicles, or resolve cases
            </p>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search Incident ID or text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '8px 12px 8px 36px',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Filter Toolbar */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {/* Severity filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            style={{ background: '#0f172a', border: '1px solid #334155', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }}
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ background: '#0f172a', border: '1px solid #334155', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }}
          >
            <option value="ALL">All Categories</option>
            <option value="ACCIDENT">Accident</option>
            <option value="MEDICAL">Medical</option>
            <option value="FIRE">Fire</option>
            <option value="CRIME">Crime</option>
            <option value="SAFETY">Safety</option>
            <option value="OTHER">Other</option>
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ background: '#0f172a', border: '1px solid #334155', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="CREATED">Created</option>
            <option value="ON_THE_WAY">On The Way</option>
            <option value="ARRIVED">Arrived</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '12px 10px' }}>ID</th>
                <th style={{ padding: '12px 10px' }}>Category</th>
                <th style={{ padding: '12px 10px' }}>AI Severity</th>
                <th style={{ padding: '12px 10px' }}>Status</th>
                <th style={{ padding: '12px 10px' }}>Assigned Unit</th>
                <th style={{ padding: '12px 10px' }}>Response Time</th>
                <th style={{ padding: '12px 10px', textAlign: 'right' }}>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map(inc => (
                <tr key={inc.id} style={{ borderBottom: '1px solid rgba(51, 65, 85, 0.4)' }}>
                  <td style={{ padding: '14px 10px', fontWeight: '800', color: '#ffffff' }}>
                    #{inc.id?.substring(0, 10)}
                  </td>
                  <td style={{ padding: '14px 10px', color: '#cbd5e1' }}>
                    {inc.category}
                  </td>
                  <td style={{ padding: '14px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <SeverityBadge severity={inc.severity} size="sm" />
                      {/* Override dropdown */}
                      <select
                        value={inc.severity}
                        onChange={(e) => handleOverrideSeverity(inc.id, e.target.value)}
                        style={{ background: '#1e293b', border: '1px solid #475569', color: '#94a3b8', fontSize: '10px', borderRadius: '4px', padding: '2px' }}
                      >
                        <option value="CRITICAL">CRITICAL</option>
                        <option value="HIGH">HIGH</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="LOW">LOW</option>
                      </select>
                    </div>
                  </td>
                  <td style={{ padding: '14px 10px', color: '#38bdf8', fontWeight: '600' }}>
                    {inc.status}
                  </td>
                  <td style={{ padding: '14px 10px' }}>
                    {/* Reassign dropdown */}
                    <select
                      value={inc.responderId || ''}
                      onChange={(e) => handleReassignResponder(inc.id, e.target.value)}
                      style={{ background: '#1e293b', border: '1px solid #334155', color: '#ffffff', fontSize: '11px', borderRadius: '4px', padding: '4px' }}
                    >
                      <option value="">Select Unit</option>
                      <option value="resp_a102">Ambulance A102</option>
                      <option value="resp_p204">Police P204</option>
                      <option value="resp_f301">Fire Tender F301</option>
                    </select>
                  </td>
                  <td style={{ padding: '14px 10px', color: '#10b981', fontWeight: '700' }}>
                    {inc.responseTime || '4m 32s'}
                  </td>
                  <td style={{ padding: '14px 10px', textAlign: 'right' }}>
                    {inc.status !== 'RESOLVED' ? (
                      <button
                        type="button"
                        onClick={() => handleResolveIncident(inc.id)}
                        className="btn-success"
                        style={{ padding: '4px 10px', fontSize: '11px' }}
                      >
                        Resolve
                      </button>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: '11px' }}>Closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
