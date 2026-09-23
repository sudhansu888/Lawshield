import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  AlertTriangle, 
  Scale, 
  CheckCircle2, 
  ArrowRight, 
  ArrowDown,
  FileText, 
  FolderLock, 
  ShieldAlert, 
  Info,
  UserCheck,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Client-side statutory fallback engine
const runClientLegalAnalysis = (query) => {
  const q = (query || '').toLowerCase();

  let riskLevel = 'LOW';
  let emergencyWarning = null;

  if (q.includes('kill') || q.includes('weapon') || q.includes('beating') || q.includes('assault') || q.includes('emergency') || q.includes('threat')) {
    riskLevel = 'EMERGENCY';
    emergencyWarning = 'CRITICAL: If you are in immediate physical danger, please trigger the Emergency SOS button immediately or dial 112 / 1091 (Women Helpline). Reach a secure location.';
  } else if (q.includes('harass') || q.includes('stalk') || q.includes('blackmail') || q.includes('posh') || q.includes('photo') || q.includes('cruelty') || q.includes('domestic')) {
    riskLevel = 'HIGH';
    emergencyWarning = 'High priority: Your matter involves potential criminal harassment or personal safety infringement. Preserve all digital/physical evidence and consult an empanelled advocate or file a Zero FIR.';
  } else if (q.includes('landlord') || q.includes('deposit') || q.includes('evict') || q.includes('rent') || q.includes('tenan') || q.includes('salary') || q.includes('fraud')) {
    riskLevel = 'MEDIUM';
  }

  // 1. Tenancy, Lease & Security Deposit
  if (q.includes('landlord') || q.includes('rent') || q.includes('tenant') || q.includes('tenan') || q.includes('deposit') || q.includes('evict') || q.includes('lease')) {
    return {
      legalTopic: 'Tenancy Rights & Security Deposit Recovery',
      relevantLaw: 'Model Tenancy Act, Transfer of Property Act 1882 (Section 106) & State Rent Control Acts',
      explanation: 'Under Indian tenancy principles and the Model Tenancy Act, a landlord cannot arbitrarily withhold refundable security deposits without valid, documented itemized damage repairs. Tenants have statutory safeguards against unlawful evictions and disconnection of essential services.',
      rights: [
        'Right to prompt and full refund of security deposit at the conclusion of the lease period',
        'Right to minimum 30 days statutory written notice prior to eviction or lease termination',
        'Strict protection against arbitrary utility disconnections (electricity/water) without court order',
        'Right to inspect original receipts/invoices if repairs are claimed against the deposit',
        'Right to file a petition before the Rent Authority or District Consumer Dispute Redressal Commission'
      ],
      recommendedAction: 'Issue a formal Legal Notice to the landlord demanding deposit refund within 15 days. If unaddressed, file a petition before the Rent Tribunal or Consumer Court.',
      riskLevel,
      emergencyWarning,
      disclaimer: 'LEGAL DISCLAIMER: This statutory guidance is generated for educational and general legal informational purposes. For binding representation, please consult a verified advocate.'
    };
  }

  // 2. Workplace Harassment / POSH
  if (q.includes('posh') || q.includes('work') || q.includes('office') || q.includes('boss') || q.includes('colleague') || q.includes('harass')) {
    return {
      legalTopic: 'Workplace Sexual Harassment (POSH Act) & Employment Safeguards',
      relevantLaw: 'Sexual Harassment of Women at Workplace (POSH) Act 2013 (Section 3, 4, 9, 12)',
      explanation: 'The POSH Act obligates every enterprise with 10+ employees to maintain an active Internal Complaints Committee (ICC). The statute provides zero-tolerance protection against unwelcome conduct, sexually colored remarks, or retaliation.',
      rights: [
        'Right to submit a confidential formal complaint to the ICC within 3 months',
        'Right to interim protection: up to 3 months paid leave or transfer of the respondent',
        'Absolute statutory protection against workplace retaliation or termination',
        'Right to complete identity confidentiality under Section 16'
      ],
      recommendedAction: 'Draft a formal complaint addressed to the Presiding Officer of your organization\'s ICC. Use the LawShield Document Generator to structure your petition.',
      riskLevel,
      emergencyWarning,
      disclaimer: 'LEGAL DISCLAIMER: This statutory guidance is generated for educational purposes. For binding representation, please consult a verified advocate.'
    };
  }

  // 3. Cyber Stalking / Morphed Photos
  if (q.includes('cyber') || q.includes('photo') || q.includes('instagram') || q.includes('facebook') || q.includes('whatsapp') || q.includes('stalk') || q.includes('leak') || q.includes('fake')) {
    return {
      legalTopic: 'Cyber Stalking, Privacy Violation & Digital Extortion',
      relevantLaw: 'Information Technology Act 2000 (Section 66E, 67, 67A) & IPC Section 354D / BNS 78',
      explanation: 'Capturing, publishing or threatening to circulate private photos/media without consent is punishable with up to 3 to 5 years imprisonment. Digital extortion and stalking are cognizable criminal offences.',
      rights: [
        'Right to emergency 24-hour content takedown under IT Intermediary Rules',
        'Right to lodge complaint on cybercrime.gov.in or helpline 1930 without police station visit',
        'Right to complete complainant identity protection during forensic investigation'
      ],
      recommendedAction: 'Preserve all screenshots and URL headers in your LawShield Evidence Locker. Do not communicate with the extortionist. Register an official complaint via Cyber Crime Portal (1930).',
      riskLevel,
      emergencyWarning,
      disclaimer: 'LEGAL DISCLAIMER: This statutory guidance is generated for educational purposes. For binding representation, please consult a verified advocate.'
    };
  }

  // 4. Domestic Violence & Matrimonial
  if (q.includes('domestic') || q.includes('husband') || q.includes('in-laws') || q.includes('beat') || q.includes('dowry') || q.includes('marriage')) {
    return {
      legalTopic: 'Domestic Violence & Matrimonial Protection',
      relevantLaw: 'Protection of Women from Domestic Violence Act (PWDVA) 2005 & IPC Section 498A / BNS 85',
      explanation: 'The law provides immediate civil remedies alongside criminal safeguards against physical, verbal, sexual, emotional, or economic domestic abuse in a shared matrimonial home.',
      rights: [
        'Right to reside in the shared household without illegal dispossession (Section 17)',
        'Right to immediate Protection Orders preventing respondent from approaching you (Section 18)',
        'Monetary relief and emergency monthly maintenance for you and your children (Section 20)',
        'Free legal aid and shelter home assistance through designated Protection Officers'
      ],
      recommendedAction: 'Approach a Protection Officer or submit an application under Section 12 of PWDVA. If violence occurred, obtain a Medical Legal Certificate (MLC) and file a Police Complaint.',
      riskLevel,
      emergencyWarning,
      disclaimer: 'LEGAL DISCLAIMER: This statutory guidance is generated for educational purposes. For binding representation, please consult a verified advocate.'
    };
  }

  // Default: General Statutory Rights
  return {
    legalTopic: 'Statutory Protections & Constitutional Rights',
    relevantLaw: 'Constitution of India (Article 21) & Legal Services Authorities Act, 1987',
    explanation: 'Every citizen is guaranteed fundamental protections under Indian jurisprudence, including the right to life, liberty, fair hearing, and access to justice.',
    rights: [
      'Right to fair hearing and due process of law before any adverse action',
      'Right to free legal aid via District Legal Services Authority (DLSA) under Article 39A',
      'Right to obtain certified copies and formal written notice before legal proceedings'
    ],
    recommendedAction: 'Consult a verified advocate on LawShield to examine your documentation and issue a formal communication or legal notice.',
    riskLevel,
    emergencyWarning,
    disclaimer: 'LEGAL DISCLAIMER: This statutory guidance is generated for educational purposes. For binding representation, please consult a verified advocate.'
  };
};

