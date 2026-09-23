import React, { useState } from 'react';
import { 
  Shield, 
  Scale, 
  FileText, 
  FolderLock, 
  MapPin, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  Briefcase,
  UserCheck, 
  Lock, 
  BookOpen, 
  Mic, 
  Gavel, 
  FileCheck,
  Award,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/Logo';

export const LandingPage = ({ setCurrentTab, onOpenVoiceModal }) => {
  const { setActiveSOS } = useAuth();
  const { t } = useLanguage();
  const [quickQuery, setQuickQuery] = useState('');

  const handleQuickAsk = (e) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      localStorage.setItem('lawshield_initial_query', quickQuery.trim());
      setCurrentTab('ai-assistant');
    }
  };

  const sampleQueries = [
    "Tenancy & Security Deposit Dispute",
    "Workplace Harassment (POSH Act 2013)",
    "Cyber Defamation & Unauthorized Imagery",
    "Domestic Disputes & Restraining Orders",
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section - High-Contrast Oxford Navy & Warm Stone */}
      <section className="relative pt-12 pb-14 lg:pt-16 lg:pb-16 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          {/* Institutional Compliance Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-stone-100 border border-stone-300 text-xs text-slate-900 font-semibold shadow-xs">
            <Scale size={14} className="text-[#854d0e]" />
            <span>{t('hero_badge')}</span>
          </div>

          {/* Primary Legal Service Headline - High Contrast Bold Navy */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0f172a] leading-tight">
            {t('hero_title_1')}{' '}
            <span className="text-[#0f172a] underline decoration-[#b38b4d]/40 decoration-4 underline-offset-8">
              {t('hero_title_2')}
            </span>
          </h1>

          {/* Clear, High-Contrast Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-900 font-medium leading-relaxed">
            {t('hero_desc')}
          </p>

          {/* Confidential Legal Matter Intake Console */}
          <div className="max-w-3xl mx-auto pt-2">
            <form onSubmit={handleQuickAsk} className="relative">
              <div className="relative flex items-center p-2 rounded-2xl bg-white border-2 border-stone-300 shadow-sm hover:border-stone-400 focus-within:border-[#0f172a] focus-within:ring-2 focus-within:ring-[#0f172a]/10 transition-all">
                <div className="pl-3 text-[#854d0e]">
                  <Scale className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  placeholder={t('quick_search_placeholder')}
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-[#0f172a] font-semibold placeholder:text-slate-500 placeholder:font-normal focus:outline-none"
                />

                {/* Secure Voice Dictation Trigger */}
                {onOpenVoiceModal && (
                  <button
                    type="button"
                    onClick={onOpenVoiceModal}
                    className="p-2 text-slate-700 hover:text-[#854d0e] hover:bg-stone-100 rounded-lg transition mr-1.5 shrink-0"
                    title="Dictate statement in your language"
                  >
                    <Mic size={18} />
                  </button>
                )}

                <button
                  type="submit"
                  className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold px-6 py-2.5 sm:py-3 rounded-xl flex items-center space-x-1.5 shadow-sm transition shrink-0"
                >
                  <span>{t('diagnose')}</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Common Practice Area Chips - Dark Crisp Text */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5">
                <span className="text-xs text-slate-900 font-bold">{t('try_asking')}</span>
                {sampleQueries.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      localStorage.setItem('lawshield_initial_query', q);
                      setCurrentTab('ai-assistant');
                    }}
                    className="text-xs text-slate-900 font-semibold hover:text-black bg-stone-100 hover:bg-stone-200 border border-stone-300 px-3.5 py-1.5 rounded-full shadow-xs transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>

        {/* Human Legal Editorial Photo Banner with Clear Caption */}
        <div className="max-w-6xl mx-auto px-4 mt-10">
          <div className="bg-white border-2 border-stone-200 rounded-2xl p-3 shadow-sm">
            <div className="relative rounded-xl overflow-hidden aspect-[16/8] sm:aspect-[21/9]">
              <img 
                src="/images/advocate_consultation.jpg" 
                alt="Empanelled Advocate Consultation" 
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
              
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 right-3 sm:right-4 flex flex-col sm:flex-row sm:items-center justify-between text-white text-xs gap-2">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                  <span className="font-extrabold tracking-wide text-sm text-white">Empanelled Bar Council Advocates & Confidential Legal Consultation</span>
                </div>
                <div className="flex items-center space-x-4 text-amber-300 font-semibold text-xs">
                  <span>Vetted Advocates</span>
                  <span>•</span>
                  <span>End-to-End Client Privilege</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRACTICE AREAS & DIGITAL LEGAL SERVICES (High Contrast 6-Card Grid) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#0f172a] flex items-center justify-center gap-2">
            <Gavel className="w-5 h-5 text-[#854d0e]" />
            <span>{t('simple_hub_title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-800 font-medium max-w-xl mx-auto">
            {t('simple_hub_subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* Card 1: Statutory Guidance & Rights Advisory */}
          <div 
            onClick={() => setCurrentTab('ai-assistant')}
            className="legal-card p-6 rounded-2xl cursor-pointer group space-y-4 border-2 border-stone-200 hover:border-stone-400"
          >
            <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-300 flex items-center justify-center text-[#854d0e] group-hover:bg-white transition shadow-xs">
              <Scale size={20} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-[#0f172a] group-hover:text-[#854d0e] transition">
                Statutory Advisory & Rights
              </h3>
              <p className="text-xs text-slate-800 leading-relaxed font-normal">
                Systematic statutory mapping under the Bharatiya Nyaya Sanhita (BNS), IPC, CrPC/BNSS, POSH Act, and IT Act. Receive actionable rights checklists and risk categorization.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs text-[#0f172a] font-extrabold space-x-1.5 group-hover:text-[#854d0e]">
              <span>Review Statutory Rights</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 2: Case Dossier & Evidence Chronology */}
          <div 
            onClick={() => setCurrentTab('case-intelligence')}
            className="legal-card p-6 rounded-2xl cursor-pointer group space-y-4 border-2 border-stone-200 hover:border-stone-400"
          >
            <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-300 flex items-center justify-center text-[#854d0e] group-hover:bg-white transition shadow-xs">
              <Briefcase size={20} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-[#0f172a] group-hover:text-[#854d0e] transition">
                Case Dossier & Briefing
              </h3>
              <p className="text-xs text-slate-800 leading-relaxed font-normal">
                Systematically organize incident chronology, evaluate evidence coverage scores, detect missing records, and generate an attorney-ready case brief for consultation.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs text-[#0f172a] font-extrabold space-x-1.5 group-hover:text-[#854d0e]">
              <span>Open Case Dossier</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 3: Empanelled Bar Council Advocates */}
          <div 
            onClick={() => setCurrentTab('lawyers')}
            className="legal-card p-6 rounded-2xl cursor-pointer group space-y-4 border-2 border-stone-200 hover:border-stone-400"
          >
            <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-300 flex items-center justify-center text-[#854d0e] group-hover:bg-white transition shadow-xs">
              <UserCheck size={20} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-[#0f172a] group-hover:text-[#854d0e] transition">
                Consult Empanelled Advocates
              </h3>
              <p className="text-xs text-slate-800 leading-relaxed font-normal">
                Direct consultation with verified Bar Council advocates specializing in POSH, cybercrime, domestic disputes, civil recovery, and constitutional liberties via video or confidential messaging.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs text-[#0f172a] font-extrabold space-x-1.5 group-hover:text-[#854d0e]">
              <span>Browse Legal Panel</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 4: Automated Complaint & Zero FIR Drafter */}
          <div 
            onClick={() => setCurrentTab('documents')}
            className="legal-card p-6 rounded-2xl cursor-pointer group space-y-4 border-2 border-stone-200 hover:border-stone-400"
          >
            <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-300 flex items-center justify-center text-[#854d0e] group-hover:bg-white transition shadow-xs">
              <FileCheck size={20} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-[#0f172a] group-hover:text-[#854d0e] transition">
                Automated Legal Notices & FIRs
              </h3>
              <p className="text-xs text-slate-800 leading-relaxed font-normal">
                Draft legally compliant Zero FIR petitions, formal legal demand notices, POSH Internal Committee complaints, and cybercrime reports ready for immediate submission.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs text-[#0f172a] font-extrabold space-x-1.5 group-hover:text-[#854d0e]">
              <span>Generate Legal Draft</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 5: Section 65B Cryptographic Evidence Locker */}
          <div 
            onClick={() => setCurrentTab('evidence')}
            className="legal-card p-6 rounded-2xl cursor-pointer group space-y-4 border-2 border-stone-200 hover:border-stone-400"
          >
            <div className="w-11 h-11 rounded-xl bg-stone-100 border border-stone-300 flex items-center justify-center text-[#854d0e] group-hover:bg-white transition shadow-xs">
              <FolderLock size={20} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-[#0f172a] group-hover:text-[#854d0e] transition">
                Section 65B Evidence Vault
              </h3>
              <p className="text-xs text-slate-800 leading-relaxed font-normal">
                Cryptographically timestamp and preserve digital communications, screenshots, medical records, and audio recordings with chain-of-custody documentation under the Indian Evidence Act.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs text-[#0f172a] font-extrabold space-x-1.5 group-hover:text-[#854d0e]">
              <span>Access Secure Vault</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
            </div>
          </div>

          {/* Card 6: 24/7 Emergency Distress Radar & Hotlines */}
          <div 
            onClick={() => setActiveSOS(true)}
            className="legal-card p-6 rounded-2xl cursor-pointer group space-y-4 border-2 border-red-300 hover:border-red-500"
          >
            <div className="w-11 h-11 rounded-xl bg-red-100 border border-red-300 flex items-center justify-center text-red-700 group-hover:bg-red-200 transition shadow-xs">
              <AlertTriangle size={20} />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-red-950 group-hover:text-red-700 transition">
                Emergency Distress Radar
              </h3>
              <p className="text-xs text-slate-800 leading-relaxed font-normal">
                Immediate 1-tap distress broadcast, live GPS coordinates, discreet camouflage mode, and direct routing to nearby police stations and 24/7 crisis centers.
              </p>
            </div>
            <div className="pt-2 flex items-center text-xs text-red-800 font-extrabold space-x-1.5">
              <span>Emergency Dispatch</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED CASE PREPARATION & DOSSIER SECTION (High Contrast) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border-2 border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Photo: Legal Case Dossier */}
            <div className="lg:col-span-5">
              <div className="rounded-xl overflow-hidden border-2 border-stone-300 shadow-xs">
                <img 
                  src="/images/legal_case_dossier.jpg" 
                  alt="Attorney Case File Dossier" 
                  className="w-full h-auto object-cover aspect-[4/3]"
                />
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded bg-stone-100 text-slate-900 text-xs font-bold tracking-wider uppercase border border-stone-300">
                <Briefcase size={13} className="text-[#854d0e]" />
                <span>Counsel Briefing Architecture</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
                {t('case_intel_title')}
              </h2>

              <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-normal">
                {t('case_intel_desc')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-900 font-bold pt-1">
                <div className="flex items-center space-x-2">
                  <CheckCircle size={15} className="text-[#854d0e] shrink-0" />
                  <span>Chronological Fact Timeline Linking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle size={15} className="text-[#854d0e] shrink-0" />
                  <span>Evidence Coverage & Factor Scoring</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle size={15} className="text-[#854d0e] shrink-0" />
                  <span>Missing Record & Gap Detection</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle size={15} className="text-[#854d0e] shrink-0" />
                  <span>1-Click Attorney-Ready PDF Brief</span>
                </div>
              </div>

              {/* Statutory Disclaimer Plaque - Clear Bold Notice */}
              <div className="p-4 bg-stone-100 border border-stone-300 rounded-xl">
                <p className="text-xs text-slate-900 italic leading-relaxed font-semibold">
                  «{t('statutory_disclaimer')}»
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setCurrentTab('case-intelligence')}
                  className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-xs transition flex items-center space-x-2 group"
                >
                  <span>{t('open_case_intel')}</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INSTITUTIONAL TRUST & CONSTITUTIONAL SAFEGUARDS - High Contrast */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-white border-2 border-stone-200 p-8 sm:p-10 shadow-sm">
          <div className="max-w-3xl space-y-5">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-950 bg-amber-100 border border-amber-300 px-3 py-1 rounded">
              Constitutional Rights & Judicial Precedents
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">
              Zero FIR: Your Statutory Right to File a Complaint Anywhere
            </h2>
            <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-normal">
              Under Supreme Court directions and Section 154 of CrPC / BNSS, a citizen or victim can lodge a Zero FIR at <em>any</em> police station, regardless of geographical jurisdiction. Police officers cannot refuse registration. LawShield auto-formats Zero FIR complaints ready for formal legal submission.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-900 font-bold pt-1">
              <div className="flex items-center space-x-2">
                <CheckCircle size={15} className="text-[#854d0e] shrink-0" />
                <span>POSH Act 2013 Workplace Protection Mandates</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={15} className="text-[#854d0e] shrink-0" />
                <span>Protection of Women from Domestic Violence Act 2005</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={15} className="text-[#854d0e] shrink-0" />
                <span>Strict Victim Identity Confidentiality (Sec 228A IPC)</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle size={15} className="text-[#854d0e] shrink-0" />
                <span>Free Legal Aid Entitlement under Article 39A</span>
              </div>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setCurrentTab('rights')}
                className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold px-5 py-3 rounded-xl shadow-xs transition flex items-center space-x-2"
              >
                <span>Examine Full Statutory Rights Index</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
