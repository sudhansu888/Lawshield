import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Phone, 
  Navigation, 
  ShieldAlert, 
  Search, 
  Hospital, 
  Compass, 
  ExternalLink,
  LocateFixed
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const NearbyHelpMap = () => {
  const { showToast } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [userLocation, setUserLocation] = useState({ lat: 28.6139, lng: 77.2090 });

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Fetch nearby help from backend
  const fetchNearby = async (lat, lng) => {
    try {
      setLoading(true);
      const res = await api.get('/emergency/nearby', {
        params: {
          lat,
          lng,
          type: selectedType !== 'All' ? selectedType : undefined,
        },
      });
      if (res.data.success) {
        setResources(res.data.resources);
      }
    } catch (err) {
      console.warn('Nearby resources fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Geolocation & Map
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          fetchNearby(loc.lat, loc.lng);
        },
        () => {
          fetchNearby(28.6139, 77.2090);
        },
        { timeout: 5000 }
      );
    } else {
      fetchNearby(28.6139, 77.2090);
    }
  }, [selectedType]);

  // Leaflet Map Rendering
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([userLocation.lat, userLocation.lng], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 13);
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // User Location Marker (Blue Pulse)
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `<div style="background-color: #3b82f6; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px #3b82f6;"></div>`,
      iconSize: [18, 18],
    });

    const userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup('<strong>You are here</strong><br/>Live GPS Position');
    markersRef.current.push(userMarker);

    // Safety Resources Markers
    resources.forEach((r) => {
      let color = '#ef4444'; // Police
      if (r.type.includes('Women')) color = '#f43f5e';
      if (r.type.includes('Hospital')) color = '#10b981';

      const icon = L.divIcon({
        className: 'custom-help-marker',
        html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px ${color};"></div>`,
        iconSize: [16, 16],
      });

      const marker = L.marker([r.lat, r.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px;">
            <strong>${r.name}</strong><br/>
            <span style="color: #666;">${r.type}</span><br/>
            <span>Distance: <strong>${r.distanceKm} km</strong></span><br/>
            <a href="tel:${r.phone}" style="color: #2563eb; font-weight: bold;">📞 Call: ${r.phone}</a><br/>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}" target="_blank" style="color: #10b981;">📍 Get Directions</a>
          </div>
        `);

      markersRef.current.push(marker);
    });
  }, [resources, userLocation]);

  const handleCenterUser = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLocation.lat, userLocation.lng], 14);
      showToast('Centered on your GPS position', 'info');
    }
  };

  const types = ['All', 'Police', 'Women', 'Hospital'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-extrabold text-[#854d0e] bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-2">
            <Compass size={14} className="text-[#854d0e]" />
            <span>OpenStreetMap Geospatial Safety Radar</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight">
            Nearby Emergency Help & Stations
          </h1>
          <p className="text-xs sm:text-sm text-slate-800 mt-1 font-medium">
            Real-time proximity locator for 24/7 Police Stations, Women Safety Desks, and Trauma Centers.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleCenterUser}
            className="bg-stone-100 hover:bg-stone-200 text-slate-900 text-xs font-bold px-4 py-2.5 rounded-xl border border-stone-300 transition flex items-center space-x-1.5 shadow-xs"
          >
            <LocateFixed size={14} className="text-[#854d0e]" />
            <span>My GPS Location</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {types.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
              selectedType === type
                ? 'bg-[#0f172a] text-white'
                : 'bg-stone-100 text-slate-800 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            {type === 'All' ? 'All Safety Stations' : type}
          </button>
        ))}
      </div>

      {/* Map & Listings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive Map (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border-2 border-stone-200 overflow-hidden shadow-sm h-[570px] relative">
          <div
            ref={mapContainerRef}
            className="w-full h-full rounded-3xl z-0"
          />

          {/* Quick Info Overlay */}
          <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md border border-stone-300 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-900 shadow-sm flex items-center space-x-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
            <span>GPS: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
          </div>
        </div>

        {/* Resources List (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border-2 border-stone-200 p-4 space-y-3 h-[570px] flex flex-col shadow-sm">
          <div className="border-b border-stone-200 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#0f172a]">
              Nearby Safety Facilities ({resources.length})
            </h3>
            <span className="text-[10px] text-slate-600 font-bold">Sorted by Nearest</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {resources.map((res) => (
              <div
                key={res._id}
                className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 hover:border-stone-400 transition space-y-2 text-xs shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-[#0f172a] leading-tight">{res.name}</h4>
                    <span className="text-[10px] text-[#854d0e] font-bold">{res.type}</span>
                  </div>
                  <span className="text-[11px] font-black text-emerald-800 font-mono bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 shrink-0">
                    {res.distanceKm} km
                  </span>
                </div>

                <p className="text-[11px] text-slate-700 line-clamp-1 font-medium">{res.address}</p>

                <div className="flex items-center justify-between pt-1.5 border-t border-stone-200">
                  <a
                    href={`tel:${res.phone}`}
                    className="text-red-700 hover:underline font-black flex items-center space-x-1"
                  >
                    <Phone size={12} />
                    <span>{res.phone}</span>
                  </a>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${res.lat},${res.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#0f172a] hover:text-[#854d0e] hover:underline flex items-center space-x-1 font-bold"
                  >
                    <span>Route</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