export const AILegalAssistant = ({ setCurrentTab }) => {
  const { setActiveSOS, showToast } = useAuth();
  const [problemText, setProblemText] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [lastAnalyzedQuery, setLastAnalyzedQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [checkedRights, setCheckedRights] = useState({});
  const resultRef = useRef(null);

  const scrollToResults = () => {
    setTimeout(() => {
      if (resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  };

  // Check if a query was passed from the landing page
  useEffect(() => {
    const savedQuery = localStorage.getItem('lawshield_initial_query');
    if (savedQuery) {
      setProblemText(savedQuery);
      localStorage.removeItem('lawshield_initial_query');
      handleAnalyze(savedQuery);
    }
  }, []);

  const handleAnalyze = async (queryToRun) => {
    const q = (queryToRun || problemText).trim();
    if (!q) {
      showToast('Please describe your legal situation first.', 'info');
      return;
    }

    // If query hasn't changed and analysis is already present, scroll smoothly to results
    if (analysis && q.toLowerCase() === lastAnalyzedQuery.toLowerCase() && !queryToRun) {
      scrollToResults();
      showToast('Jumped to your legal analysis below', 'info');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/ai/analyze', { problemText: q });
      if (res.data?.success && res.data?.analysis) {
        setAnalysis(res.data.analysis);
        setLastAnalyzedQuery(q);
        setCheckedRights({});
        scrollToResults();
        showToast('Legal analysis generated successfully', 'success');
      } else {
        throw new Error('Fallback needed');
      }
    } catch (err) {
      console.warn('Backend API unavailable or error, using local statutory engine:', err?.message);
      const fallbackAnalysis = runClientLegalAnalysis(q);
      setAnalysis(fallbackAnalysis);
      setLastAnalyzedQuery(q);
      setCheckedRights({});
      scrollToResults();
      showToast('Statutory analysis generated', 'success');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setProblemText('');
    setAnalysis(null);
    setLastAnalyzedQuery('');
    setCheckedRights({});
  };

  // Speech Recognition with Web Speech API
  const toggleSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast('Speech recognition is not supported in this browser.', 'error');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        showToast('🎙️ Listening... speak your legal query clearly.', 'info');
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setProblemText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const getRiskBadge = (level) => {
    switch (level) {
      case 'EMERGENCY':
        return {
          bg: 'bg-red-50 text-red-950 border-red-300',
          dot: 'bg-red-600 animate-ping',
          label: 'CRITICAL EMERGENCY',
        };
      case 'HIGH':
        return {
          bg: 'bg-rose-50 text-rose-950 border-rose-300',
          dot: 'bg-rose-600',
          label: 'HIGH RISK SITUATION',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-50 text-amber-950 border-amber-300',
          dot: 'bg-amber-600',
          label: 'MODERATE RISK / CIVIL INFRINGEMENT',
        };
      default:
        return {
          bg: 'bg-stone-100 text-slate-900 border-stone-300',
          dot: 'bg-slate-700',
          label: 'STANDARD LEGAL ADVISORY',
        };
    }
  };

  const quickPresets = [
    { label: 'Workplace Harassment (POSH)', query: 'I am facing unwelcome remarks, hostile treatment, and threats to my job from my manager at work.' },
    { label: 'Security Deposit Withheld', query: 'My landlord has evicted me and is refusing to return my security deposit of ₹45,000 without valid reason.' },
    { label: 'Domestic Violence & Threats', query: 'My in-laws and husband are abusing me physically and verbally, and threatening to throw me out of the matrimonial home.' },
    { label: 'Cyber Stalking & Leaked Photos', query: 'Someone created a fake profile with my pictures and phone number on Instagram and is blackmailing me.' },
    { label: 'Unpaid Wages & Breach of Contract', query: 'My employer has not cleared my salary for the last 3 months despite written reminders and promises.' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="text-center space-y-2.5">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-[#854d0e] text-xs font-extrabold shadow-xs">
          <Sparkles size={14} className="text-[#854d0e]" />
          <span>Statutory AI Legal Advisory & Risk Engine</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight">
          AI Legal & Safety Assistant
        </h1>
        <p className="text-sm sm:text-base text-slate-800 max-w-xl mx-auto font-medium leading-relaxed">
          State your situation in natural language. We identify statutory protections, outline your enforceable rights, and assess physical or financial risk.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl space-y-4 border-2 border-stone-200 shadow-sm">
        <div className="relative">
          <textarea
            rows={4}
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
            placeholder="Type or dictate your legal issue here. Example: 'I was terminated without notice period or severance pay, and the company has withheld my experience letter...'"
            className="w-full bg-stone-50 border-2 border-stone-200 rounded-2xl p-4 text-sm text-[#0f172a] font-semibold placeholder:text-slate-500 placeholder:font-normal focus:outline-none focus:border-[#0f172a] focus:bg-white transition leading-relaxed shadow-xs"
          />

          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`flex items-center space-x-1.5 text-xs px-3.5 py-2 rounded-xl border transition shadow-xs font-bold ${
                  isListening
                    ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                    : 'bg-stone-100 text-slate-900 border-stone-300 hover:bg-stone-200'
                }`}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                <span>{isListening ? 'Stop Listening' : 'Voice Dictate'}</span>
              </button>

              {problemText && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-slate-700 hover:text-black font-bold px-2 py-1"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {analysis && !loading && (
                <button
                  type="button"
                  onClick={scrollToResults}
                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3.5 py-2.5 sm:py-3 rounded-xl shadow-xs transition flex items-center space-x-1.5"
                >
                  <ArrowDown size={14} className="animate-bounce" />
                  <span>View Analysis</span>
                </button>
              )}

              <button
                onClick={() => handleAnalyze()}
                disabled={loading || !problemText.trim()}
                className="bg-[#0f172a] hover:bg-[#1e293b] disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 sm:py-3 rounded-xl shadow-xs transition flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Analyzing Law & Precedents...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Analyze Legal Rights</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Query Presets */}
        <div className="pt-3 border-t border-stone-200">
          <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block mb-2">
            Common Scenarios:
          </span>
          <div className="flex flex-wrap gap-2">
            {quickPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setProblemText(preset.query);
                  handleAnalyze(preset.query);
                }}
                className="text-xs bg-stone-100 hover:bg-stone-200 text-slate-900 font-semibold border border-stone-300 px-3.5 py-1.5 rounded-full transition shadow-xs"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real-Time Analyzing Progress State */}
      {loading && (
        <div className="bg-amber-50/90 border-2 border-amber-300 rounded-3xl p-6 text-center space-y-3 animate-pulse shadow-sm">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-[#854d0e] mb-1">
            <RefreshCw size={22} className="animate-spin" />
          </div>
          <h3 className="text-base font-black text-[#0f172a]">
            LawShield AI is Analyzing Your Statutory Rights...
          </h3>
          <p className="text-xs text-slate-800 max-w-md mx-auto font-medium leading-relaxed">
            Parsing situation facts, identifying relevant BNS/IPC sections, calculating legal risk levels, and preparing your enforceable rights checklist.
          </p>
        </div>
      )}

      {/* Prominent Quick-Jump Banner when Analysis is Ready */}
      {analysis && !loading && (
        <div 
          onClick={scrollToResults}
          className="cursor-pointer bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 rounded-2xl p-4 flex items-center justify-between transition group shadow-xs animate-in fade-in"
        >
          <div className="flex items-center space-x-2.5 text-xs font-bold text-emerald-950">
            <CheckCircle2 size={18} className="text-emerald-700 shrink-0" />
            <span>
              Legal analysis ready: <span className="underline font-black">{analysis.legalTopic}</span>
            </span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs font-black text-emerald-800 bg-white border border-emerald-300 px-3 py-1.5 rounded-xl group-hover:bg-emerald-200 transition">
            <span>Scroll to Analysis</span>
            <ArrowDown size={14} className="animate-bounce" />
          </div>
        </div>
      )}

      {/* Analysis Result Card */}
      {analysis && (
        <div ref={resultRef} id="legal-analysis-results" className="space-y-6 scroll-mt-24 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Emergency Alert Callout if Emergency or High */}
          {(analysis.riskLevel === 'EMERGENCY' || analysis.riskLevel === 'HIGH') && (
            <div className="p-5 rounded-2xl bg-red-50 border-2 border-red-300 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle size={24} className="text-red-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-black text-red-950 uppercase tracking-wide">
                    Urgent Threat & Safety Advisory
                  </h3>
                  <p className="text-xs text-red-900 mt-0.5 leading-relaxed font-medium">
                    {analysis.emergencyWarning || 'High personal risk detected. If in immediate danger, trigger SOS or call 112 / 1091.'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSOS(true)}
                className="bg-red-700 hover:bg-red-800 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-xs transition shrink-0 flex items-center space-x-1.5"
              >
                <ShieldAlert size={14} />
                <span>Trigger Emergency SOS</span>
              </button>
            </div>
          )}

          {/* Main Structured Result Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-stone-200 space-y-6 shadow-sm">
            {/* Top Bar: Risk badge & Topic */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-5">
              <div>
                <span className="text-xs text-[#854d0e] font-extrabold uppercase tracking-wider">
                  Identified Legal Area
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#0f172a] mt-0.5">
                  {analysis.legalTopic}
                </h2>
              </div>

              {/* Dynamic Risk Meter */}
              {(() => {
                const badge = getRiskBadge(analysis.riskLevel);
                return (
                  <div className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border text-xs font-black ${badge.bg}`}>
                    <span className={`w-2 h-2 rounded-full ${badge.dot}`}></span>
                    <span>{badge.label}</span>
                  </div>
                );
              })()}
            </div>

            {/* Applicable Statutory Provisions */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1">
              <div className="flex items-center space-x-2 text-xs font-black text-[#854d0e] uppercase tracking-wider">
                <Scale size={14} />
                <span>Statutory Sections & Acts</span>
              </div>
              <p className="text-sm font-bold text-[#0f172a] font-mono">
                {analysis.relevantLaw}
              </p>
            </div>

            {/* Plain-English Breakdown */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#0f172a]">
                Plain-English Legal Explanation
              </h3>
              <p className="text-sm text-slate-800 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-200 font-medium">
                {analysis.explanation}
              </p>
            </div>

            {/* Actionable Rights Checklist */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#0f172a]">
                Your Enforceable Rights Checklist
              </h3>
              <div className="space-y-2">
                {analysis.rights.map((right, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCheckedRights(prev => ({ ...prev, [idx]: !prev[idx] }))}
                    className={`flex items-start space-x-3 p-3 rounded-xl border cursor-pointer transition ${
                      checkedRights[idx]
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-stone-50 border-stone-200 text-slate-900 hover:border-stone-300 font-semibold'
                    }`}
                  >
                    <CheckCircle2
                      size={18}
                      className={`mt-0.5 shrink-0 ${
                        checkedRights[idx] ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    />
                    <span className="text-xs leading-relaxed">{right}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Action Plan */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#0f172a]">
                Recommended Immediate Next Steps
              </h3>
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 leading-relaxed font-medium">
                {analysis.recommendedAction}
              </div>
            </div>

            {/* Action CTAs */}
            <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  localStorage.setItem('lawshield_prefill_complaint', JSON.stringify({
                    topic: analysis.legalTopic,
                    details: problemText,
                  }));
                  setCurrentTab('documents');
                }}
                className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-xs"
              >
                <FileText size={14} />
                <span>Draft Formal Complaint / Notice</span>
              </button>

              <button
                onClick={() => setCurrentTab('lawyers')}
                className="bg-[#854d0e] hover:bg-[#713f12] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-xs"
              >
                <Scale size={14} />
                <span>Consult Empanelled Advocate</span>
              </button>

              <button
                onClick={() => setCurrentTab('evidence')}
                className="bg-stone-100 hover:bg-stone-200 text-slate-900 text-xs font-bold px-4 py-2.5 rounded-xl border border-stone-300 transition flex items-center space-x-1.5 shadow-xs"
              >
                <FolderLock size={14} />
                <span>Save Evidence to Vault</span>
              </button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-slate-700 italic leading-relaxed pt-2 font-medium">
              {analysis.disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
