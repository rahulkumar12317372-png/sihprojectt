import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  Radio,
  Ambulance,
  Building2,
  LayoutDashboard,
  BarChart3,
  Users,
  PhoneCall,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SafetyNotice from './SafetyNotice';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['USER', 'ADMIN'] },
    { to: '/emergency/report', label: 'SOS Report', icon: Radio, roles: ['USER', 'ADMIN'] },
    { to: '/responder/dashboard', label: 'Responder Hub', icon: Ambulance, roles: ['RESPONDER', 'ADMIN'] },
    { to: '/hospital/dashboard', label: 'Hospital Hub', icon: Building2, roles: ['HOSPITAL', 'ADMIN'] },
    { to: '/admin/dashboard', label: 'Admin Center', icon: ShieldAlert, roles: ['ADMIN'] },
    { to: '/analytics', label: 'Public Analytics', icon: BarChart3, roles: ['USER', 'RESPONDER', 'HOSPITAL', 'ADMIN'] },
    { to: '/contacts', label: 'Trusted Contacts', icon: Users, roles: ['USER', 'ADMIN'] }
  ];

  const currentRole = currentUser?.role || 'USER';

  return (
    <>
      <SafetyNotice compact />

      <nav style={{
        background: 'rgba(11, 17, 32, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1e293b',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: '0 20px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ef4444, #991b1b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
            }}>
              <ShieldAlert size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '18px',
                fontWeight: '900',
                letterSpacing: '0.04em',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                EMERGENCY<span style={{ color: '#ef4444' }}>CONNECT</span>
                <span style={{
                  fontSize: '9px',
                  background: '#334155',
                  color: '#f8fafc',
                  padding: '2px 5px',
                  borderRadius: '4px',
                  fontWeight: '700'
                }}>DEMO</span>
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '0.02em' }}>
                Real-Time Coordination
              </div>
            </div>
          </Link>

          {/* Desktop Links */}
          <div style={{ display: 'none', alignItems: 'center', gap: '8px' }} className="desktop-nav">
            {navLinks
              .filter(link => !link.roles || link.roles.includes(currentRole))
              .map(link => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      textDecoration: 'none',
                      color: isActive ? '#ffffff' : '#94a3b8',
                      background: isActive ? '#1e293b' : 'transparent',
                      border: isActive ? '1px solid #334155' : '1px solid transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={16} color={isActive ? '#ef4444' : '#64748b'} />
                    {link.label}
                  </Link>
                );
              })}
          </div>

          {/* User Role Switcher & Emergency Dial */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a
              href="tel:112"
              style={{
                background: '#dc2626',
                color: '#ffffff',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
                boxShadow: '0 0 12px rgba(220, 38, 38, 0.4)'
              }}
            >
              <PhoneCall size={16} />
              <span>112 SOS</span>
            </a>

            {currentUser && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#1e293b',
                padding: '4px 10px',
                borderRadius: '8px',
                border: '1px solid #334155'
              }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#f8fafc' }}>
                    {currentUser.name?.split(' ')[0]}
                  </div>
                  <div style={{
                    fontSize: '9px',
                    fontWeight: '800',
                    color: currentRole === 'ADMIN' ? '#f59e0b' : currentRole === 'RESPONDER' ? '#10b981' : '#38bdf8',
                    textTransform: 'uppercase'
                  }}>
                    {currentRole}
                  </div>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#f8fafc',
                padding: '8px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex'
              }}
              className="mobile-nav-btn"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div style={{
            background: '#0f172a',
            borderTop: '1px solid #1e293b',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {navLinks.map(link => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: '#f8fafc',
                    background: location.pathname === link.to ? '#1e293b' : 'transparent'
                  }}
                >
                  <Icon size={18} color="#ef4444" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      <style>{`
        @media (min-width: 1024px) {
          .desktop-nav { display: flex !important; }
          .mobile-nav-btn { display: none !important; }
        }
      `}</style>
    </>
  );
}
