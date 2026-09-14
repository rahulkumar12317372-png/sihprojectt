export function formatTimestamp(isoString) {
  if (!isoString) return '--:--:--';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatDate(isoString) {
  if (!isoString) return 'Today';
  const d = new Date(isoString);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getSeverityStyle(severity) {
  switch ((severity || '').toUpperCase()) {
    case 'CRITICAL':
      return {
        bg: '#450a0a',
        border: '#dc2626',
        text: '#fecaca',
        badgeBg: 'rgba(239, 68, 68, 0.2)',
        iconColor: '#ef4444'
      };
    case 'HIGH':
      return {
        bg: '#451a03',
        border: '#d97706',
        text: '#fed7aa',
        badgeBg: 'rgba(245, 158, 11, 0.2)',
        iconColor: '#f59e0b'
      };
    case 'MEDIUM':
      return {
        bg: '#1e1b4b',
        border: '#6366f1',
        text: '#c7d2fe',
        badgeBg: 'rgba(99, 102, 241, 0.2)',
        iconColor: '#6366f1'
      };
    default:
      return {
        bg: '#064e3b',
        border: '#10b981',
        text: '#a7f3d0',
        badgeBg: 'rgba(16, 185, 129, 0.2)',
        iconColor: '#10b981'
      };
  }
}
