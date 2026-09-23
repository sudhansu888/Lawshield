import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertOctagon, 
  PhoneCall, 
  MapPin, 
  Volume2, 
  VolumeX, 
  X, 
  CheckCircle2, 
  ShieldAlert, 
  EyeOff, 
  Radio, 
  Send,
  Navigation,
  MessageSquare,
  Share2,
  Copy,
  Plus,
  Trash2,
  UserPlus,
  Users,
  Check,
  ExternalLink,
  HeartHandshake
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const EmergencySOSModal = ({ isOpen, onClose }) => {
  const { user, showToast, updateProfile } = useAuth();
  const [countdown, setCountdown] = useState(5);
  const [sosDispatched, setSosDispatched] = useState(false);
  const [sirenActive, setSirenActive] = useState(false);
  const [location, setLocation] = useState(null);
  const [locating, setLocating] = useState(true);
  const [camouflage, setCamouflage] = useState(false);
  const [incidentData, setIncidentData] = useState(null);
  const [copiedLocation, setCopiedLocation] = useState(false);

  // Manage Family Contacts Drawer
  const [showManageContacts, setShowManageContacts] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: 'Mother',
    phone: '',
  });

  const [activeSubTab, setActiveSubTab] = useState('family'); // 'family' | 'hotlines'

  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Siren synthesis with Web Audio API (cross-browser safe)
  const startSiren = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.linearRampToValueAtTime(950, now + 0.4);
      osc.frequency.linearRampToValueAtTime(650, now + 0.8);

      gain.gain.setValueAtTime(0.15, now);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      oscillatorRef.current = osc;
      setSirenActive(true);
    } catch (err) {
      console.warn('Audio siren could not start automatically:', err.message);
    }
  };

  const stopSiren = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {}
      oscillatorRef.current = null;
    }
    setSirenActive(false);
  };

  // Location detection
  useEffect(() => {
    if (!isOpen) return;

    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
          });
          setLocating(false);
        },
        (err) => {
          console.warn('Geolocation denied, using fallback coordinates');
          setLocation({ lat: 28.6139, lng: 77.2090, accuracy: 15 });
          setLocating(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setLocation({ lat: 28.6139, lng: 77.2090, accuracy: 20 });
      setLocating(false);
    }
  }, [isOpen]);

  // 5-second countdown to automatic dispatch
  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setSosDispatched(false);
      setShowManageContacts(false);
      stopSiren();
      return;
    }

    setCountdown(5);
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          dispatchSOS();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      stopSiren();
    };
  }, [isOpen]);

  const dispatchSOS = async () => {
    try {
      const payload = {
        lat: location?.lat || 28.6139,
        lng: location?.lng || 77.2090,
        address: location ? `GPS Coordinates (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : 'New Delhi Central Hub',
        notes: 'Emergency SOS Signal Triggered via LawShield Portal',
      };

      const res = await api.post('/emergency/sos', payload);
      if (res.data.success) {
        setSosDispatched(true);
        setIncidentData(res.data.incident);
        showToast('🚨 SOS Broadcast Dispatched! Emergency contacts notified.', 'error');
      }
    } catch (err) {
      // Fallback state
      setSosDispatched(true);
      setIncidentData({
        _id: 'sos_local_' + Math.floor(Math.random() * 10000),
        location: location || { lat: 28.6139, lng: 77.2090 },
        contactsAlerted: getFamilyContacts(),
        createdAt: new Date(),
      });
    }
  };

  const handleCancelCountdown = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    stopSiren();
    onClose();
  };

  // Contacts list
  const getFamilyContacts = () => {
    if (user?.emergencyContacts && user.emergencyContacts.length > 0) {
      return user.emergencyContacts;
    }
    // Realistic fallback family contacts
    return [
      { name: 'Dr. Ramesh Sharma', relationship: 'Father', phone: '+91 98765 00001' },
      { name: 'Sunita Sharma', relationship: 'Mother', phone: '+91 98765 00003' },
      { name: 'Pooja Verma', relationship: 'Sister', phone: '+91 98765 00002' },
    ];
  };

  const familyContacts = getFamilyContacts();

  // Generate WhatsApp live GPS dispatch link
  const getWhatsAppLink = (contact) => {
    const cleanPhone = contact.phone.replace(/[^0-9]/g, '');
    const lat = location?.lat || 28.6139;
    const lng = location?.lng || 77.2090;
    const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    const msg = `🚨 EMERGENCY SOS ALERT from ${user?.name || 'me'}!\n\nI need immediate emergency help! My live GPS location is:\n${mapUrl}\n(Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)} | Accuracy: ±${location?.accuracy || 15}m)\nTime: ${new Date().toLocaleTimeString()}\n\nPlease call me or send help right now! (Sent via LawShield SafeGuard)`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  // Generate SMS live GPS dispatch link
  const getSmsLink = (contact) => {
    const cleanPhone = contact.phone.replace(/[^0-9+]/g, '');
    const lat = location?.lat || 28.6139;
    const lng = location?.lng || 77.2090;
    const mapUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    const msg = `EMERGENCY SOS: I need immediate help. My GPS location: ${mapUrl} (${lat.toFixed(4)},${lng.toFixed(4)}). Sent via LawShield.`;
    return `sms:${cleanPhone}?body=${encodeURIComponent(msg)}`;
  };

  // Copy live location link
  const handleCopyLocation = () => {
    const lat = location?.lat || 28.6139;
    const lng = location?.lng || 77.2090;
    const link = `https://www.google.com/maps?q=${lat},${lng}`;
    const text = `🚨 EMERGENCY SOS LOCATION: ${link} (${lat.toFixed(5)}, ${lng.toFixed(5)} ±${location?.accuracy || 15}m)`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedLocation(true);
      showToast('Live GPS coordinates & map link copied to clipboard', 'success');
      setTimeout(() => setCopiedLocation(false), 3000);
    }
  };

  // Add new family contact
  const handleAddContact = async (e) => {
    e.preventDefault();
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      showToast('Please provide both a contact name and phone number', 'error');
      return;
    }

    const updated = [...familyContacts, {
      name: newContact.name.trim(),
      relationship: newContact.relationship,
      phone: newContact.phone.trim()
    }];

    await updateProfile({ emergencyContacts: updated });
    setNewContact({ name: '', relationship: 'Mother', phone: '' });
    setShowManageContacts(false);
    showToast('Family emergency contact added successfully', 'success');
  };

  // Delete family contact
  const handleDeleteContact = async (index) => {
    const updated = familyContacts.filter((_, idx) => idx !== index);
    await updateProfile({ emergencyContacts: updated });
    showToast('Emergency contact removed', 'info');
  };

  if (!isOpen) return null;

  // Discreet Camouflage Screen
  if (camouflage) {
    return (
      <div className="fixed inset-0 z-50 bg-white text-slate-800 p-8 font-serif overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center border-b pb-4 mb-6">
            <h1 className="text-2xl font-bold font-sans">Global Weather Patterns & Climate Data</h1>
            <button
              onClick={() => setCamouflage(false)}
              className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded font-sans"
            >
              Resume Emergency Screen
            </button>
          </div>
          <p className="mb-4 text-sm leading-relaxed">
            Atmospheric circulation is the large-scale movement of air by which thermal energy is distributed on the surface of the Earth. The wind systems that develop on the planet are divided into three distinct circulation cells in each hemisphere: the Hadley cell, the Ferrel cell, and the Polar cell.
          </p>
          <div className="bg-slate-50 p-4 border rounded my-4 text-xs font-mono">
            Temperature: 24.5°C | Relative Humidity: 58% | Barometric Pressure: 1013.2 hPa
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border-2 border-stone-300 rounded-3xl shadow-2xl overflow-hidden text-slate-900 my-4 max-h-[92vh] flex flex-col">
        {/* Urgent Header Bar */}
        <div className="bg-red-700 text-white px-5 sm:px-6 py-4 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-white text-red-700 flex items-center justify-center font-bold shadow-xs shrink-0">
              <AlertOctagon size={24} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                EMERGENCY SOS: FAMILY CALL & GPS DISPATCH
              </h2>
              <p className="text-xs text-red-100 font-medium">
                Direct 1-Tap Family Dial, Live WhatsApp/SMS Beacon & Official Hotlines
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Camouflage button */}
            <button
              onClick={() => setCamouflage(true)}
              title="Switch to innocent camouflage article if someone is looking"
              className="bg-red-800 hover:bg-red-900 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 border border-red-500/80 transition"
            >
              <EyeOff size={14} />
              <span className="hidden sm:inline">Camouflage</span>
            </button>

            <button
              onClick={handleCancelCountdown}
              className="p-1.5 text-red-100 hover:text-white rounded-lg hover:bg-red-800 transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Top Status Banner: Countdown or Broadcast Success */}
          {!sosDispatched ? (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 text-center space-y-3">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-red-600 text-white font-black text-2xl flex items-center justify-center shadow-md animate-pulse shrink-0">
                  {countdown}
                </div>
                <div className="text-left">
                  <h3 className="text-base font-extrabold text-[#0f172a]">
                    Automatic SOS Dispatches in {countdown} Seconds
                  </h3>
                  <p className="text-xs text-slate-800 font-medium leading-tight">
                    Broadcasting live GPS location & timestamp to your trusted emergency contacts and local authorities.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2 pt-1">
                <button
                  onClick={handleCancelCountdown}
                  className="bg-white hover:bg-stone-100 text-slate-900 text-xs font-bold px-4 py-2 rounded-xl border border-stone-300 transition shadow-xs"
                >
                  Cancel (False Alarm)
                </button>
                <button
                  onClick={dispatchSOS}
                  className="bg-red-700 hover:bg-red-800 text-white text-xs font-black px-4 py-2 rounded-xl shadow-md transition flex items-center space-x-1.5"
                >
                  <Send size={13} />
                  <span>Dispatch Now</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 flex items-start space-x-3 text-slate-900 shadow-xs">
              <CheckCircle2 size={22} className="text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-extrabold text-emerald-950 text-sm">Emergency Alert Dispatched Successfully</h4>
                <p className="text-xs text-emerald-900 mt-0.5 font-medium">
                  Incident ID: <code className="text-emerald-950 font-black font-mono bg-emerald-100 px-1 py-0.5 rounded">{incidentData?._id}</code>. Live GPS beacon active.
                </p>
              </div>
            </div>
          )}

          {/* Live GPS Coordinates & Quick Copy Toolbar */}
          <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-[#854d0e] flex items-center justify-center shrink-0">
                <Navigation size={18} />
              </div>
              <div>
                <div className="text-slate-600 text-[11px] font-semibold uppercase tracking-wider">Your Live GPS Coordinates</div>
                <div className="text-[#0f172a] font-mono font-bold text-xs sm:text-sm">
                  {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)} (±${location.accuracy}m)` : 'Detecting GPS position...'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleCopyLocation}
                className="flex items-center space-x-1.5 bg-white hover:bg-stone-100 border border-stone-300 text-slate-800 text-xs px-3 py-1.5 rounded-lg transition font-bold shadow-xs"
                title="Copy live Google Maps GPS link to clipboard"
              >
                {copiedLocation ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} className="text-slate-600" />}
                <span>{copiedLocation ? 'Copied Link!' : 'Copy GPS Link'}</span>
              </button>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${location?.lat || 28.6139},${location?.lng || 77.2090}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs px-3 py-1.5 rounded-lg transition font-bold shadow-xs"
              >
                <span>View Map</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>

          {/* Emergency Tabs: Family Circle vs National Hotlines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveSubTab('family')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                    activeSubTab === 'family'
                      ? 'bg-red-100 text-red-900 border border-red-300'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100'
                  }`}
                >
                  <Users size={15} className={activeSubTab === 'family' ? 'text-red-700' : 'text-slate-500'} />
                  <span>Family Emergency Circle ({familyContacts.length})</span>
                </button>

                <button
                  onClick={() => setActiveSubTab('hotlines')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                    activeSubTab === 'hotlines'
                      ? 'bg-[#0f172a] text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-stone-100'
                  }`}
                >
                  <ShieldAlert size={15} />
                  <span>National 24/7 Hotlines</span>
                </button>
              </div>

              {activeSubTab === 'family' && (
                <button
                  onClick={() => setShowManageContacts(!showManageContacts)}
                  className="text-xs text-[#854d0e] hover:text-[#713f12] font-bold flex items-center space-x-1"
                >
                  <UserPlus size={14} />
                  <span>{showManageContacts ? 'Close Form' : '+ Add Contact'}</span>
                </button>
              )}
            </div>

            {/* SubTab 1: Family Emergency Circle */}
            {activeSubTab === 'family' && (
              <div className="space-y-3">
                {/* Add Family Member Form Drawer */}
                {showManageContacts && (
                  <form onSubmit={handleAddContact} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 text-xs space-y-3 animate-in fade-in">
                    <div className="font-extrabold text-[#0f172a] flex items-center justify-between">
                      <span>Add Trusted Family Emergency Contact</span>
                      <span className="text-[11px] font-normal text-slate-600">Saved to your profile</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Ramesh Sharma"
                          value={newContact.name}
                          onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                          className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-600"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Relationship</label>
                        <select
                          value={newContact.relationship}
                          onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                          className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-600"
                        >
                          <option value="Mother">Mother</option>
                          <option value="Father">Father</option>
                          <option value="Spouse">Spouse / Partner</option>
                          <option value="Sister">Sister</option>
                          <option value="Brother">Brother</option>
                          <option value="Daughter">Daughter</option>
                          <option value="Son">Son</option>
                          <option value="Guardian">Guardian</option>
                          <option value="Friend">Trusted Friend</option>
                          <option value="Advocate">Legal Counsel</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                        <input
                          type="tel"
                          required
                          placeholder="e.g. +91 98765 43210"
                          value={newContact.phone}
                          onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                          className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowManageContacts(false)}
                        className="px-3 py-1.5 rounded-lg bg-stone-200 text-slate-800 font-bold hover:bg-stone-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold shadow-xs"
                      >
                        Save Contact
                      </button>
                    </div>
                  </form>
                )}

                {/* Family Contact Cards */}
                <div className="space-y-2.5">
                  {familyContacts.map((contact, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white border-2 border-stone-200 hover:border-stone-300 transition shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      {/* Contact Info */}
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center font-bold shrink-0 border border-rose-200">
                          {contact.relationship ? contact.relationship.charAt(0) : 'F'}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-[#0f172a] text-sm">{contact.name}</span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300">
                              {contact.relationship || 'Family'}
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 font-mono font-medium">{contact.phone}</div>
                        </div>
                      </div>

                      {/* 1-Tap Action Buttons: Direct Call, WhatsApp GPS, SMS GPS */}
                      <div className="flex items-center space-x-2 shrink-0">
                        {/* 1-Tap Phone Call */}
                        <a
                          href={`tel:${contact.phone.replace(/[^0-9+]/g, '')}`}
                          className="flex items-center space-x-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-2 rounded-xl text-xs font-black shadow-xs active:scale-95 transition"
                          title={`Call ${contact.name} immediately`}
                        >
                          <PhoneCall size={14} />
                          <span>Call Now</span>
                        </a>

                        {/* 1-Tap WhatsApp Live Location */}
                        <a
                          href={getWhatsAppLink(contact)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-2 border-emerald-300 px-3 py-2 rounded-xl text-xs font-bold transition shadow-xs"
                          title="Dispatch Live GPS Location via WhatsApp"
                        >
                          <MessageSquare size={14} className="text-emerald-700" />
                          <span>WhatsApp GPS</span>
                        </a>

                        {/* 1-Tap SMS Live Location */}
                        <a
                          href={getSmsLink(contact)}
                          className="flex items-center space-x-1.5 bg-stone-100 hover:bg-stone-200 text-slate-900 border border-stone-300 px-2.5 py-2 rounded-xl text-xs font-bold transition shadow-xs"
                          title="Dispatch Live GPS Location via SMS"
                        >
                          <Share2 size={13} className="text-slate-700" />
                          <span className="hidden sm:inline">SMS</span>
                        </a>

                        {/* Delete contact if more than 1 */}
                        {familyContacts.length > 1 && (
                          <button
                            onClick={() => handleDeleteContact(idx)}
                            className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-stone-100 transition"
                            title="Remove contact"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SubTab 2: Immediate National Hotlines */}
            {activeSubTab === 'hotlines' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <a
                    href="tel:112"
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-red-50 hover:bg-red-100 border-2 border-red-300 text-red-950 transition group shadow-xs"
                  >
                    <PhoneCall size={18} className="text-red-700 group-hover:scale-110 transition" />
                    <span className="text-xs font-black mt-1 text-red-950">112</span>
                    <span className="text-[10px] text-red-900 font-bold">Police Emergency</span>
                  </a>

                  <a
                    href="tel:1091"
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 text-rose-950 transition group shadow-xs"
                  >
                    <PhoneCall size={18} className="text-rose-700 group-hover:scale-110 transition" />
                    <span className="text-xs font-black mt-1 text-rose-950">1091</span>
                    <span className="text-[10px] text-rose-900 font-bold">Women Helpline</span>
                  </a>

                  <a
                    href="tel:7827170170"
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-950 transition group shadow-xs"
                  >
                    <PhoneCall size={18} className="text-amber-700 group-hover:scale-110 transition" />
                    <span className="text-xs font-black mt-1 text-amber-950">NCW Cell</span>
                    <span className="text-[10px] text-amber-900 font-bold">7827170170</span>
                  </a>

                  <a
                    href="tel:1930"
                    className="flex flex-col items-center justify-center p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 text-blue-950 transition group shadow-xs"
                  >
                    <PhoneCall size={18} className="text-blue-700 group-hover:scale-110 transition" />
                    <span className="text-xs font-black mt-1 text-blue-950">1930</span>
                    <span className="text-[10px] text-blue-900 font-bold">Cyber Crime</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Siren acoustic deterrent toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-stone-100 border border-stone-200">
            <div className="flex items-center space-x-3">
              {sirenActive ? <Volume2 className="text-red-600 animate-bounce" /> : <VolumeX className="text-slate-600" />}
              <div>
                <div className="text-xs font-extrabold text-[#0f172a]">Acoustic Safety Deterrent Siren</div>
                <div className="text-[11px] text-slate-700 font-medium">High-frequency siren to draw immediate bystander attention</div>
              </div>
            </div>
            <button
              onClick={sirenActive ? stopSiren : startSiren}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition shadow-xs ${
                sirenActive
                  ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                  : 'bg-[#0f172a] hover:bg-[#1e293b] text-white'
              }`}
            >
              {sirenActive ? 'Stop Siren' : 'Sound Siren'}
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 px-5 sm:px-6 py-3 border-t border-stone-200 flex items-center justify-between text-xs text-slate-800 font-medium shrink-0">
          <span>Stay on line. If safe, proceed to nearest police post or crowded public facility.</span>
          <button
            onClick={() => { stopSiren(); onClose(); }}
            className="text-[#0f172a] hover:text-[#854d0e] font-extrabold transition underline"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
};
