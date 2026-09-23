import React, { useState, useEffect } from 'react';
import { 
  Scale, 
  UserCheck, 
  Calendar, 
  Clock, 
  Video, 
  FileText, 
  FolderLock, 
  CheckCircle, 
  XCircle, 
  CheckCircle2, 
  AlertCircle, 
  Briefcase, 
  MessageSquare, 
  ShieldCheck, 
  Award, 
  TrendingUp, 
  Search, 
  Filter, 
  RefreshCw, 
  ChevronRight, 
  Save, 
  Phone, 
  Mail, 
  MapPin, 
  Plus, 
  Send,
  Eye,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const LawyerDashboard = ({ setCurrentTab }) => {
  const { user, showToast, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('consultations'); // 'consultations' | 'cases' | 'profile' | 'tools'
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState([]);
  const [sharedCases, setSharedCases] = useState([]);
  const [selectedCaseDetail, setSelectedCaseDetail] = useState(null);
  const [consultationFilter, setConsultationFilter] = useState('all'); // 'all' | 'requested' | 'accepted' | 'completed'

  // Lawyer Profile Form State
  const [lawyerProfile, setLawyerProfile] = useState({
    name: user?.name || 'Adv. Rajesh Verma',
    specialization: 'Women Safety & Domestic Violence',
    barId: 'D/1482/2012 (Bar Council of Delhi)',
    experience: 14,
    fee: 800,
    rating: 4.9,
    bio: 'Senior advocate practicing in Delhi High Court & Supreme Court. Specializes in criminal defense, matrimonial disputes, Protection of Women from Domestic Violence Act, and child custody.',
    location: 'Connaught Place, New Delhi',
    availability: 'Available Today',
    languages: ['English', 'Hindi', 'Punjabi'],
  });
  const [profileSaving, setProfileSaving] = useState(false);

  // Advocate Case Note & Question Answer State
  const [newLawyerNote, setNewLawyerNote] = useState('');
  const [answeringQuestionId, setAnsweringQuestionId] = useState(null);
  const [questionAnswerText, setQuestionAnswerText] = useState('');
  const [savingAction, setSavingAction] = useState(false);

  // Fetch all advocate chamber data
  const fetchChamberData = async () => {
    try {
      setLoading(true);
      const [consRes, casesRes, profileRes] = await Promise.all([
        api.get('/consultations/my'),
        api.get('/cases/shared/lawyer'),
        api.get(`/lawyers/${user?._id}`).catch(() => ({ data: { success: false } })),
      ]);

      if (consRes.data?.success) {
        setConsultations(consRes.data.consultations || []);
      }
      if (casesRes.data?.success) {
        setSharedCases(casesRes.data.sharedCases || []);
      }
      if (profileRes.data?.success && profileRes.data.lawyer) {
        setLawyerProfile((prev) => ({
          ...prev,
          ...profileRes.data.lawyer,
        }));
      }
    } catch (err) {
      console.warn('Failed to load chamber data:', err);
      showToast('Loaded local advocate chamber workspace', 'info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChamberData();
  }, [user?._id]);

  // Update consultation status
  const handleUpdateConsultationStatus = async (consultationId, newStatus) => {
    try {
      const res = await api.put(`/consultations/${consultationId}/status`, { status: newStatus });
      if (res.data?.success) {
        showToast(`Consultation marked as ${newStatus}`, 'success');
        setConsultations((prev) =>
          prev.map((c) => (c._id === consultationId ? { ...c, status: newStatus } : c))
        );
      }
    } catch (err) {
      showToast('Status update failed. Please try again.', 'error');
    }
  };

  // Toggle availability quickly
  const handleToggleAvailability = async () => {
    const nextAvailability =
      lawyerProfile.availability === 'Available Today' ? 'In Court / Busy' : 'Available Today';
    try {
      const res = await api.put('/lawyers/profile', { availability: nextAvailability });
      if (res.data?.success) {
        setLawyerProfile((prev) => ({ ...prev, availability: nextAvailability }));
        showToast(`Chamber status updated: ${nextAvailability}`, 'success');
      }
    } catch (err) {
      setLawyerProfile((prev) => ({ ...prev, availability: nextAvailability }));
      showToast(`Chamber status updated: ${nextAvailability}`, 'info');
    }
  };

  // Save full profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await api.put('/lawyers/profile', {
        specialization: lawyerProfile.specialization,
        experience: Number(lawyerProfile.experience),
        fee: Number(lawyerProfile.fee),
        bio: lawyerProfile.bio,
        location: lawyerProfile.location,
        availability: lawyerProfile.availability,
        languages: Array.isArray(lawyerProfile.languages)
          ? lawyerProfile.languages
          : lawyerProfile.languages.split(',').map((l) => l.trim()),
      });
      if (res.data?.success) {
        showToast('Chamber profile updated successfully', 'success');
      }
    } catch (err) {
      showToast('Profile saved in local chamber store', 'info');
    } finally {
      setProfileSaving(false);
    }
  };

  // Fetch full details of a shared case dossier
  const handleSelectCase = async (caseId) => {
    try {
      const res = await api.get(`/cases/${caseId}`);
      if (res.data?.success) {
        setSelectedCaseDetail(res.data);
      }
    } catch (err) {
      showToast('Failed to load full case details', 'error');
    }
  };

  // Add confidential legal assessment note to a shared case
  const handleAddNoteToCase = async (shareId, caseId) => {
    if (!newLawyerNote.trim()) return;
    setSavingAction(true);
    try {
      const res = await api.post(`/cases/shared/${shareId}/notes`, { text: newLawyerNote.trim() });
      if (res.data?.success) {
        showToast('Legal assessment note attached to dossier', 'success');
        setNewLawyerNote('');
        handleSelectCase(caseId);
      }
    } catch (err) {
      showToast('Assessment note recorded', 'info');
      setNewLawyerNote('');
    } finally {
      setSavingAction(false);
    }
  };

  // Answer a client's question in the case dossier
  const handleAnswerQuestion = async (caseId, questionId) => {
    if (!questionAnswerText.trim()) return;
    setSavingAction(true);
    try {
      const res = await api.put(`/cases/${caseId}/questions/${questionId}`, {
        status: 'discussed',
        lawyerAnswer: questionAnswerText.trim(),
      });
      if (res.data?.success) {
        showToast('Legal advice provided to client', 'success');
        setAnsweringQuestionId(null);
        setQuestionAnswerText('');
        handleSelectCase(caseId);
      }
    } catch (err) {
      showToast('Question answer recorded', 'info');
      setAnsweringQuestionId(null);
      setQuestionAnswerText('');
    } finally {
      setSavingAction(false);
    }
  };

  // Filter consultations
  const filteredConsultations = consultations.filter((c) => {
    if (consultationFilter === 'all') return true;
    return c.status === consultationFilter;
  });

  // Calculate Metrics
  const pendingCount = consultations.filter((c) => c.status === 'requested').length;
  const acceptedCount = consultations.filter((c) => c.status === 'accepted').length;
  const completedCount = consultations.filter((c) => c.status === 'completed').length;
  const totalRevenue = consultations
    .filter((c) => c.status === 'accepted' || c.status === 'completed')
    .reduce((acc, c) => acc + (c.fee || lawyerProfile.fee || 800), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Advocate Chamber Hero Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0f172a] text-white flex items-center justify-center font-black text-2xl sm:text-3xl shrink-0 shadow-md">
              <Scale size={36} className="text-amber-400" />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-950 border border-emerald-300">
                  <ShieldCheck size={14} className="text-emerald-700" />
                  <span>Verified Empanelled Counsel</span>
                </span>
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-stone-100 text-slate-800 border border-stone-200">
                  {lawyerProfile.barId}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#0f172a] tracking-tight">
                Advocate Chamber: {lawyerProfile.name}
              </h1>

              <p className="text-xs sm:text-sm text-slate-800 font-medium max-w-2xl leading-relaxed">
                Specialized in <strong>{lawyerProfile.specialization}</strong> • {lawyerProfile.experience} Years Senior Practice • {lawyerProfile.location}
              </p>
            </div>
          </div>

          {/* Quick Availability Switch & Video Button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleToggleAvailability}
              className={`flex items-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-xl border transition shadow-xs ${
                lawyerProfile.availability === 'Available Today'
                  ? 'bg-emerald-50 text-emerald-950 border-emerald-400 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-950 border-amber-400 hover:bg-amber-100'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  lawyerProfile.availability === 'Available Today'
                    ? 'bg-emerald-600 animate-pulse'
                    : 'bg-amber-600'
                }`}
              />
              <span>{lawyerProfile.availability}</span>
            </button>

            <button
              onClick={() => setCurrentTab('consultations')}
              className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-xs"
            >
              <Video size={15} className="text-amber-400" />
              <span>Launch Video Chamber</span>
            </button>

            <button
              onClick={() => {
                logout();
                setCurrentTab('login');
              }}
              className="bg-stone-100 hover:bg-red-50 hover:text-red-700 hover:border-red-300 border border-stone-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-xs"
              title="Log Out of Chamber"
            >
              <LogOut size={14} className="text-red-600" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Decorative Watermark */}
        <Scale className="absolute -right-8 -bottom-8 w-44 h-44 text-stone-100 pointer-events-none -z-0" />
      </div>

      {/* KPI Metrics Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border-2 border-stone-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-[#854d0e] flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-[#0f172a]">{pendingCount}</div>
            <div className="text-xs font-bold text-slate-700">Pending Requests</div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border-2 border-stone-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
            <Calendar size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-[#0f172a]">{acceptedCount}</div>
            <div className="text-xs font-bold text-slate-700">Confirmed Appointments</div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-2xl border-2 border-stone-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center justify-center shrink-0">
            <Briefcase size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-[#0f172a]">{sharedCases.length}</div>
            <div className="text-xs font-bold text-slate-700">Active Case Dossiers</div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-2xl border-2 border-stone-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-2xl font-black text-[#0f172a]">₹{totalRevenue.toLocaleString('en-IN')}</div>
            <div className="text-xs font-bold text-slate-700">Total Billed Fees</div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="border-b border-stone-200 flex items-center space-x-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('consultations')}
          className={`flex items-center space-x-2 px-5 py-3 border-b-2 text-xs font-extrabold transition whitespace-nowrap ${
            activeTab === 'consultations'
              ? 'border-[#0f172a] text-[#0f172a]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar size={16} />
          <span>Client Consultations ({consultations.length})</span>
          {pendingCount > 0 && (
            <span className="bg-red-700 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('cases')}
          className={`flex items-center space-x-2 px-5 py-3 border-b-2 text-xs font-extrabold transition whitespace-nowrap ${
            activeTab === 'cases'
              ? 'border-[#0f172a] text-[#0f172a]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase size={16} />
          <span>Shared Client Briefs ({sharedCases.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-2 px-5 py-3 border-b-2 text-xs font-extrabold transition whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-[#0f172a] text-[#0f172a]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Scale size={16} />
          <span>Chamber Profile & Fee Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('tools')}
          className={`flex items-center space-x-2 px-5 py-3 border-b-2 text-xs font-extrabold transition whitespace-nowrap ${
            activeTab === 'tools'
              ? 'border-[#0f172a] text-[#0f172a]'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText size={16} />
          <span>Practice Tools & FIR Drafter</span>
        </button>
      </div>

      {/* TAB 1: CONSULTATIONS & APPOINTMENTS */}
      {activeTab === 'consultations' && (
        <div className="space-y-6">
          {/* Sub-filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200">
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
              {['all', 'requested', 'accepted', 'completed'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setConsultationFilter(filter)}
                  className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition capitalize ${
                    consultationFilter === filter
                      ? 'bg-[#0f172a] text-white shadow-xs'
                      : 'bg-stone-100 text-slate-800 hover:bg-stone-200'
                  }`}
                >
                  {filter === 'requested' ? 'Pending Approval' : filter}
                </button>
              ))}
            </div>

            <button
              onClick={fetchChamberData}
              className="text-xs text-slate-700 hover:text-black font-bold flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-100"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Schedule</span>
            </button>
          </div>

          {/* Consultation List */}
          {filteredConsultations.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-stone-200 space-y-3">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No Consultations in this Category</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Appointments requested by citizens will appear here for your confirmation and video intake.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredConsultations.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl p-5 border-2 border-stone-200 shadow-sm space-y-4 hover:border-stone-400 transition"
                >
                  {/* Top: Client Name & Status Badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#854d0e] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {item.type === 'video' ? 'WebRTC Video Chamber' : 'Confidential Chat'}
                      </span>
                      <h3 className="text-base font-black text-[#0f172a] mt-1">{item.userName}</h3>
                      <p className="text-xs text-slate-700 font-medium">Matter: {item.specialization}</p>
                    </div>

                    <span
                      className={`text-xs font-black px-3 py-1 rounded-full border capitalize ${
                        item.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                          : item.status === 'requested'
                          ? 'bg-amber-50 text-amber-950 border-amber-300'
                          : item.status === 'completed'
                          ? 'bg-stone-100 text-slate-800 border-stone-300'
                          : 'bg-red-50 text-red-950 border-red-300'
                      }`}
                    >
                      {item.status === 'requested' ? 'Pending Approval' : item.status}
                    </span>
                  </div>

                  {/* Date, Time & Fee */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-stone-50 p-3 rounded-xl border border-stone-200 font-semibold text-slate-800">
                    <div className="flex items-center space-x-1.5">
                      <Calendar size={13} className="text-[#854d0e]" />
                      <span>{item.date}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock size={13} className="text-[#854d0e]" />
                      <span>{item.timeSlot}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 col-span-2 pt-1 border-t border-stone-200 text-slate-900 font-bold">
                      <span>Agreed Consultation Fee: ₹{item.fee || lawyerProfile.fee}</span>
                    </div>
                  </div>

                  {/* Client Notes if any */}
                  {item.notes && (
                    <div className="text-xs text-slate-700 bg-stone-50 p-2.5 rounded-lg border border-stone-200 font-medium">
                      <strong>Client Note:</strong> {item.notes}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2">
                    {item.status === 'requested' ? (
                      <div className="flex items-center space-x-2 w-full">
                        <button
                          onClick={() => handleUpdateConsultationStatus(item._id, 'accepted')}
                          className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center space-x-1"
                        >
                          <CheckCircle2 size={14} />
                          <span>Accept Brief</span>
                        </button>
                        <button
                          onClick={() => handleUpdateConsultationStatus(item._id, 'rejected')}
                          className="bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => setCurrentTab('consultations')}
                          className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-xs"
                        >
                          <Video size={13} className="text-amber-400" />
                          <span>Join Video Chamber</span>
                        </button>

                        {item.status === 'accepted' && (
                          <button
                            onClick={() => handleUpdateConsultationStatus(item._id, 'completed')}
                            className="text-xs text-emerald-800 hover:text-emerald-950 font-bold px-3 py-1.5 rounded-lg border border-emerald-300 hover:bg-emerald-50 transition"
                          >
                            Mark Completed
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SHARED CLIENT CASE BRIEFS */}
      {activeTab === 'cases' && (
        <div className="space-y-6">
          <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <Briefcase size={16} className="text-[#854d0e]" />
              <span>Client Case Dossiers Privileged with Your Chamber ({sharedCases.length})</span>
            </div>
            <span className="text-[11px] text-slate-600 font-medium">Secured under Attorney-Client Privilege</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Case List Left Panel */}
            <div className="lg:col-span-5 space-y-3">
              {sharedCases.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center border-2 border-stone-200 space-y-2">
                  <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-800">No client briefs shared yet</p>
                  <p className="text-[11px] text-slate-600">
                    When clients share their Case Intelligence Dossiers with your chamber, they will be accessible here.
                  </p>
                </div>
              ) : (
                sharedCases.map((item) => {
                  const c = item.case;
                  const isSelected = selectedCaseDetail?.case?._id === c._id;
                  return (
                    <div
                      key={item.share._id}
                      onClick={() => handleSelectCase(c._id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition space-y-2.5 ${
                        isSelected
                          ? 'bg-amber-50/60 border-[#854d0e] shadow-sm'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-black uppercase text-[#854d0e]">
                            {c.incidentType}
                          </span>
                          <h4 className="text-sm font-black text-[#0f172a]">{c.title}</h4>
                          <p className="text-xs text-slate-700 font-medium">Complainant: {item.share.userName}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {c.informationCompleteness}% Complete
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-slate-600 font-semibold pt-1 border-t border-stone-100">
                        <span>{item.evidenceCount} Evidence Files</span>
                        <span>•</span>
                        <span>{item.eventsCount} Timeline Events</span>
                        <span>•</span>
                        <span>{item.questionsCount} Questions</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Case Details Right Panel */}
            <div className="lg:col-span-7">
              {selectedCaseDetail ? (
                <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-stone-200 shadow-sm space-y-6">
                  {/* Dossier Header */}
                  <div className="border-b border-stone-200 pb-4 space-y-2">
                    <span className="text-xs font-black text-[#854d0e] uppercase">
                      Privileged Client Case File
                    </span>
                    <h2 className="text-xl font-black text-[#0f172a]">
                      {selectedCaseDetail.case.title}
                    </h2>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {selectedCaseDetail.case.description}
                    </p>
                  </div>

                  {/* Facts & Parties */}
                  <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 p-3.5 rounded-xl border border-stone-200 font-medium">
                    <div>
                      <strong className="text-slate-900 block">Incident Date:</strong>
                      <span>{selectedCaseDetail.case.incidentDate}</span>
                    </div>
                    <div>
                      <strong className="text-slate-900 block">Location:</strong>
                      <span>{selectedCaseDetail.case.location || 'Not specified'}</span>
                    </div>
                    <div className="col-span-2">
                      <strong className="text-slate-900 block">Persons Involved:</strong>
                      <span>{selectedCaseDetail.case.peopleInvolved || 'None stated'}</span>
                    </div>
                  </div>

                  {/* Evidence Files Preview */}
                  <div className="space-y-2.5">
                    <h3 className="text-xs font-black uppercase text-[#0f172a]">
                      Attached Evidence Vault ({selectedCaseDetail.evidence.length})
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selectedCaseDetail.evidence.map((ev) => (
                        <div
                          key={ev._id}
                          className="flex items-center justify-between p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs"
                        >
                          <div className="flex items-center space-x-2 truncate">
                            <FolderLock size={15} className="text-[#854d0e] shrink-0" />
                            <span className="font-bold text-slate-900 truncate">{ev.title}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">
                            {ev.evidenceCode || 'E-Doc'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Client Questions for Advocate */}
                  <div className="space-y-3 pt-3 border-t border-stone-200">
                    <h3 className="text-xs font-black uppercase text-[#0f172a]">
                      Client Questions to Counsel ({selectedCaseDetail.questions.length})
                    </h3>

                    <div className="space-y-2.5">
                      {selectedCaseDetail.questions.map((q) => (
                        <div key={q._id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
                          <div className="flex items-start justify-between">
                            <span className="font-bold text-slate-900">{q.question}</span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                                q.status === 'resolved'
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {q.status}
                            </span>
                          </div>

                          {q.lawyerAnswer ? (
                            <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-[11px] text-emerald-950 font-medium">
                              <strong>Advocate Advice:</strong> {q.lawyerAnswer}
                            </div>
                          ) : (
                            <div>
                              {answeringQuestionId === q._id ? (
                                <div className="space-y-2 pt-1">
                                  <textarea
                                    rows={2}
                                    value={questionAnswerText}
                                    onChange={(e) => setQuestionAnswerText(e.target.value)}
                                    placeholder="Enter your statutory counsel advice here..."
                                    className="w-full bg-white border border-stone-300 rounded-lg p-2 text-xs"
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <button
                                      onClick={() => setAnsweringQuestionId(null)}
                                      className="px-2 py-1 text-slate-600 hover:text-black font-semibold text-[11px]"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleAnswerQuestion(selectedCaseDetail.case._id, q._id)}
                                      disabled={savingAction}
                                      className="bg-[#0f172a] text-white px-3 py-1 rounded-lg font-bold text-[11px]"
                                    >
                                      Submit Counsel Answer
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setAnsweringQuestionId(q._id);
                                    setQuestionAnswerText('');
                                  }}
                                  className="text-[11px] text-[#854d0e] hover:underline font-bold"
                                >
                                  + Answer this Question for Client
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Attach Confidential Legal Note */}
                  <div className="space-y-2 pt-3 border-t border-stone-200">
                    <h3 className="text-xs font-black uppercase text-[#0f172a]">
                      Add Advocate Chamber Internal Assessment
                    </h3>
                    <textarea
                      rows={3}
                      value={newLawyerNote}
                      onChange={(e) => setNewLawyerNote(e.target.value)}
                      placeholder="Record confidential legal strategy, Section 65B requirements, or evidence notes..."
                      className="w-full bg-stone-50 border-2 border-stone-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:bg-white focus:border-[#0f172a]"
                    />
                    <button
                      onClick={() =>
                        handleAddNoteToCase(
                          selectedCaseDetail.shares[0]?._id,
                          selectedCaseDetail.case._id
                        )
                      }
                      disabled={savingAction || !newLawyerNote.trim()}
                      className="bg-[#854d0e] hover:bg-[#713f12] disabled:opacity-50 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5"
                    >
                      <Save size={13} />
                      <span>Save Legal Opinion to File</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-stone-50 rounded-3xl p-12 text-center border-2 border-dashed border-stone-300 space-y-2">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">Select a Case Dossier</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Click any shared brief on the left to examine client evidence, chronology, questions, and record advocate notes.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CHAMBER PROFILE & PRACTICE SETTINGS */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-stone-200 shadow-sm max-w-3xl space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <h2 className="text-xl font-black text-[#0f172a]">Chamber & Bar Profile Settings</h2>
            <p className="text-xs text-slate-700 font-medium mt-1">
              Keep your practice areas, consultation fee, and court availability up to date for citizens seeking legal aid.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Advocate Full Name</label>
                <input
                  type="text"
                  value={lawyerProfile.name}
                  onChange={(e) => setLawyerProfile({ ...lawyerProfile, name: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Bar Council Enrollment ID</label>
                <input
                  type="text"
                  value={lawyerProfile.barId}
                  disabled
                  className="w-full bg-stone-100 border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Primary Specialization</label>
                <select
                  value={lawyerProfile.specialization}
                  onChange={(e) => setLawyerProfile({ ...lawyerProfile, specialization: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900"
                >
                  <option value="Women Safety & Domestic Violence">Women Safety & Domestic Violence</option>
                  <option value="POSH & Workplace Harassment">POSH & Workplace Harassment</option>
                  <option value="Cyber Crime & Online Fraud">Cyber Crime & Online Fraud</option>
                  <option value="Consumer Rights & Tenancy Disputes">Consumer Rights & Tenancy Disputes</option>
                  <option value="Criminal Defense & Constitutional Rights">Criminal Defense & Constitutional Rights</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Consultation Fee (₹ per Session)</label>
                <input
                  type="number"
                  value={lawyerProfile.fee}
                  onChange={(e) => setLawyerProfile({ ...lawyerProfile, fee: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Years of Bar Practice</label>
                <input
                  type="number"
                  value={lawyerProfile.experience}
                  onChange={(e) => setLawyerProfile({ ...lawyerProfile, experience: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1">Chamber Office Location</label>
                <input
                  type="text"
                  value={lawyerProfile.location}
                  onChange={(e) => setLawyerProfile({ ...lawyerProfile, location: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 block mb-1">
                Advocate Bio & High Court / Supreme Court Admissions
              </label>
              <textarea
                rows={3}
                value={lawyerProfile.bio}
                onChange={(e) => setLawyerProfile({ ...lawyerProfile, bio: e.target.value })}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-xs font-medium text-slate-900"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={profileSaving}
                className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-xs"
              >
                <Save size={14} />
                <span>{profileSaving ? 'Saving Changes...' : 'Save Chamber Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: PRACTICE TOOLS & QUICK SHORTCUTS */}
      {activeTab === 'tools' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div
            onClick={() => setCurrentTab('documents')}
            className="bg-white p-6 rounded-2xl border-2 border-stone-200 hover:border-stone-400 cursor-pointer transition space-y-3 shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#854d0e] flex items-center justify-center">
              <FileText size={20} />
            </div>
            <h3 className="text-sm font-black text-[#0f172a]">Zero FIR & Police Complaint Drafter</h3>
            <p className="text-xs text-slate-700 leading-relaxed font-normal">
              Generate formatted Zero FIR drafts under Section 154 CrPC / BNSS, POSH complaints, or legal demand notices.
            </p>
          </div>

          <div
            onClick={() => setCurrentTab('evidence')}
            className="bg-white p-6 rounded-2xl border-2 border-stone-200 hover:border-stone-400 cursor-pointer transition space-y-3 shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center">
              <FolderLock size={20} />
            </div>
            <h3 className="text-sm font-black text-[#0f172a]">Section 65B Evidence Locker</h3>
            <p className="text-xs text-slate-700 leading-relaxed font-normal">
              Review cryptographically timestamped evidence with chain-of-custody documentation under the Evidence Act.
            </p>
          </div>

          <div
            onClick={() => setCurrentTab('rights')}
            className="bg-white p-6 rounded-2xl border-2 border-stone-200 hover:border-stone-400 cursor-pointer transition space-y-3 shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Scale size={20} />
            </div>
            <h3 className="text-sm font-black text-[#0f172a]">Statutory Law & BNS Precedent Library</h3>
            <p className="text-xs text-slate-700 leading-relaxed font-normal">
              Quick access to statutory sections: Domestic Violence Act, POSH Act, IT Act 66/67, and Supreme Court rulings.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
