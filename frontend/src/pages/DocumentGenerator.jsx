import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Copy, 
  Download, 
  Check, 
  Sparkles, 
  ShieldAlert, 
  Trash2, 
  Eye, 
  FileCheck,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const DocumentGenerator = () => {
  const { user, showToast } = useAuth();
  const [docType, setDocType] = useState('Police Complaint (Zero FIR)');
  const [formData, setFormData] = useState({
    complainantName: user?.name || 'Ananya Sharma',
    phone: user?.phone || '+91 98765 43210',
    address: 'Flat 402, Lotus Heights, New Delhi',
    policeStation: 'Any Police Station under Zero FIR Mandate',
    accusedName: 'Rajesh Kumar / Unknown Caller',
    accusedDetails: 'Phone: +91 91234 56789, Vehicle: DL 3C AB 1234',
    incidentDate: '2026-09-14',
    incidentPlace: 'Near Metro Station / Workplace Premises',
    incidentDetails: 'The accused has been repeatedly following me, making sexually colored remarks, and sending vulgar messages despite clear objections.',
    reliefs: 'Immediate registration of FIR under Sec 354 & 506 IPC, seizure of surveillance footage, and police protection.',
    organizationName: 'Tech Innovations Pvt. Ltd.',
    designation: 'Senior Analyst',
    department: 'Operations',
    noticeSubject: 'Unlawful Withholding of Security Deposit & Breach of Tenancy Agreement',
    claimAmount: '45,000',
  });

  const [compiledContent, setCompiledContent] = useState('');
  const [myDocuments, setMyDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'vault'

  // Pre-fill query if forwarded from AI Legal Assistant
  useEffect(() => {
    const prefill = localStorage.getItem('lawshield_prefill_complaint');
    if (prefill) {
      try {
        const data = JSON.parse(prefill);
        if (data.details) {
          setFormData((prev) => ({
            ...prev,
            incidentDetails: data.details,
          }));
        }
      } catch (e) {}
      localStorage.removeItem('lawshield_prefill_complaint');
    }
  }, []);

  const fetchMyDocuments = async () => {
    try {
      const res = await api.get('/documents/my');
      if (res.data.success) {
        setMyDocuments(res.data.documents);
      }
    } catch (err) {
      console.warn('Could not fetch documents:', err.message);
    }
  };

  useEffect(() => {
    fetchMyDocuments();
  }, []);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/documents/generate', {
        docType,
        title: `${docType} - ${new Date().toISOString().split('T')[0]}`,
        formData,
      });

      if (res.data.success) {
        setCompiledContent(res.data.document.compiledContent);
        showToast('Legal document generated successfully!', 'success');
        fetchMyDocuments();
      }
    } catch (err) {
      showToast('Document drafting failed. Please check form data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!compiledContent) return;
    navigator.clipboard.writeText(compiledContent);
    setCopied(true);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${docType}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; color: #111; }
            pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; }
          </style>
        </head>
        <body>
          <pre>${compiledContent}</pre>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleFillSample = () => {
    setFormData({
      complainantName: user?.name || 'Ananya Sharma',
      phone: user?.phone || '+91 98765 43210',
      address: 'Flat 402, Lotus Heights, New Delhi',
      policeStation: 'Connaught Place Police Station / Zero FIR',
      accusedName: 'Rohan Mehra & Associates',
      accusedDetails: 'Workplace Manager / Contact: +91 98111 99999',
      incidentDate: '12th September 2026',
      incidentPlace: 'Head Office, Cyber Hub',
      incidentDetails: 'Persistent verbal abuse, derogatory sexually colored remarks, hostile retaliation during appraisals, and threats to terminate employment upon resistance.',
      reliefs: 'Statutory inquiry under POSH Act Section 9, immediate paid leave accommodation, and protection against termination under Section 12.',
      organizationName: 'Global Fintech Solutions',
      designation: 'Product Associate',
      department: 'Technology',
      noticeSubject: 'Formal Demand for Outstanding Salary & Statutory Gratuity',
      claimAmount: '75,000',
    });
    showToast('Sample legal details loaded', 'info');
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/documents/${id}`);
      if (res.data.success) {
        showToast('Document deleted from archive', 'info');
        setMyDocuments((prev) => prev.filter((d) => d._id !== id));
      }
    } catch (err) {
      showToast('Could not delete document', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-extrabold text-[#854d0e] bg-amber-50 px-3 py-1 rounded-full border border-amber-200 mb-2">
            <FileCheck size={14} className="text-[#854d0e]" />
            <span>Statutory Document Drafting Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight">
            Automated Legal Complaint & Notice Drafter
          </h1>
          <p className="text-xs sm:text-sm text-slate-800 mt-1 font-medium">
            Generate legally enforceable Zero FIR petitions, POSH workplace harassment complaints, and formal legal notices.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleFillSample}
            className="bg-stone-100 hover:bg-stone-200 text-slate-900 text-xs font-bold px-3.5 py-2.5 rounded-xl border border-stone-300 transition flex items-center space-x-1.5 shadow-xs"
          >
            <Sparkles size={14} className="text-[#854d0e]" />
            <span>Auto-Fill Sample Data</span>
          </button>

          <button
            onClick={() => setActiveTab(activeTab === 'generator' ? 'vault' : 'generator')}
            className="bg-[#0f172a] hover:bg-[#1e293b] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs"
          >
            {activeTab === 'generator' ? `My Saved Drafts (${myDocuments.length})` : 'Create New Document'}
          </button>
        </div>
      </div>

      {activeTab === 'generator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Controls (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border-2 border-stone-200 space-y-5 shadow-sm">
            {/* Template Selector */}
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#0f172a] block mb-2">
                Select Legal Document Type
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-stone-50 border-2 border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-[#0f172a] focus:outline-none focus:border-[#0f172a] font-bold shadow-xs"
              >
                <option value="Police Complaint (Zero FIR)">Police Complaint (Zero FIR - Mandatory Acceptance)</option>
                <option value="POSH Workplace Harassment Complaint">POSH Workplace Sexual Harassment Petition (ICC)</option>
                <option value="Cybercrime Grievance Report">Cybercrime Grievance Report (IT Act Sec 66/67)</option>
                <option value="Legal Notice">Legal Notice (Tenancy / Deposit / Breach of Contract)</option>
              </select>
            </div>

            {/* Dynamic Form Fields */}
            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-900 font-bold block mb-1">Complainant Name</label>
                  <input
                    type="text"
                    required
                    value={formData.complainantName}
                    onChange={(e) => setFormData({ ...formData, complainantName: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-[#0f172a] font-semibold focus:outline-none focus:border-[#0f172a] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-slate-900 font-bold block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-[#0f172a] font-semibold focus:outline-none focus:border-[#0f172a] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-900 font-bold block mb-1">Complainant Address / City</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-[#0f172a] font-semibold focus:outline-none focus:border-[#0f172a] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-900 font-bold block mb-1">Accused / Respondent Name</label>
                  <input
                    type="text"
                    required
                    value={formData.accusedName}
                    onChange={(e) => setFormData({ ...formData, accusedName: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-[#0f172a] font-semibold focus:outline-none focus:border-[#0f172a] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-slate-900 font-bold block mb-1">Incident Date</label>
                  <input
                    type="text"
                    required
                    value={formData.incidentDate}
                    onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-[#0f172a] font-semibold focus:outline-none focus:border-[#0f172a] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-900 font-bold block mb-1">Place of Incident / Workplace</label>
                <input
                  type="text"
                  required
                  value={formData.incidentPlace}
                  onChange={(e) => setFormData({ ...formData, incidentPlace: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-[#0f172a] font-semibold focus:outline-none focus:border-[#0f172a] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-slate-900 font-bold block mb-1">Detailed Facts & Chronology of Offence</label>
                <textarea
                  rows={4}
                  required
                  value={formData.incidentDetails}
                  onChange={(e) => setFormData({ ...formData, incidentDetails: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 text-[#0f172a] font-semibold focus:outline-none focus:border-[#0f172a] focus:bg-white leading-relaxed"
                />
              </div>

              <div>
                <label className="text-slate-900 font-bold block mb-1">Reliefs / Action Demanded</label>
                <input
                  type="text"
                  required
                  value={formData.reliefs}
                  onChange={(e) => setFormData({ ...formData, reliefs: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-[#0f172a] font-semibold focus:outline-none focus:border-[#0f172a] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs py-3 rounded-xl transition shadow-xs flex items-center justify-center space-x-2"
              >
                <Sparkles size={14} />
                <span>{loading ? 'Compiling Legal Draft...' : 'Compile & Save Legal Draft'}</span>
              </button>
            </form>
          </div>

          {/* Formatted Output Preview (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border-2 border-stone-200 space-y-4 shadow-sm flex flex-col h-[650px]">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center space-x-2">
                <FileText size={16} className="text-[#854d0e]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0f172a]">
                  Live Legal Preview & Print View
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  disabled={!compiledContent}
                  className="bg-stone-100 hover:bg-stone-200 disabled:opacity-40 text-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg border border-stone-300 transition flex items-center space-x-1 shadow-xs"
                >
                  {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={handlePrint}
                  disabled={!compiledContent}
                  className="bg-[#854d0e] hover:bg-[#713f12] disabled:opacity-40 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition flex items-center space-x-1 shadow-xs"
                >
                  <Printer size={12} />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>

            {/* Document display paper container */}
            <div className="flex-1 bg-[#fcfbf9] p-6 sm:p-8 rounded-2xl border-2 border-stone-300 overflow-y-auto font-serif text-xs sm:text-sm text-slate-950 leading-relaxed shadow-inner">
              {compiledContent ? (
                <pre className="whitespace-pre-wrap font-serif text-xs sm:text-sm text-slate-950 leading-relaxed">
                  {compiledContent}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 space-y-3">
                  <FileText size={36} className="text-slate-400" />
                  <p className="max-w-xs text-xs font-medium">
                    Fill out the form on the left or tap "Auto-Fill Sample Data" to generate an official formatted petition.
                  </p>
                </div>
              )}
            </div>

            <p className="text-xs text-slate-700 italic font-medium">
              Note: This formal draft is compiled in accordance with standard Indian legal protocol. Attach Section 65B certified evidence where required.
            </p>
          </div>
        </div>
      ) : (
        /* Saved Documents Archive */
        <div className="space-y-4">
          <h2 className="text-xl font-black text-[#0f172a]">Your Saved Legal Petitions</h2>
          {myDocuments.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 space-y-3">
              <FileText size={36} className="mx-auto text-slate-400" />
              <p className="text-xs text-slate-600 font-medium">No documents drafted yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myDocuments.map((doc) => (
                <div
                  key={doc._id}
                  className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {doc.docType}
                      </span>
                      <h3 className="text-sm font-bold text-white mt-1">{doc.title}</h3>
                      <p className="text-[11px] text-slate-400">Created on {new Date(doc.createdAt).toLocaleDateString()}</p>
                    </div>

                    <button
                      onClick={() => handleDelete(doc._id)}
                      className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-800 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300 line-clamp-3 font-mono">
                    {doc.compiledContent}
                  </div>

                  <div className="flex items-center justify-end space-x-2 pt-1">
                    <button
                      onClick={() => {
                        setCompiledContent(doc.compiledContent);
                        setActiveTab('generator');
                      }}
                      className="text-xs text-blue-400 hover:underline flex items-center space-x-1"
                    >
                      <Eye size={13} />
                      <span>View & Print</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
