import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, LogIn, Sparkles, User, Ambulance, Building2, Shield, Lock, Mail } from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../context/AuthContext';
import SafetyNotice from '../components/SafetyNotice';

export default function LoginPage() {
  const { login, loginWithCustom } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('USER');
  const [email, setEmail] = useState('rahul@example.com');
  const [password, setPassword] = useState('password123');

  const handleRoleSelect = (roleKey) => {
    setActiveTab(roleKey);
    const demo = DEMO_ACCOUNTS[roleKey];
    if (demo) {
      setEmail(demo.email);
    }
  };

  const handleDemoQuickLogin = (roleKey) => {
    const user = login(roleKey);
    redirectByRole(user.role);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = loginWithCustom(email, password);
    redirectByRole(user.role);
  };

  const redirectByRole = (role) => {
    switch (role) {
      case 'ADMIN':
        navigate('/admin/dashboard');
        break;
      case 'RESPONDER':
        navigate('/responder/dashboard');
        break;
      case 'HOSPITAL':
        navigate('/hospital/dashboard');
        break;
      default:
        navigate('/dashboard');
        break;
    }
  };

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #ef4444, #991b1b)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)',
            marginBottom: '12px'
          }}>
            <ShieldAlert size={28} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#ffffff' }}>
            EMERGENCY<span style={{ color: '#ef4444' }}>CONNECT</span>
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
            Sign in to access your coordination portal
          </p>
        </div>

        <SafetyNotice compact />

        <div className="glass-card" style={{ padding: '28px', marginTop: '16px' }}>
          {/* Role selector buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px',
            background: '#0f172a',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '24px'
          }}>
            {[
              { key: 'USER', label: 'User', icon: User },
              { key: 'RESPONDER', label: 'Unit', icon: Ambulance },
              { key: 'HOSPITAL', label: 'Hospital', icon: Building2 },
              { key: 'ADMIN', label: 'Admin', icon: Shield }
            ].map(tab => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleRoleSelect(tab.key)}
                  style={{
                    background: isSelected ? '#1e293b' : 'transparent',
                    color: isSelected ? '#ffffff' : '#94a3b8',
                    border: isSelected ? '1px solid #334155' : 'none',
                    borderRadius: '8px',
                    padding: '8px 4px',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={16} color={isSelected ? '#ef4444' : '#64748b'} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* 1-Click Instant Demo Login Banner */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={14} /> DEMO QUICK-LOGIN
              </div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>
                Instant access as <strong>{activeTab}</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDemoQuickLogin(activeTab)}
              style={{
                background: '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Sign In as {activeTab}
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '10px 12px 10px 38px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#cbd5e1', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '10px 12px 10px 38px',
                    color: '#ffffff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
              <LogIn size={18} />
              <span>Continue to Dashboard</span>
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#ef4444', fontWeight: '700', textDecoration: 'none' }}>
              Register Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
