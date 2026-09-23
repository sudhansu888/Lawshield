import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  AlertTriangle, 
  Scale, 
  Users, 
  FileText, 
  FolderLock, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  RefreshCw,
  MapPin,
  Phone
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard = () => {
  const { user, showToast } = useAuth();
  const [stats, setStats] = useState(null);
  const [lawyers, setLawyers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'verifications' | 'incidents' | 'users'

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, lawyersRes, incidentsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/lawyers'),
        api.get('/admin/incidents'),
        api.get('/admin/users'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (lawyersRes.data.success) setLawyers(lawyersRes.data.lawyers);
      if (incidentsRes.data.success) setIncidents(incidentsRes.data.incidents);
      if (usersRes.data.success) setAllUsers(usersRes.data.users);
    } catch (err) {
      showToast('Admin data fetch warning. Check administrative rights.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateVerification = async (lawyerId, newStatus) => {
    try {
      const res = await api.put(`/admin/lawyers/${lawyerId}/status`, { status: newStatus });
      if (res.data.success) {
        showToast(`Lawyer profile marked as ${newStatus}`, 'success');
        setLawyers((prev) =>
          prev.map((l) => (l._id === lawyerId || l.userId === lawyerId ? { ...l, verificationStatus: newStatus } : l))
        );
      }
    } catch (err) {
      showToast('Failed to update lawyer status', 'error');
    }
  };

  const handleResolveIncident = async (incidentId) => {
    try {
      const res = await api.put(`/admin/incidents/${incidentId}/resolve`);
      if (res.data.success) {
        showToast('Incident marked as resolved', 'info');
        setIncidents((prev) =>
          prev.map((i) => (i._id === incidentId ? { ...i, status: 'resolved' } : i))
        );
      }
    } catch (err) {
      showToast('Failed to resolve incident', 'error');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <ShieldAlert size={48} className="mx-auto text-red-500" />
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400">
          You are currently signed in as <strong>{user?.name || 'Citizen'}</strong> ({user?.role || 'user'}).
          Please use the persona switch at the top right to switch to <strong>Meera Nair (Admin)</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 mb-2">
            <UserCheck size={13} />
            <span>Chief Administration Console</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            System Telemetry & Moderation Panel
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor emergency distress signals, verify bar credentials, and oversee consultation metrics.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition flex items-center space-x-2 shrink-0"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Stats Counter Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Citizens</span>
            <div className="text-2xl font-extrabold text-white">{stats.totalUsers}</div>
            <div className="text-[10px] text-blue-400 font-medium">Registered Accounts</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Advocates Empanelled</span>
            <div className="text-2xl font-extrabold text-amber-400">{stats.totalLawyers}</div>
            <div className="text-[10px] text-emerald-400 font-medium">{stats.verifiedLawyers} Verified by Bar</div>
          </div>

          <div className="glass-emergency p-5 rounded-2xl border border-red-500/40 space-y-1">
            <span className="text-[11px] font-semibold text-red-300 uppercase tracking-wider">SOS Alerts</span>
            <div className="text-2xl font-extrabold text-red-400">{stats.totalIncidents}</div>
            <div className="text-[10px] text-red-300 font-medium">{stats.activeIncidents} Active Signal(s)</div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Consultations</span>
            <div className="text-2xl font-extrabold text-emerald-400">{stats.totalConsultations}</div>
            <div className="text-[10px] text-slate-400 font-medium">{stats.totalDocuments} Petitions Drafted</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Advocate Verifications ({lawyers.length})
        </button>

        <button
          onClick={() => setActiveTab('incidents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'incidents' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Emergency Incidents ({incidents.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'users' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          User Accounts ({allUsers.length})
        </button>
      </div>

      {/* Tab 1: Advocate Verifications */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lawyers.map((lawyer) => (
              <div
                key={lawyer._id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{lawyer.name}</h3>
                    <p className="text-xs text-blue-400 font-medium">{lawyer.specialization}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Bar ID: {lawyer.barId}</p>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      lawyer.verificationStatus === 'verified'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : lawyer.verificationStatus === 'rejected'
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    {lawyer.verificationStatus}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{lawyer.bio}</p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleUpdateVerification(lawyer._id, 'verified')}
                    className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-emerald-500/30 transition flex items-center space-x-1"
                  >
                    <CheckCircle size={12} />
                    <span>Verify</span>
                  </button>

                  <button
                    onClick={() => handleUpdateVerification(lawyer._id, 'pending')}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition"
                  >
                    Hold
                  </button>

                  <button
                    onClick={() => handleUpdateVerification(lawyer._id, 'rejected')}
                    className="bg-red-600/20 hover:bg-red-600/40 text-red-300 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-red-500/30 transition flex items-center space-x-1"
                  >
                    <XCircle size={12} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Emergency Incidents Log */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {incidents.map((inc) => (
              <div
                key={inc._id}
                className="p-5 rounded-2xl bg-red-950/40 border border-red-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-red-300">{inc._id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        inc.status === 'active'
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {inc.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">
                    Citizen: {inc.userName} ({inc.userPhone})
                  </h4>
                  <div className="flex items-center space-x-3 text-slate-300">
                    <span className="flex items-center space-x-1">
                      <MapPin size={12} className="text-red-400" />
                      <span>{inc.location?.address || `${inc.location?.lat}, ${inc.location?.lng}`}</span>
                    </span>
                    <span>•</span>
                    <span>Triggered: {new Date(inc.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${inc.location?.lat},${inc.location?.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700"
                  >
                    View Coordinates
                  </a>

                  {inc.status === 'active' && (
                    <button
                      onClick={() => handleResolveIncident(inc._id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Users */}
      {activeTab === 'users' && (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {allUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-bold text-white">{u.name}</td>
                  <td className="p-4 font-mono">{u.email}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">{u.phone || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
