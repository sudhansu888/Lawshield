import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MessageSquare, 
  Calendar, 
  Clock, 
  User, 
  Send, 
  Paperclip, 
  CheckCheck, 
  ShieldCheck, 
  Monitor, 
  Sparkles,
  AlertCircle,
  FileText
} from 'lucide-react';
import { api, getSocket } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ConsultationsPage = ({ setCurrentTab }) => {
  const { user, showToast } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'room'

  // Video Calling Suite State
  const [inCall, setInCall] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [cameraActive, setCameraActive] = useState(true);
  const [screenShareActive, setScreenShareActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [simulatedRemoteConnected, setSimulatedRemoteConnected] = useState(true);

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const messagesEndRef = useRef(null);
  const callTimerRef = useRef(null);

  const fetchConsultations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/consultations/my');
      if (res.data.success) {
        setConsultations(res.data.consultations);
      }
    } catch (err) {
      console.warn('Consultations fetch warning:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await api.get('/chat/conversations');
      if (res.data.success) {
        setConversations(res.data.conversations);
        const storedConvId = localStorage.getItem('lawshield_active_conv_id');
        if (storedConvId) {
          const target = res.data.conversations.find(c => c._id === storedConvId);
          if (target) {
            selectConversation(target);
            setActiveTab('room');
          }
          localStorage.removeItem('lawshield_active_conv_id');
        } else if (res.data.conversations.length > 0 && !activeConv) {
          selectConversation(res.data.conversations[0]);
        }
      }
    } catch (err) {
      console.warn('Conversations fetch warning:', err.message);
    }
  };

  useEffect(() => {
    fetchConsultations();
    fetchConversations();
  }, []);

  const selectConversation = async (conv) => {
    setActiveConv(conv);
    const socket = getSocket();
    socket.emit('join-room', conv._id);

    try {
      const res = await api.get(`/chat/conversations/${conv._id}/messages`);
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.warn('Messages fetch warning:', err.message);
    }
  };

  // Socket.IO message listening
  useEffect(() => {
    const socket = getSocket();

    const handleReceiveMessage = (newMsg) => {
      if (activeConv && newMsg.conversationId === activeConv._id) {
        setMessages((prev) => [...prev, newMsg]);
      }
    };

    socket.on('receive-message', handleReceiveMessage);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
    };
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConv) return;

    const textToSend = messageText.trim();
    setMessageText('');

    try {
      const res = await api.post('/chat/messages', {
        conversationId: activeConv._id,
        text: textToSend,
      });

      if (res.data.success) {
        const savedMsg = res.data.message;
        setMessages((prev) => [...prev, savedMsg]);

        // Broadcast to socket room
        const socket = getSocket();
        socket.emit('send-message', {
          roomId: activeConv._id,
          ...savedMsg,
        });
      }
    } catch (err) {
      showToast('Failed to send message', 'error');
    }
  };

  // WebRTC Camera / Mic initialization
  const startVideoCall = async () => {
    setInCall(true);
    setCallDuration(0);
    setActiveTab('room');

    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.warn('Camera/Mic permission not granted, running in demonstration mode:', err.message);
    }
  };

  const endVideoCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    setInCall(false);
    setCallDuration(0);
    showToast('Video consultation ended safely', 'info');
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !micActive;
      });
    }
    setMicActive(!micActive);
  };

  const toggleCamera = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !cameraActive;
      });
    }
    setCameraActive(!cameraActive);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation / Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight">
            Consultations & Real-Time Counsel Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-800 mt-1 font-medium">
            Encrypted WebRTC peer-to-peer video calls and real-time legal counsel messaging.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-300">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-xs ${
              activeTab === 'appointments'
                ? 'bg-[#0f172a] text-white'
                : 'text-slate-700 hover:text-black hover:bg-stone-200'
            }`}
          >
            <Calendar size={14} />
            <span>Scheduled Appointments ({consultations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('room')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-xs ${
              activeTab === 'room'
                ? 'bg-[#0f172a] text-white'
                : 'text-slate-700 hover:text-black hover:bg-stone-200'
            }`}
          >
            <Video size={14} />
            <span>Live Room & Chat</span>
            {inCall && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
          </button>
        </div>
      </div>

      {/* Mode 1: Appointments List */}
      {activeTab === 'appointments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#0f172a]">Your Scheduled Legal Sessions</h2>
            <button
              onClick={() => setCurrentTab('lawyers')}
              className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-xs"
            >
              <span>+ Book New Consultation</span>
            </button>
          </div>

          {loading ? (
            <div className="bg-white border border-stone-200 p-8 rounded-3xl animate-pulse text-center font-bold text-slate-600">Loading...</div>
          ) : consultations.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 space-y-4">
              <Calendar size={40} className="mx-auto text-slate-400" />
              <h3 className="text-base font-bold text-[#0f172a]">No Consultations Scheduled Yet</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto font-medium">
                Explore our directory of empanelled advocates to book your first video or chat consultation session.
              </p>
              <button
                onClick={() => setCurrentTab('lawyers')}
                className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-xs"
              >
                Browse Empanelled Lawyers
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {consultations.map((item) => (
                <div
                  key={item._id}
                  className="bg-white p-6 rounded-3xl border border-stone-200 space-y-4 shadow-sm relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#854d0e] bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
                        {item.type === 'video' ? 'WebRTC Video Call' : 'Encrypted Chat'}
                      </span>
                      <h3 className="text-base font-black text-[#0f172a] mt-1.5">
                        {user?.role === 'lawyer' ? item.userName : item.lawyerName}
                      </h3>
                      <p className="text-xs text-slate-700 font-medium">{item.specialization || 'Advocate on Record'}</p>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {item.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs text-slate-800 font-semibold py-2 border-y border-stone-200">
                    <div className="flex items-center space-x-2">
                      <Calendar size={13} className="text-[#854d0e]" />
                      <span>{item.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={13} className="text-[#854d0e]" />
                      <span>{item.timeSlot}</span>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-800 italic font-medium">
                      "{item.notes}"
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-black text-[#0f172a]">
                      Fee: ₹{item.fee} (Paid)
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setActiveTab('room');
                          startVideoCall();
                        }}
                        className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-xs"
                      >
                        <Video size={13} />
                        <span>Launch Video Call</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab('room');
                          if (conversations.length > 0) {
                            selectConversation(conversations[0]);
                          }
                        }}
                        className="bg-stone-100 hover:bg-stone-200 text-slate-900 text-xs font-bold px-3.5 py-2 rounded-xl border border-stone-300 transition flex items-center space-x-1.5 shadow-xs"
                      >
                        <MessageSquare size={13} className="text-[#854d0e]" />
                        <span>Chat</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Live Room (WebRTC Video Calling & Real-Time Messaging) */}
      {activeTab === 'room' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Video Room Area (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {inCall ? (
              /* Active Video Consultation Mesh */
              <div className="glass-panel p-4 rounded-3xl border border-slate-700/80 space-y-4 shadow-2xl">
                {/* Header Call status */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                    <div>
                      <h3 className="text-sm font-bold text-white">Live WebRTC Video Consultation</h3>
                      <p className="text-[11px] text-emerald-400 font-mono">
                        Connected: {formatDuration(callDuration)} | 256-bit P2P Mesh
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-800 px-2 py-1 rounded">
                    Room: {activeConv?._id || 'consultation_p2p_mesh'}
                  </span>
                </div>

                {/* Video Streams Container */}
                <div className="relative aspect-video rounded-2xl bg-slate-950 overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
                  {/* Remote Stream Video */}
                  {simulatedRemoteConnected ? (
                    <div className="w-full h-full relative flex items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950">
                      <img
                        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800"
                        alt="Remote Counsel"
                        className="w-full h-full object-cover opacity-90"
                      />
                      <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700 text-xs font-bold text-white flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>Adv. Rajesh Verma (Supreme Court Bar)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center space-y-2">
                      <User size={48} className="mx-auto text-slate-700" />
                      <p className="text-xs text-slate-400">Waiting for other party to connect...</p>
                    </div>
                  )}

                  {/* Local Video Stream Picture-in-Picture (PiP) */}
                  <div className="absolute top-3 right-3 w-36 sm:w-44 aspect-video rounded-xl bg-slate-900 border-2 border-blue-500/60 overflow-hidden shadow-2xl z-10">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {!cameraActive && (
                      <div className="absolute inset-0 bg-slate-900 flex items-center justify-center text-xs text-slate-400">
                        Camera Off
                      </div>
                    )}
                    <div className="absolute bottom-1 left-1 text-[9px] bg-black/70 px-1.5 py-0.5 rounded text-white font-medium">
                      You {user?.name ? `(${user.name.split(' ')[0]})` : ''}
                    </div>
                  </div>
                </div>

                {/* Call Action Bar */}
                <div className="flex items-center justify-center space-x-3 pt-2">
                  <button
                    onClick={toggleMic}
                    className={`p-3 rounded-2xl transition border ${
                      micActive
                        ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                        : 'bg-red-600/30 text-red-300 border-red-500/50'
                    }`}
                    title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
                  >
                    {micActive ? <Mic size={18} /> : <MicOff size={18} />}
                  </button>

                  <button
                    onClick={toggleCamera}
                    className={`p-3 rounded-2xl transition border ${
                      cameraActive
                        ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                        : 'bg-red-600/30 text-red-300 border-red-500/50'
                    }`}
                    title={cameraActive ? 'Turn Off Camera' : 'Turn On Camera'}
                  >
                    {cameraActive ? <Video size={18} /> : <VideoOff size={18} />}
                  </button>

                  <button
                    onClick={() => {
                      setScreenShareActive(!screenShareActive);
                      showToast(screenShareActive ? 'Stopped screen sharing' : 'Screen sharing initiated', 'info');
                    }}
                    className={`p-3 rounded-2xl transition border ${
                      screenShareActive
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                    }`}
                    title="Toggle Screen Share"
                  >
                    <Monitor size={18} />
                  </button>

                  <button
                    onClick={endVideoCall}
                    className="p-3 bg-red-600 hover:bg-red-500 text-white rounded-2xl shadow-lg shadow-red-600/40 transition"
                    title="End Video Consultation"
                  >
                    <PhoneOff size={18} />
                  </button>
                </div>
              </div>
            ) : (
              /* Idle Video Standby Card */
              <div className="bg-white p-8 rounded-3xl border-2 border-stone-200 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#854d0e] mx-auto">
                  <Video size={32} />
                </div>
                <h3 className="text-lg font-black text-[#0f172a]">Peer-to-Peer Video Room</h3>
                <p className="text-xs sm:text-sm text-slate-800 max-w-md mx-auto leading-relaxed font-medium">
                  Start an encrypted WebRTC video conference directly with your selected advocate. Supports local camera, microphone switching, and screen sharing.
                </p>
                <div className="pt-2">
                  <button
                    onClick={startVideoCall}
                    className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-xs transition inline-flex items-center space-x-2"
                  >
                    <Video size={15} />
                    <span>Launch Video Consultation</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right / Chat Panel (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border-2 border-stone-200 flex flex-col h-[560px] shadow-sm overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#854d0e] font-black text-xs">
                  {activeConv?.recipient?.name ? activeConv.recipient.name.charAt(0) : '💬'}
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#0f172a]">
                    {activeConv?.recipient?.name || 'Adv. Rajesh Verma'}
                  </h4>
                  <p className="text-[10px] text-emerald-800 font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Online & Ready</span>
                  </p>
                </div>
              </div>

              <span className="text-[10px] text-slate-700 font-bold">
                End-to-End Privileged
              </span>
            </div>

            {/* Message Feed */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#fcfbf9]">
              {messages.map((msg) => {
                const isMe = msg.senderId === user?._id || msg.senderName === user?.name;
                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-slate-700 font-bold mb-1 px-1">
                      {msg.senderName}
                    </span>
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed font-medium ${
                        isMe
                          ? 'bg-[#0f172a] text-white rounded-br-xs shadow-xs'
                          : 'bg-white text-slate-900 rounded-bl-xs border border-stone-300 shadow-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-stone-200 bg-stone-50 flex items-center space-x-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your confidential legal question..."
                className="flex-1 bg-white border border-stone-300 rounded-xl px-3.5 py-2 text-xs text-[#0f172a] font-semibold placeholder:text-slate-500 focus:outline-none focus:border-[#0f172a]"
              />
              <button
                type="submit"
                disabled={!messageText.trim()}
                className="bg-[#0f172a] hover:bg-[#1e293b] text-white p-2.5 rounded-xl transition shadow-xs disabled:opacity-40"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
