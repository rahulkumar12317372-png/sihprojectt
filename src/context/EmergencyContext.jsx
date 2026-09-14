import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const EmergencyContext = createContext();

export function EmergencyProvider({ children }) {
  const [activeIncident, setActiveIncident] = useState(null);
  const [liveLocations, setLiveLocations] = useState([]);
  const [userLocation, setUserLocation] = useState({
    latitude: 26.9124,
    longitude: 75.7873,
    accuracy: 8.5,
    address: 'MI Road, Jaipur, Rajasthan',
    permission: 'GRANTED'
  });
  const [isSimulatingDemo, setIsSimulatingDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  // Request browser geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // If in India or local coords available, use them or keep Jaipur as fallback
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
            address: 'Detected GPS Location',
            permission: 'GRANTED'
          });
        },
        () => {
          // Default to Jaipur reference coordinates for consistent emergency demo
          setUserLocation({
            latitude: 26.9124,
            longitude: 75.7873,
            accuracy: 5.0,
            address: 'Jaipur, Rajasthan (Demo Location)',
            permission: 'DENIED_FALLBACK'
          });
        }
      );
    }
  }, []);

  // Subscribe to backend live location & status stream
  useEffect(() => {
    let eventSource = null;
    try {
      const streamBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';
      eventSource = new EventSource(`${streamBase}/api/stream/live-tracking`);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.locations) setLiveLocations(data.locations);
          if (data.activeIncident && (!activeIncident || activeIncident.id === data.activeIncident.id)) {
            setActiveIncident(prev => ({ ...(prev || {}), ...data.activeIncident }));
          }
        } catch (e) {
          console.error('SSE parse error', e);
        }
      };
      eventSource.onerror = () => {
        if (eventSource) eventSource.close();
      };
    } catch (err) {
      console.warn('SSE stream not available, using polling');
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [activeIncident?.id]);

  // Initial fetch of active incident
  const refreshActiveIncident = async (id) => {
    if (!id) return;
    try {
      const res = await api.getIncident(id);
      if (res.success && res.data) {
        setActiveIncident(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  /**
   * Complete Jaipur Demo Scenario Simulator
   * Runs the exact presentation flow:
   * 1. SOS Triggered
   * 2. Description: Serious bike accident, unconscious & bleeding
   * 3. AI Triage -> CRITICAL / ACCIDENT
   * 4. Nearest Responder -> A102 (1.7 km, 5 min)
   * 5. Accepted -> ON THE WAY
   * 6. Live movement simulation
   * 7. ARRIVED
   * 8. RESOLVED -> 4m 32s
   */
  const runFullDemoSimulation = async (navigate) => {
    setIsSimulatingDemo(true);
    setDemoStep(1);

    // Step 1: Create incident in Jaipur
    const createRes = await api.createIncident({
      userId: 'usr_rahul_01',
      latitude: 26.9124,
      longitude: 75.7873,
      description: 'There has been a serious bike accident. One person is unconscious and another is bleeding.',
      category: 'ACCIDENT',
      severity: 'CRITICAL',
      suggestedServices: ['AMBULANCE', 'HOSPITAL', 'POLICE'],
      aiReason: 'Reported unconscious and bleeding person following vehicle crash'
    });

    const incident = createRes.data;
    setActiveIncident(incident);
    if (navigate) navigate(`/emergency/${incident.id}`);

    // Step 2: AI analyzing state
    setDemoStep(2);
    await api.updateIncident(incident.id, { status: 'AI_ANALYZING' });
    await new Promise(r => setTimeout(r, 1800));

    // Step 3: Searching responder
    setDemoStep(3);
    await api.updateIncident(incident.id, { status: 'SEARCHING_RESPONDER' });
    await new Promise(r => setTimeout(r, 1800));

    // Step 4: Responder A102 Assigned & Accepted
    setDemoStep(4);
    await api.updateIncident(incident.id, {
      responderId: 'resp_a102',
      status: 'RESPONDER_ACCEPTED',
      acceptedAt: new Date().toISOString()
    });
    await new Promise(r => setTimeout(r, 2000));

    // Step 5: On the way
    setDemoStep(5);
    await api.updateIncident(incident.id, { status: 'ON_THE_WAY' });
    await new Promise(r => setTimeout(r, 3500));

    // Step 6: Arrived
    setDemoStep(6);
    await api.updateIncident(incident.id, {
      status: 'ARRIVED',
      arrivedAt: new Date().toISOString(),
      responseTime: '4m 32s'
    });
    await new Promise(r => setTimeout(r, 3000));

    // Step 7: Resolved
    setDemoStep(7);
    await api.updateIncident(incident.id, {
      status: 'RESOLVED',
      resolvedAt: new Date().toISOString(),
      responseTime: '4m 32s'
    });

    setIsSimulatingDemo(false);
  };

  const resetIncident = () => {
    setActiveIncident(null);
    setDemoStep(0);
    setIsSimulatingDemo(false);
  };

  return (
    <EmergencyContext.Provider
      value={{
        activeIncident,
        setActiveIncident,
        liveLocations,
        userLocation,
        setUserLocation,
        refreshActiveIncident,
        runFullDemoSimulation,
        resetIncident,
        isSimulatingDemo,
        demoStep
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  return useContext(EmergencyContext);
}
