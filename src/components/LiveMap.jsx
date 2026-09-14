import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, MapPin, Ambulance, Building2, Navigation, ZoomIn, ZoomOut, Crosshair, Compass, Eye, HeartPulse, Flame, Siren, ShieldAlert, Radio } from 'lucide-react';

// Helper to compute bearing angle between two lat/lon pairs in degrees
function computeBearing(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

export default function LiveMap({
  userLocation = { latitude: 26.9124, longitude: 75.7873, accuracy: 18, cityName: 'Live Location' },
  responderLocation = { latitude: 26.9240, longitude: 75.8010, name: 'Ambulance A102' },
  hospitalLocation = { latitude: 26.8928, longitude: 75.8118, name: 'SMS Medical College & Trauma Hospital, Jaipur' },
  height = '420px',
  showRoute = true,
  isLiveTracking = false,
  transitPhase = 'TO_VICTIM', // 'TO_VICTIM' | 'TO_HOSPITAL' | 'AT_HOSPITAL'
  category = 'ACCIDENT',     // 'FIRE' | 'POLICE' | 'CRIME' | 'ACCIDENT' | 'MEDICAL' | 'DISASTER'
  customAddress = ''
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const victimMarkerRef = useRef(null);
  const accuracyCircleRef = useRef(null);
  const responderMarkerRef = useRef(null);
  const hospitalMarkerRef = useRef(null);
  const routeLineRef = useRef(null);

  const [mapStyle, setMapStyle] = useState('STREETS'); // 'STREETS' | 'SATELLITE'
  const [autoFollow, setAutoFollow] = useState(true);
  const [vehicleBearing, setVehicleBearing] = useState(0);

  // Initialize Real Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = userLocation.latitude || 26.9124;
      const initialLon = userLocation.longitude || 75.7873;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLon],
        zoom: 15,
        zoomControl: false,
        attributionControl: false
      });

      // Default: Real OpenStreetMap Tiles
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: 'abc'
      }).addTo(map);

      mapInstanceRef.current = map;

      // Force recalculation of container size after mounting
      const timer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);

      const handleResize = () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      };
      window.addEventListener('resize', handleResize);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          victimMarkerRef.current = null;
          accuracyCircleRef.current = null;
          responderMarkerRef.current = null;
          hospitalMarkerRef.current = null;
          routeLineRef.current = null;
        }
      };
    }
  }, []);

  // Handle Tile Style Switch (Real Streets vs Real Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (mapStyle === 'SATELLITE') {
      tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19
      }).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: 'abc'
      }).addTo(map);
    }
  }, [mapStyle]);

  // Update Markers, Accuracy Circle, Route, and Dynamic Visuals
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const userLat = userLocation.latitude || 26.9124;
    const userLon = userLocation.longitude || 75.7873;
    const respLat = responderLocation.latitude || 26.9240;
    const respLon = responderLocation.longitude || 75.8010;
    const hospLat = hospitalLocation.latitude || 26.8928;
    const hospLon = hospitalLocation.longitude || 75.8118;

    const isHospitalTransit = transitPhase === 'TO_HOSPITAL' || transitPhase === 'AT_HOSPITAL';

    // Calculate dynamic bearing angle
    const bearing = isHospitalTransit
      ? computeBearing(respLat, respLon, hospLat, hospLon)
      : computeBearing(respLat, respLon, userLat, userLon);
    setVehicleBearing(bearing);

    // ==========================================
    // 1. VICTIM PIN: Category-specific icon & pulse
    // ==========================================
    let victimPulseColor = '#ef4444';
    let victimGradient = 'linear-gradient(135deg, #ef4444, #b91c1c)';
    let victimLabel = '📍 YOU (LIVE GPS)';
    let victimSvg = `<circle cx="12" cy="12" r="7"/>`;

    if (category === 'FIRE') {
      victimPulseColor = '#ea580c';
      victimGradient = 'linear-gradient(135deg, #ea580c, #9a3412)';
      victimLabel = '🔥 FIRE INCIDENT SPOT';
      victimSvg = `<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>`;
    } else if (category === 'CRIME' || category === 'POLICE') {
      victimPulseColor = '#2563eb';
      victimGradient = 'linear-gradient(135deg, #2563eb, #1e3a8a)';
      victimLabel = '🚨 POLICE DISTRESS SPOT';
      victimSvg = `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`;
    } else if (category === 'DISASTER') {
      victimPulseColor = '#d97706';
      victimGradient = 'linear-gradient(135deg, #d97706, #78350f)';
      victimLabel = '🌪️ RESCUE DISTRESS SPOT';
      victimSvg = `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>`;
    }

    const victimIcon = L.divIcon({
      className: 'custom-victim-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          ${!isHospitalTransit ? `
            <div style="
              position: absolute;
              top: -6px;
              width: 50px;
              height: 50px;
              border-radius: 50%;
              border: 3px solid ${victimPulseColor};
              background: ${victimPulseColor}33;
              animation: pulse-emergency 1.6s infinite;
            "></div>
          ` : ''}

          <div style="
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: ${victimGradient};
            border: 2.5px solid #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(0,0,0,0.6);
            color: #ffffff;
            z-index: 2;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              ${victimSvg}
            </svg>
          </div>

          <div style="
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid ${victimPulseColor}99;
            color: #ffffff;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 800;
            margin-top: 5px;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(0,0,0,0.6);
            z-index: 2;
          ">
            ${isHospitalTransit ? '📍 INCIDENT SCENE' : victimLabel}
          </div>
        </div>
      `,
      iconSize: [40, 58],
      iconAnchor: [20, 29]
    });

    if (!victimMarkerRef.current) {
      victimMarkerRef.current = L.marker([userLat, userLon], { icon: victimIcon, zIndexOffset: 1000 }).addTo(map);
      victimMarkerRef.current.bindPopup(`
        <div style="font-size: 12px; line-height: 1.5; color: #0f172a; min-width: 180px;">
          <strong style="color: ${victimPulseColor}; font-size: 13px;">${victimLabel}</strong><br/>
          <strong>Lat:</strong> ${userLat.toFixed(5)}, <strong>Lon:</strong> ${userLon.toFixed(5)}<br/>
          <strong>GPS Accuracy:</strong> &plusmn;${userLocation.accuracy || 15}m<br/>
          <span style="color: #475569; font-size: 11px;">${customAddress || userLocation.cityName || 'Incident Spot'}</span>
        </div>
      `);
    } else {
      victimMarkerRef.current.setLatLng([userLat, userLon]);
      victimMarkerRef.current.setIcon(victimIcon);
    }

    // 2. GPS Accuracy Circle
    const accuracyRadius = Math.max(12, userLocation.accuracy || 20);
    if (!accuracyCircleRef.current) {
      accuracyCircleRef.current = L.circle([userLat, userLon], {
        radius: accuracyRadius,
        color: '#38bdf8',
        weight: 1.5,
        fillColor: '#38bdf8',
        fillOpacity: 0.15
      }).addTo(map);
    } else {
      accuracyCircleRef.current.setLatLng([userLat, userLon]);
      accuracyCircleRef.current.setRadius(accuracyRadius);
    }

    // ==========================================
    // 3. RESPONDER PIN: Category-specific Vehicle
    // ==========================================
    let respGradient = 'linear-gradient(135deg, #10b981, #047857)';
    let respBorderColor = '#10b981';
    let respPointerColor = '#34d399';
    let respLabel = responderLocation.name || 'Ambulance A102';
    let respSvg = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7h2"/>
        <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
      </svg>
    `;

    if (category === 'FIRE') {
      respGradient = 'linear-gradient(135deg, #ea580c, #9a3412)';
      respBorderColor = '#f97316';
      respPointerColor = '#fb923c';
      respLabel = '🚒 Fire Tender FT-09 (Fire Brigade)';
      respSvg = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <rect width="17" height="12" x="3" y="6" rx="2"/>
          <circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
          <path d="M8 2v4M16 2v4M8 10h8"/>
        </svg>
      `;
    } else if (category === 'CRIME' || category === 'POLICE') {
      respGradient = 'linear-gradient(135deg, #2563eb, #1e3a8a)';
      respBorderColor = '#3b82f6';
      respPointerColor = '#60a5fa';
      respLabel = '🚓 Police PCR Cheetah-04';
      respSvg = `
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7h2"/>
          <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
          <path d="M10 5h4M12 3v2"/>
        </svg>
      `;
    } else if (category === 'DISASTER') {
      respGradient = 'linear-gradient(135deg, #d97706, #78350f)';
      respBorderColor = '#f59e0b';
      respPointerColor = '#fbbf24';
      respLabel = '🌪️ SDRF Rescue Unit R-02';
    }

    if (isHospitalTransit && (category === 'MEDICAL' || category === 'ACCIDENT')) {
      respLabel = '🚑 A102 (PATIENT EN ROUTE TO SMS HOSPITAL)';
    }

    const responderIcon = L.divIcon({
      className: 'custom-responder-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="
            position: absolute;
            top: -6px;
            width: 52px;
            height: 52px;
            border-radius: 50%;
            border: 3px solid ${respBorderColor};
            background: ${respBorderColor}33;
            animation: pulse-emergency 1.5s infinite;
          "></div>

          <div style="
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: ${respGradient};
            border: 2.5px solid #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 18px rgba(0,0,0,0.7);
            color: #ffffff;
            position: relative;
            z-index: 3;
          ">
            ${respSvg}
            <div style="
              position: absolute;
              top: -6px;
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-bottom: 9px solid ${respPointerColor};
              transform: rotate(${Math.round(bearing)}deg);
              transform-origin: 50% 27px;
            "></div>
          </div>

          <div style="
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid ${respBorderColor};
            color: #ffffff;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 800;
            margin-top: 4px;
            white-space: nowrap;
            box-shadow: 0 2px 10px rgba(0,0,0,0.6);
            z-index: 3;
          ">
            ${respLabel}
          </div>
        </div>
      `,
      iconSize: [44, 62],
      iconAnchor: [22, 31]
    });

    if (!responderMarkerRef.current) {
      responderMarkerRef.current = L.marker([respLat, respLon], { icon: responderIcon, zIndexOffset: 950 }).addTo(map);
      responderMarkerRef.current.bindPopup(`
        <div style="font-size: 12px; line-height: 1.5; color: #0f172a;">
          <strong style="color: ${respBorderColor}; font-size: 13px;">${respLabel}</strong><br/>
          <strong>Status:</strong> Active Emergency Run &bull; Siren Clear<br/>
          <strong>Speed:</strong> ~54 km/h<br/>
          <strong>Destination:</strong> ${isHospitalTransit ? 'SMS Hospital' : 'Distress Coordinates'}
        </div>
      `);
    } else {
      responderMarkerRef.current.setLatLng([respLat, respLon]);
      responderMarkerRef.current.setIcon(responderIcon);
    }

    // ==========================================
    // 4. FACILITY PIN: Category-specific Destination/Base
    // ==========================================
    let facilityGradient = 'linear-gradient(135deg, #0284c7, #0369a1)';
    let facilityLabel = '🏥 SMS Medical College & Trauma Hospital';
    let facilityBorder = '#38bdf8';
    let facilitySvg = `<path d="M19 10.5V8a2 2 0 0 0-2-2h-3V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3H7a2 2 0 0 0-2 2v2.5M12 9v12m-5-6h10"/>`;

    if (category === 'FIRE') {
      facilityGradient = 'linear-gradient(135deg, #c2410c, #7c2d12)';
      facilityLabel = '🚒 Central Fire Station (Station 4)';
      facilityBorder = '#ea580c';
      facilitySvg = `<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 12h6M12 9v6"/>`;
    } else if (category === 'CRIME' || category === 'POLICE') {
      facilityGradient = 'linear-gradient(135deg, #1d4ed8, #172554)';
      facilityLabel = '🚓 MI Road Police Station';
      facilityBorder = '#3b82f6';
      facilitySvg = `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`;
    }

    const facilityIcon = L.divIcon({
      className: 'custom-facility-marker',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          ${isHospitalTransit ? `
            <div style="
              position: absolute;
              top: -6px;
              width: 50px;
              height: 50px;
              border-radius: 50%;
              border: 3px solid ${facilityBorder};
              background: ${facilityBorder}44;
              animation: pulse-emergency 1.5s infinite;
            "></div>
          ` : ''}

          <div style="
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: ${facilityGradient};
            border: 2.5px solid #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 18px rgba(0,0,0,0.6);
            color: #ffffff;
            z-index: 2;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              ${facilitySvg}
            </svg>
          </div>
          <div style="
            background: rgba(15, 23, 42, 0.95);
            border: 1px solid ${facilityBorder};
            color: #ffffff;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 800;
            margin-top: 4px;
            white-space: nowrap;
            box-shadow: 0 2px 10px rgba(0,0,0,0.6);
            z-index: 2;
          ">
            ${facilityLabel}
          </div>
        </div>
      `,
      iconSize: [42, 60],
      iconAnchor: [21, 30]
    });

    if (!hospitalMarkerRef.current) {
      hospitalMarkerRef.current = L.marker([hospLat, hospLon], { icon: facilityIcon, zIndexOffset: 900 }).addTo(map);
      hospitalMarkerRef.current.bindPopup(`
        <div style="font-size: 12px; line-height: 1.5; color: #0f172a; min-width: 200px;">
          <strong style="color: ${facilityBorder}; font-size: 13px;">${facilityLabel}</strong><br/>
          <strong>Location:</strong> JLN Marg / MI Road Sector, Jaipur<br/>
          <strong>Status:</strong> 24x7 Emergency Command Active
        </div>
      `);
    } else {
      hospitalMarkerRef.current.setLatLng([hospLat, hospLon]);
      hospitalMarkerRef.current.setIcon(facilityIcon);
    }

    // 5. Dynamic Route Polyline
    if (showRoute) {
      const points = isHospitalTransit
        ? [ [respLat, respLon], [hospLat, hospLon] ]
        : [ [respLat, respLon], [userLat, userLon] ];

      const routeColor = category === 'FIRE' ? '#ea580c' : (category === 'POLICE' || category === 'CRIME' ? '#3b82f6' : '#10b981');

      if (!routeLineRef.current) {
        routeLineRef.current = L.polyline(points, {
          color: routeColor,
          weight: 4.5,
          dashArray: '8, 8',
          opacity: 0.95
        }).addTo(map);
      } else {
        routeLineRef.current.setLatLngs(points);
        routeLineRef.current.setStyle({ color: routeColor });
      }
    }

    // 6. Camera Follow
    if (autoFollow && isLiveTracking) {
      if (isHospitalTransit) {
        const bounds = L.latLngBounds([[respLat, respLon], [hospLat, hospLon]]);
        map.fitBounds(bounds, { padding: [55, 55], maxZoom: 16, animate: true, duration: 0.7 });
      } else {
        const bounds = L.latLngBounds([[userLat, userLon], [respLat, respLon]]);
        map.fitBounds(bounds, { padding: [55, 55], maxZoom: 16, animate: true, duration: 0.7 });
      }
    } else if (!isLiveTracking && userLocation.isRealGps) {
      map.panTo([userLat, userLon], { animate: true });
    }
  }, [userLocation, responderLocation, hospitalLocation, showRoute, autoFollow, isLiveTracking, transitPhase, category, customAddress]);

  const handleCenterOnMe = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.latitude, userLocation.longitude], 16, { animate: true });
    }
  };

  const handleCenterOnAmbulance = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([responderLocation.latitude, responderLocation.longitude], 16, { animate: true });
    }
  };

  const handleCenterOnHospital = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([hospitalLocation.latitude, hospitalLocation.longitude], 16, { animate: true });
    }
  };

  const handleFitAll = () => {
    if (mapInstanceRef.current) {
      const bounds = L.latLngBounds([
        [userLocation.latitude, userLocation.longitude],
        [responderLocation.latitude, responderLocation.longitude],
        [hospitalLocation.latitude, hospitalLocation.longitude]
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [45, 45], animate: true });
    }
  };

  // Category title for top badge
  const getTelemetryBadge = () => {
    if (category === 'FIRE') {
      return (
        <div style={{
          background: 'rgba(234, 88, 12, 0.25)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #ea580c',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '11px',
          fontWeight: '800',
          color: '#fb923c',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
        }}>
          <Flame size={14} />
          <span>FIRE TENDER FT-09 &bull; 4,500L Water Foam &bull; Speed: 56 km/h</span>
        </div>
      );
    }
    if (category === 'CRIME' || category === 'POLICE') {
      return (
        <div style={{
          background: 'rgba(37, 99, 235, 0.25)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #3b82f6',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '11px',
          fontWeight: '800',
          color: '#60a5fa',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
        }}>
          <Siren size={14} />
          <span>POLICE PCR CHEETAH-04 &bull; Code 3 Intercept &bull; Speed: 62 km/h</span>
        </div>
      );
    }
    if (transitPhase === 'TO_HOSPITAL') {
      return (
        <div style={{
          background: 'rgba(2, 132, 199, 0.25)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #38bdf8',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '11px',
          fontWeight: '800',
          color: '#38bdf8',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
        }}>
          <Building2 size={14} />
          <span>Destination: SMS Medical College &amp; Trauma Hospital (Speed: 52 km/h)</span>
        </div>
      );
    }
    if (isLiveTracking) {
      return (
        <div style={{
          background: 'rgba(16, 185, 129, 0.2)',
          backdropFilter: 'blur(8px)',
          border: '1px solid #10b981',
          borderRadius: '8px',
          padding: '6px 10px',
          fontSize: '11px',
          fontWeight: '800',
          color: '#34d399',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Ambulance size={14} />
          <span>Speed: 46 km/h &bull; En Route to Victim</span>
        </div>
      );
    }
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.9)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '6px 10px',
        fontSize: '11px',
        fontWeight: '700',
        color: '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
      }}>
        <Compass size={13} color="#38bdf8" />
        <span>Sector Radar Active</span>
      </div>
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', height, borderRadius: '14px', overflow: 'hidden', border: '1px solid #334155' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', background: '#0b1120' }} />

      {/* Top Left Live Status Telemetry Bar */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        background: 'rgba(11, 17, 32, 0.94)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '6px 12px',
        fontSize: '11px',
        fontWeight: '700',
        color: '#f8fafc',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
      }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: category === 'FIRE' ? '#ea580c' : (category === 'POLICE' || category === 'CRIME' ? '#3b82f6' : (transitPhase === 'TO_HOSPITAL' ? '#0284c7' : '#10b981')),
          display: 'inline-block'
        }} className="pulse-emergency" />
        <span>
          {category === 'FIRE' ? '🔥 FIRE SECTOR RADAR ACTIVE' : (category === 'POLICE' ? '🚓 POLICE SECTOR RADAR' : (transitPhase === 'TO_HOSPITAL' ? 'LIVE TRANSIT: SMS Hospital' : `Live GPS: Lat ${userLocation.latitude?.toFixed(4)}, Lon ${userLocation.longitude?.toFixed(4)}`))}
        </span>
      </div>

      {/* Top Right Live Transit Telemetry Badge */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        display: 'flex',
        gap: '6px',
        zIndex: 500
      }}>
        {getTelemetryBadge()}
      </div>

      {/* Bottom Controls */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        right: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 500
      }}>
        <div style={{
          display: 'flex',
          background: 'rgba(15, 23, 42, 0.94)',
          border: '1px solid #334155',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
          <button
            type="button"
            onClick={() => setMapStyle('STREETS')}
            style={{
              background: mapStyle === 'STREETS' ? '#0284c7' : 'transparent',
              color: mapStyle === 'STREETS' ? '#ffffff' : '#94a3b8',
              border: 'none',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            Real Streets
          </button>
          <button
            type="button"
            onClick={() => setMapStyle('SATELLITE')}
            style={{
              background: mapStyle === 'SATELLITE' ? '#0284c7' : 'transparent',
              color: mapStyle === 'SATELLITE' ? '#ffffff' : '#94a3b8',
              border: 'none',
              padding: '6px 10px',
              fontSize: '11px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            Real Satellite
          </button>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(15, 23, 42, 0.94)',
          border: '1px solid #334155',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
          <button
            type="button"
            onClick={handleCenterOnMe}
            style={{ background: 'none', border: 'none', color: '#ef4444', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Focus Incident Spot"
          >
            <Crosshair size={16} />
          </button>
          <button
            type="button"
            onClick={handleCenterOnAmbulance}
            style={{ background: 'none', border: 'none', color: '#10b981', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid #334155' }}
            title="Focus Responder"
          >
            <Ambulance size={16} />
          </button>
          <button
            type="button"
            onClick={handleCenterOnHospital}
            style={{ background: 'none', border: 'none', color: '#0284c7', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid #334155' }}
            title="Focus Facility"
          >
            <Building2 size={16} />
          </button>
          <button
            type="button"
            onClick={handleFitAll}
            style={{ background: 'none', border: 'none', color: '#38bdf8', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid #334155' }}
            title="View Entire Route"
          >
            <Navigation size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
