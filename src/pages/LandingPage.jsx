import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Radio,
  Brain,
  MapPin,
  Ambulance,
  Activity,
  PhoneCall,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Cpu,
  Clock
} from 'lucide-react';
import SafetyNotice from '../components/SafetyNotice';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';

export default function LandingPage() {
  const { switchRole } = useAuth();
  const { runFullDemoSimulation } = useEmergency();
  const navigate = useNavigate();

  const handleStartDemo = () => {
    switchRole('USER');
    runFullDemoSimulation(navigate);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0b1120', color: '#f8fafc', paddingBottom: '120px' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        padding: '60px 20px 80px 20px',
        background: 'radial-gradient(circle at 50% 10%, rgba(220, 38, 38, 0.18) 0%, rgba(11, 17, 32, 0) 70%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            padding: '6px 14px',
            borderRadius: '24px',
            fontSize: '12px',
            fontWeight: '700',
            color: '#fca5a5',
            marginBottom: '24px'
          }}>
            <Sparkles size={14} color="#ef4444" />
            <span>REAL-TIME EMERGENCY COORDINATION PROTOTYPE</span>
          </div>

          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(36px, 6vw, 68px)',
            fontWeight: '900',
            lineHeight: '1.08',
            letterSpacing: '-0.03em',
            marginBottom: '20px'
          }}>
            EMERGENCY<span style={{ color: '#ef4444' }}>CONNECT</span>
          </h1>

          <p style={{
            fontSize: 'clamp(17px, 2.5vw, 22px)',
            color: '#cbd5e1',
            maxWidth: '740px',
            margin: '0 auto 36px auto',
            lineHeight: '1.5',
            fontWeight: '400'
          }}>
            "One tap connects a person in distress to the nearest help — with AI-assisted severity triage and live status tracking until the emergency is resolved."
          </p>

          {/* Quick CTA Action Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
            marginBottom: '40px'
          }}>
            <button
              onClick={handleStartDemo}
              className="btn-primary"
              style={{ padding: '14px 28px', fontSize: '16px' }}
            >
              <Radio size={20} />
              <span>GET EMERGENCY HELP (DEMO)</span>
            </button>

            <Link
              to="/responder/dashboard"
              onClick={() => switchRole('RESPONDER')}
              className="btn-secondary"
              style={{ padding: '14px 24px', fontSize: '15px' }}
            >
              <Ambulance size={18} color="#10b981" />
              <span>RESPONDER LOGIN</span>
            </Link>

            <Link
              to="/admin/dashboard"
              onClick={() => switchRole('ADMIN')}
              className="btn-secondary"
              style={{ padding: '14px 24px', fontSize: '15px' }}
            >
              <ShieldAlert size={18} color="#f59e0b" />
              <span>ADMIN DASHBOARD</span>
            </Link>
          </div>

          {/* Feature Highlight Pills */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginTop: '20px'
          }}>
            {['SOS ONE-TAP', 'AI SEVERITY TRIAGE', 'LIVE GPS TRACKING', 'RESPONDER COORDINATION', 'REAL-TIME TRACKING'].map(tag => (
              <span
                key={tag}
                style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid #334155',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#94a3b8',
                  letterSpacing: '0.04em'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Safety Notice Center */}
      <section style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px' }}>
        <SafetyNotice />
      </section>

      {/* Problem & Solution Grid */}
      <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Problem */}
          <div className="glass-card" style={{ padding: '32px', borderLeft: '4px solid #ef4444' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <ShieldAlert size={26} color="#ef4444" />
              <h2 style={{ fontSize: '22px', fontWeight: '800' }}>The Problem</h2>
            </div>
            <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '15px', marginBottom: '16px' }}>
              During high-stress medical, traffic, or crime emergencies, victims struggle to communicate precise coordinates, critical severity details are lost in call queues, and families endure panic without visibility into responder arrival.
            </p>
            <ul style={{ listStyle: 'none', color: '#94a3b8', fontSize: '14px', lineHeight: '1.8' }}>
              <li>&bull; Inaccurate verbal location descriptions delay dispatches</li>
              <li>&bull; Lack of intelligent severity triage causes resource misallocation</li>
              <li>&bull; Zero real-time visibility for distressed victims and loved ones</li>
            </ul>
          </div>

          {/* Solution */}
          <div className="glass-card" style={{ padding: '32px', borderLeft: '4px solid #10b981' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <CheckCircle2 size={26} color="#10b981" />
              <h2 style={{ fontSize: '22px', fontWeight: '800' }}>The Solution</h2>
            </div>
            <p style={{ color: '#cbd5e1', lineHeight: '1.6', fontSize: '15px', marginBottom: '16px' }}>
              EMERGENCYCONNECT solves this through a unified real-time pipeline: One 2-second hold activates instant GPS lock, AI severity triage flags critical life threats, nearest available responders (like Ambulance A102) are matched within seconds, and trusted contacts receive live tracking.
            </p>
            <ul style={{ listStyle: 'none', color: '#94a3b8', fontSize: '14px', lineHeight: '1.8' }}>
              <li>&bull; Instant GPS coordinate broadcast with zero ambiguity</li>
              <li>&bull; Gemini & OpenAI assisted clinical severity classification</li>
              <li>&bull; Continuous OpenStreetMap live tracking with dynamic ETA</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works Flow */}
      <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '12px', fontWeight: '800', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Workflow Pipeline
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: '900', marginTop: '6px' }}>
            How EmergencyConnect Works
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px'
        }}>
          {[
            { num: '01', title: 'Hold SOS', desc: 'Hold for 2 seconds to activate distress without accidental clicks.' },
            { num: '02', title: 'Capture GPS', desc: 'Pinpoint exact latitude, longitude, and street grid coordinates.' },
            { num: '03', title: 'AI Triage', desc: 'Gemini/OpenAI classifies category, severity, and needed units.' },
            { num: '04', title: 'Nearest Match', desc: 'Haversine formula scores nearest available ambulance or police.' },
            { num: '05', title: 'Live Tracking', desc: 'Victim, responder, and family track moving vehicle in real time.' },
            { num: '06', title: 'Resolved & Logged', desc: 'Incident resolved with precise response analytics (4m 32s).' }
          ].map(s => (
            <div key={s.num} className="glass-card" style={{ padding: '24px', position: 'relative' }}>
              <span style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '28px',
                fontWeight: '900',
                color: 'rgba(239, 68, 68, 0.4)'
              }}>
                {s.num}
              </span>
              <h3 style={{ fontSize: '17px', fontWeight: '700', marginTop: '8px', color: '#ffffff' }}>
                {s.title}
              </h3>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px', lineHeight: '1.5' }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Module Section */}
      <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        <div className="glass-card" style={{ padding: '40px', background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Brain size={32} color="#ef4444" />
            <div>
              <h2 style={{ fontSize: '26px', fontWeight: '900' }}>AI Triage & Decision Assistance Engine</h2>
              <p style={{ fontSize: '14px', color: '#94a3b8' }}>Powered by Gemini & OpenAI API abstraction with strict JSON enforcement</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'center' }}>
            <div>
              <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.6', marginBottom: '16px' }}>
                The AI triage engine listens to typed text, speech-to-text voice descriptions, or multimodal scene metadata. It instantly classifies incidents into strict categories: <strong>ACCIDENT, MEDICAL, FIRE, CRIME, SAFETY, OTHER</strong> and sets severity: <strong>LOW, MEDIUM, HIGH, CRITICAL</strong>.
              </p>
              <div style={{
                background: '#0f172a',
                border: '1px solid #334155',
                borderRadius: '10px',
                padding: '16px',
                fontSize: '13px',
                color: '#cbd5e1'
              }}>
                <strong>Crucial Safety Principle:</strong> AI is strictly an assistance layer. Human responders and dispatchers maintain 100% authority to override category and severity at any point.
              </div>
            </div>

            <div style={{
              background: '#0b1120',
              border: '1px solid #334155',
              borderRadius: '12px',
              padding: '20px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '12px',
              color: '#38bdf8'
            }}>
              <div style={{ color: '#64748b', marginBottom: '8px' }}>// Strict AI Output Schema</div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{`{
  "category": "ACCIDENT",
  "severity": "CRITICAL",
  "suggestedServices": [
    "AMBULANCE",
    "HOSPITAL",
    "POLICE"
  ],
  "reason": "Reported unconscious and bleeding person",
  "confidence": 0.94
}`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Future Scope */}
      <section style={{ maxWidth: '1200px', margin: '60px auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Lock size={22} color="#38bdf8" />
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Security & Privacy First</h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
              Role-Based Access Control (RBAC), Firestore Security Rules, and Realtime Database rules prevent unauthorized location harvesting. Public analytics strictly expose aggregate anonymized data.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <TrendingUp size={22} color="#a855f7" />
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Future Scope & ERSS</h3>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6' }}>
              Future plans include official API integration with 112/ERSS, IoT automatic crash detection in vehicles, wearable heart-rate distress monitors, and multi-lingual voice recognition across 12 Indian regional languages.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        maxWidth: '1200px',
        margin: '60px auto 0 auto',
        padding: '30px 20px 0 20px',
        borderTop: '1px solid #1e293b',
        textAlign: 'center',
        color: '#64748b',
        fontSize: '13px'
      }}>
        <p>EMERGENCYCONNECT &bull; Real-Time Emergency Response & Coordination Platform</p>
        <p style={{ marginTop: '8px', color: '#ef4444', fontWeight: '600' }}>
          Coordination Prototype Only. In life-threatening emergencies, dial 112.
        </p>
      </footer>
    </div>
  );
}
