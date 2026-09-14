import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Mic,
  MicOff,
  Upload,
  Sparkles,
  Camera,
  Radio,
  Clock,
  Send,
  AlertTriangle,
  Flame,
  Activity,
  Shield,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { useEmergency } from '../context/EmergencyContext';
import { useAuth } from '../context/AuthContext';
import SafetyNotice from '../components/SafetyNotice';
import SeverityBadge from '../components/SeverityBadge';
import { api } from '../services/api';

const CATEGORY_CHIPS = [
  { key: 'ACCIDENT', label: 'Road Accident', icon: AlertTriangle },
  { key: 'MEDICAL', label: 'Medical Emergency', icon: Activity },
  { key: 'FIRE', label: 'Fire Outbreak', icon: Flame },
  { key: 'CRIME', label: 'Crime / Assault', icon: Shield },
  { key: 'SAFETY', label: 'Public Safety', icon: ShieldAlert },
  { key: 'OTHER', label: 'Other Urgent', icon: HelpCircle }
];

export default function EmergencyReportPage() {
  const { userLocation, setActiveIncident } = useEmergency();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ACCIDENT');
  const [isListening, setIsListening] = useState(false);
  const [photoSelected, setPhotoSelected] = useState(false);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Web Speech Recognition for Voice Input
  const toggleVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by your browser. Please type your description.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDescription(prev => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.start();
  };

  // 1-Click Jaipur Scenario Auto-fill
  const fillDemoScenario = () => {
    setDescription('There has been a serious bike accident. One person is unconscious and another is bleeding.');
    setSelectedCategory('ACCIDENT');
  };

  const handleSubmitEmergency = async (e) => {
    e.preventDefault();
    const finalDesc = description.trim() || 'Urgent distress signal activated';

    setAnalyzingAI(true);

    try {
      // 1. Call AI Triage
      const triageRes = await api.classifyAI(finalDesc, {
        hasPhoto: photoSelected,
        categoryHint: selectedCategory
      });

      const triageData = triageRes.data || {
        category: selectedCategory,
        severity: 'CRITICAL',
        suggestedServices: ['AMBULANCE', 'HOSPITAL', 'POLICE'],
        reason: 'Reported unconscious and bleeding person',
        confidence: 0.94
      };

      setAiResult(triageData);

      // Brief delay to showcase AI classification analysis
      await new Promise(r => setTimeout(r, 1200));

      // 2. Create Incident on Backend
      const incidentRes = await api.createIncident({
        userId: currentUser?.id || 'usr_rahul_01',
        latitude: userLocation.latitude || 26.9124,
        longitude: userLocation.longitude || 75.7873,
        description: finalDesc,
        category: triageData.category || selectedCategory,
        severity: triageData.severity || 'CRITICAL',
        confidence: triageData.confidence || 0.94,
        suggestedServices: triageData.suggestedServices || ['AMBULANCE', 'HOSPITAL'],
        aiReason: triageData.reason || 'AI clinical severity triage'
      });

      if (incidentRes.success && incidentRes.data) {
        setActiveIncident(incidentRes.data);
        navigate(`/emergency/${incidentRes.data.id}`);
      }
    } catch (err) {
      console.error(err);
      // Fallback redirect
      navigate('/dashboard');
    } finally {
      setAnalyzingAI(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 20px 100px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <span style={{
          background: 'rgba(239, 68, 68, 0.15)',
          color: '#ef4444',
          fontSize: '12px',
          fontWeight: '800',
          padding: '4px 12px',
          borderRadius: '16px',
          letterSpacing: '0.06em'
        }}>
          EMERGENCY DISPATCH INTAKE
        </span>
        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff', marginTop: '8px' }}>
          What happened?
        </h1>
        <p style={{ fontSize: '14px', color: '#94a3b8' }}>
          Describe the situation or tap microphone for voice input. AI will triage immediately.
        </p>
      </div>

      <SafetyNotice />

      {/* Demo helper badge */}
      <div style={{
        background: 'rgba(56, 189, 248, 0.1)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '10px',
        padding: '12px 16px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ fontSize: '13px', color: '#e0f2fe' }}>
          <strong>Demo Scenario:</strong> Road accident with bleeding & unconscious patient.
        </div>
        <button
          type="button"
          onClick={fillDemoScenario}
          style={{
            background: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Sparkles size={14} /> Auto-fill Demo Text
        </button>
      </div>

      <form onSubmit={handleSubmitEmergency} className="glass-card" style={{ padding: '28px' }}>
        {/* Category Chips */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '8px' }}>
            Select Category
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {CATEGORY_CHIPS.map(chip => {
              const Icon = chip.icon;
              const isSelected = selectedCategory === chip.key;
              return (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setSelectedCategory(chip.key)}
                  style={{
                    background: isSelected ? 'rgba(239, 68, 68, 0.2)' : '#0f172a',
                    border: `1px solid ${isSelected ? '#ef4444' : '#334155'}`,
                    color: isSelected ? '#ffffff' : '#94a3b8',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={16} color={isSelected ? '#ef4444' : '#64748b'} />
                  {chip.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Text Area with Voice input button */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#cbd5e1' }}>
              Incident Description
            </label>
            <button
              type="button"
              onClick={toggleVoiceRecording}
              style={{
                background: isListening ? '#dc2626' : '#1e293b',
                color: isListening ? '#ffffff' : '#38bdf8',
                border: `1px solid ${isListening ? '#ef4444' : '#334155'}`,
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              {isListening ? 'Listening...' : 'Voice Input'}
            </button>
          </div>

          <textarea
            rows={4}
            required
            placeholder="e.g. There has been a serious bike accident. One person is unconscious and another is bleeding."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: '100%',
              background: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '10px',
              padding: '14px',
              color: '#ffffff',
              fontSize: '15px',
              lineHeight: '1.5',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Optional Media attachment */}
        <div style={{
          background: '#0f172a',
          border: '1px dashed #334155',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Camera size={20} color="#94a3b8" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>
                Optional Photo / Scene Evidence
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {photoSelected ? 'Photo attached: bike_accident_scene.jpg' : 'Attach photo for AI multimodal triage'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPhotoSelected(!photoSelected)}
            style={{
              background: photoSelected ? '#065f46' : '#1e293b',
              color: photoSelected ? '#34d399' : '#cbd5e1',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {photoSelected ? 'Attached (Click to remove)' : 'Simulate Photo Upload'}
          </button>
        </div>

        {/* AI Analysis Live Readout if available */}
        {analyzingAI && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Clock className="animate-spin" size={18} />
              AI TRIAGE ENGINE ANALYZING REPORT...
            </div>
            <p style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>
              Evaluating clinical severity and nearest ambulance dispatch...
            </p>
          </div>
        )}

        {/* Submit Distress Button */}
        <button
          type="submit"
          disabled={analyzingAI}
          className="btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '16px' }}
        >
          <Send size={18} />
          <span>SUBMIT EMERGENCY &amp; DISPATCH HELP</span>
        </button>
      </form>
    </div>
  );
}
