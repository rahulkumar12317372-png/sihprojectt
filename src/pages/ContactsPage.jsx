import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Trash2, Phone, Mail, Heart, ShieldCheck, MessageSquare, Send, CheckCircle2, Loader2, Zap, AlertCircle, MapPin, Bell, PhoneCall } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEmergency } from '../context/EmergencyContext';
import SafetyNotice from '../components/SafetyNotice';
import { api } from '../services/api';

export default function ContactsPage() {
  const { currentUser } = useAuth();
  const { userLocation } = useEmergency();
  const [contacts, setContacts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('Family');
  const [sendingContactId, setSendingContactId] = useState(null);
  const [sendFeedback, setSendFeedback] = useState({});
  const [callingContactId, setCallingContactId] = useState(null);
  const [callFeedback, setCallFeedback] = useState({});

  // Bulk alert state
  const [sendingBulkAlert, setSendingBulkAlert] = useState(false);
  const [bulkAlertResult, setBulkAlertResult] = useState(null);

  const fetchContacts = async () => {
    try {
      const res = await api.getContacts(currentUser?.id || 'usr_rahul_01');
      if (res.success && res.data) setContacts(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [currentUser]);

  const handleAddContact = async (e) => {
    e.preventDefault();
    await api.addContact({
      userId: currentUser?.id || 'usr_rahul_01',
      name,
      phone,
      email,
      relationship
    });
    setName('');
    setPhone('');
    setEmail('');
    setShowAddModal(false);
    fetchContacts();
  };

  const handleDelete = async (id) => {
    await api.deleteContact(id);
    fetchContacts();
  };

  // Send WhatsApp emergency alert to ALL contacts at once
  const handleBulkEmergencyAlert = async () => {
    setSendingBulkAlert(true);
    setBulkAlertResult(null);
    try {
      const res = await api.sendEmergencyAlertToAll({
        userId: currentUser?.id || 'usr_rahul_01',
        userName: currentUser?.name || 'Rahul',
        latitude: userLocation?.latitude || 26.9124,
        longitude: userLocation?.longitude || 75.7873,
        description: 'Emergency SOS activated! Immediate assistance needed.',
        category: 'ACCIDENT',
        severity: 'CRITICAL'
      });

      if (res.success) {
        setBulkAlertResult({
          status: 'SUCCESS',
          data: res.data,
          message: res.message,
          time: new Date().toLocaleTimeString()
        });
      } else {
        setBulkAlertResult({
          status: 'ERROR',
          error: res.error || 'Failed to dispatch alerts'
        });
      }
    } catch (err) {
      setBulkAlertResult({
        status: 'ERROR',
        error: err.message
      });
    } finally {
      setSendingBulkAlert(false);
    }
  };

  const handleSendAutomaticWhatsApp = async (contact) => {
    if (!contact.phone) return;
    setSendingContactId(contact.id);
    try {
      const res = await api.sendWhatsAppAlert(
        contact.phone,
        `🚨 EMERGENCYCONNECT ALERT: Urgent test notification for ${contact.name} from EmergencyConnect. Location: https://maps.google.com/?q=${userLocation?.latitude || 26.9124},${userLocation?.longitude || 75.7873}`
      );
      if (res.success && res.data) {
        setSendFeedback(prev => ({
          ...prev,
          [contact.id]: {
            status: 'SUCCESS',
            sid: res.data.metadata?.messageSid || 'QUEUED',
            deliveryStatus: res.data.metadata?.deliveryStatus || 'SENT',
            time: new Date().toLocaleTimeString()
          }
        }));
      } else {
        setSendFeedback(prev => ({
          ...prev,
          [contact.id]: {
            status: 'ERROR',
            error: res.error || 'Failed to dispatch'
          }
        }));
      }
    } catch (err) {
      setSendFeedback(prev => ({
        ...prev,
        [contact.id]: {
          status: 'ERROR',
          error: err.message
        }
      }));
    } finally {
      setSendingContactId(null);
    }
  };

  const handleMakeEmergencyCall = async (contact) => {
    if (!contact.phone) return;
    setCallingContactId(contact.id);
    try {
      const res = await api.makeEmergencyCall(contact.phone);
      if (res.success && res.data) {
        const isLive = res.data.metadata?.deliveryStatus === 'CALL_INITIATED';
        setCallFeedback(prev => ({
          ...prev,
          [contact.id]: {
            status: isLive ? 'SUCCESS' : 'SIMULATED',
            sid: res.data.metadata?.callSid || 'SIMULATED',
            deliveryStatus: res.data.metadata?.deliveryStatus || 'INITIATED',
            error: res.data.metadata?.callError,
            time: new Date().toLocaleTimeString()
          }
        }));
      } else {
        setCallFeedback(prev => ({
          ...prev,
          [contact.id]: {
            status: 'ERROR',
            error: res.error || 'Failed to initiate call'
          }
        }));
      }
    } catch (err) {
      setCallFeedback(prev => ({
        ...prev,
        [contact.id]: {
          status: 'ERROR',
          error: err.message
        }
      }));
    } finally {
      setCallingContactId(null);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 20px 100px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#ffffff' }}>
            Trusted Emergency Contacts
          </h1>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>
            These contacts receive automated WhatsApp, Phone Calls, SMS &amp; Email alerts when you trigger SOS.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
          style={{ padding: '10px 18px', fontSize: '13px' }}
        >
          <UserPlus size={16} /> Add Trusted Contact
        </button>
      </div>

      {/* Twilio Live Gateway Indicator Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.12), rgba(59, 130, 246, 0.12), rgba(15, 23, 42, 0.85))',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: '#3b82f6',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '900',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)'
          }}>
            <PhoneCall size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '14px', fontWeight: '900', color: '#ffffff' }}>
                Twilio WhatsApp &amp; Voice Call Gateway Active
              </span>
              <span style={{
                background: '#25D36625',
                color: '#25D366',
                border: '1px solid #25D366',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '800'
              }}>
                AUTO WHATSAPP
              </span>
              <span style={{
                background: '#3b82f625',
                color: '#60a5fa',
                border: '1px solid #3b82f6',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '10px',
                fontWeight: '800'
              }}>
                AUTO PHONE CALL
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '4px 0 0 0' }}>
              Caller: <strong style={{ color: '#ffffff' }}>+17372508034</strong> &bull; Emergency SOS alerts trigger automated voice phone calls and WhatsApp messages with live GPS link simultaneously.
            </p>
          </div>
        </div>
      </div>

      {/* 🚨 SEND EMERGENCY ALERT TO ALL CONTACTS - BIG ACTION CARD */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(15, 23, 42, 0.9))',
        border: '2px solid rgba(239, 68, 68, 0.5)',
        borderRadius: '14px',
        padding: '20px 24px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <Bell size={20} color="#ef4444" />
              <span style={{ fontSize: '16px', fontWeight: '900', color: '#ffffff' }}>
                Emergency Alert All Contacts (Calls + WhatsApp)
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
              <MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />
              {' '}GPS: {userLocation?.latitude?.toFixed(4) || '26.9124'}, {userLocation?.longitude?.toFixed(4) || '75.7873'}
              {' '}&bull; WhatsApp + Voice Calls + SMS + Email to {contacts.length} contacts
            </p>
          </div>

          <button
            type="button"
            onClick={handleBulkEmergencyAlert}
            disabled={sendingBulkAlert || contacts.length === 0}
            style={{
              background: sendingBulkAlert ? '#1e293b' : '#ef4444',
              color: sendingBulkAlert ? '#94a3b8' : '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '900',
              cursor: sendingBulkAlert ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: sendingBulkAlert ? 'none' : '0 0 20px rgba(239, 68, 68, 0.4)',
              transition: 'all 0.2s',
              letterSpacing: '0.03em'
            }}
          >
            {sendingBulkAlert ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Dispatching to All...
              </>
            ) : (
              <>
                <Zap size={16} />
                🚨 SEND ALERT TO ALL
              </>
            )}
          </button>
        </div>

        {/* Bulk Alert Result Display */}
        {bulkAlertResult && (
          <div style={{
            marginTop: '14px',
            padding: '14px 16px',
            borderRadius: '10px',
            background: bulkAlertResult.status === 'SUCCESS' ? 'rgba(37, 211, 102, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${bulkAlertResult.status === 'SUCCESS' ? '#25D366' : '#ef4444'}`
          }}>
            {bulkAlertResult.status === 'SUCCESS' ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <CheckCircle2 size={16} color="#25D366" />
                  <span style={{ fontSize: '14px', fontWeight: '800', color: '#25D366' }}>
                    {bulkAlertResult.message}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>
                  <div>📊 Total dispatched: <strong style={{ color: '#fff' }}>{bulkAlertResult.data?.totalDispatched || 0}</strong></div>
                  <div>✅ Successful: <strong style={{ color: '#25D366' }}>{bulkAlertResult.data?.successful || 0}</strong></div>
                  <div>📍 Location sent: <a href={bulkAlertResult.data?.locationSent} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>{bulkAlertResult.data?.locationSent}</a></div>
                  <div>⏰ At: {bulkAlertResult.time}</div>
                  {bulkAlertResult.data?.contacts && (
                    <div style={{ marginTop: '6px' }}>
                      <strong style={{ color: '#cbd5e1' }}>Alerted contacts:</strong>
                      {bulkAlertResult.data.contacts.map((c, i) => (
                        <span key={i} style={{
                          display: 'inline-block',
                          background: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          padding: '2px 8px',
                          margin: '3px 4px 0 0',
                          fontSize: '11px',
                          color: '#e2e8f0'
                        }}>
                          {c.name} ({c.relationship})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} color="#ef4444" />
                <span style={{ fontSize: '13px', color: '#ef4444' }}>{bulkAlertResult.error}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <SafetyNotice />

      {/* Add Modal / Form */}
      {showAddModal && (
        <form onSubmit={handleAddContact} className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', marginBottom: '16px' }}>
            Add New Guardian / Contact
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Sunita Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: 'white' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Phone (SMS Alert)</label>
              <input
                type="tel"
                required
                placeholder="+91 98290 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: 'white' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Email</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: 'white' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Relationship</label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: 'white' }}
              >
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Spouse">Spouse</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn-success" style={{ padding: '8px 16px', fontSize: '13px' }}>
              Save Contact
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Contacts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {contacts.map(c => (
          <div
            key={c.id}
            className="glass-card"
            style={{
              padding: '18px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Heart size={20} color="#ef4444" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                    {c.name}
                  </span>
                  <span style={{
                    background: '#0f172a',
                    border: '1px solid #334155',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    color: '#38bdf8'
                  }}>
                    {c.relationship}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Phone size={13} /> {c.phone}
                  </span>
                  {c.email && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={13} /> {c.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* WhatsApp Live Status or Action */}
              {c.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {sendFeedback[c.id] && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: sendFeedback[c.id].status === 'SUCCESS' ? 'rgba(37, 211, 102, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: `1px solid ${sendFeedback[c.id].status === 'SUCCESS' ? '#25D366' : '#ef4444'}`,
                      color: sendFeedback[c.id].status === 'SUCCESS' ? '#25D366' : '#ef4444'
                    }}>
                      {sendFeedback[c.id].status === 'SUCCESS' ? (
                        <>
                          <CheckCircle2 size={12} />
                          Dispatched via Twilio ({sendFeedback[c.id].sid.substring(0, 8)}...)
                        </>
                      ) : (
                        <>
                          <AlertCircle size={12} />
                          {sendFeedback[c.id].error}
                        </>
                      )}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => handleSendAutomaticWhatsApp(c)}
                    disabled={sendingContactId === c.id}
                    style={{
                      background: sendingContactId === c.id ? '#1e293b' : '#25D366',
                      color: sendingContactId === c.id ? '#94a3b8' : '#000000',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '7px 12px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: sendingContactId === c.id ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                    title="Send real automatic emergency WhatsApp alert via Twilio server API"
                  >
                    {sendingContactId === c.id ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Auto-Sending...
                      </>
                    ) : (
                      <>
                        <Zap size={13} />
                        Test Auto-WhatsApp
                      </>
                    )}
                  </button>

                  {/* Voice Call Feedback */}
                  {callFeedback[c.id] && (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      background: callFeedback[c.id].status === 'SUCCESS' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: `1px solid ${callFeedback[c.id].status === 'SUCCESS' ? '#3b82f6' : '#ef4444'}`,
                      color: callFeedback[c.id].status === 'SUCCESS' ? '#60a5fa' : '#ef4444'
                    }}>
                      {callFeedback[c.id].status === 'SUCCESS' ? (
                        <>
                          <PhoneCall size={12} />
                          Call Queued ({callFeedback[c.id].sid.substring(0, 8)}...)
                        </>
                      ) : (
                        <>
                          <AlertCircle size={12} />
                          {callFeedback[c.id].error || 'Call Simulated'}
                        </>
                      )}
                    </span>
                  )}

                  {/* Test Auto-Call Button */}
                  <button
                    type="button"
                    onClick={() => handleMakeEmergencyCall(c)}
                    disabled={callingContactId === c.id}
                    style={{
                      background: callingContactId === c.id ? '#1e293b' : '#3b82f6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '7px 12px',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: callingContactId === c.id ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                    title="Initiate real automated emergency voice call via Twilio Voice API"
                  >
                    {callingContactId === c.id ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Calling...
                      </>
                    ) : (
                      <>
                        <PhoneCall size={13} />
                        Test Auto-Call
                      </>
                    )}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleDelete(c.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  padding: '8px'
                }}
                title="Remove contact"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
