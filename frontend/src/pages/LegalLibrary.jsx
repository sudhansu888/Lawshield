import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Scale, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { api } from '../services/api';

export const LegalLibrary = ({ setCurrentTab }) => {
  const [laws, setLaws] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLaws = async () => {
    try {
      setLoading(true);
      const res = await api.get('/laws', {
        params: {
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          q: searchQuery || undefined,
        },
      });
      if (res.data.success) {
        setLaws(res.data.laws);
      }
    } catch (err) {
      console.warn('Laws fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/laws/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchLaws();
  }, [selectedCategory, searchQuery]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="border-b border-stone-200 pb-5 space-y-2">
        <div className="inline-flex items-center space-x-2 text-xs font-extrabold text-[#854d0e] bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          <BookOpen size={14} className="text-[#854d0e]" />
          <span>Statutory Rights & Penal Provisions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0f172a] tracking-tight">
          Know Your Legal Rights & Penal Provisions
        </h1>
        <p className="text-xs sm:text-sm text-slate-800 font-medium">
          Searchable legal encyclopaedia covering IPC/BNS, POSH, Cyber Crime, Domestic Violence, and Consumer Protections.
        </p>
      </div>

      {/* Search & Categories Bar */}
      <div className="bg-white p-4 rounded-2xl border-2 border-stone-200 flex flex-col md:flex-row items-center gap-4 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by section, keyword, or right..."
            className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-4 py-2 text-xs text-[#0f172a] font-semibold placeholder:text-slate-500 focus:outline-none focus:border-[#0f172a] focus:bg-white"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full no-scrollbar pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition shadow-xs ${
                selectedCategory === cat
                  ? 'bg-[#0f172a] text-white'
                  : 'bg-stone-100 text-slate-800 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Laws List Accordions */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-stone-200 p-6 rounded-2xl h-24"></div>
          ))}
        </div>
      ) : laws.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 space-y-3">
          <Scale size={36} className="mx-auto text-slate-400" />
          <p className="text-xs text-slate-600 font-medium">No laws found matching your search.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {laws.map((law) => {
            const isExpanded = expandedId === law._id;
            return (
              <div
                key={law._id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden transition shadow-xs hover:border-stone-400"
              >
                {/* Header row */}
                <div
                  onClick={() => toggleExpand(law._id)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition select-none"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#854d0e] shrink-0">
                      <Scale size={20} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-extrabold text-[#854d0e] font-mono">
                          {law.section}
                        </span>
                        <span className="text-[10px] uppercase font-extrabold text-slate-800 bg-stone-100 border border-stone-200 px-2 py-0.5 rounded">
                          {law.category}
                        </span>
                      </div>
                      <h3 className="text-sm font-black text-[#0f172a] mt-0.5">
                        {law.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded ${
                        law.severity === 'EMERGENCY'
                          ? 'bg-red-50 text-red-950 border border-red-300'
                          : law.severity === 'HIGH'
                          ? 'bg-rose-50 text-rose-950 border border-rose-300'
                          : 'bg-amber-50 text-amber-950 border border-amber-300'
                      }`}
                    >
                      {law.severity}
                    </span>
                    {isExpanded ? <ChevronUp size={18} className="text-slate-600" /> : <ChevronDown size={18} className="text-slate-600" />}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="p-5 pt-0 border-t border-stone-200 space-y-4 bg-stone-50/50 text-xs">
                    <div>
                      <h4 className="font-extrabold text-[#0f172a] uppercase tracking-wider text-[11px] mb-1">
                        Plain-English Legal Explanation
                      </h4>
                      <p className="text-slate-800 leading-relaxed bg-white p-3.5 rounded-xl border border-stone-200 font-medium">
                        {law.explanation}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-[#0f172a] uppercase tracking-wider text-[11px] mb-1">
                        Applicability & Jurisdiction
                      </h4>
                      <p className="text-slate-800 leading-relaxed font-medium">
                        {law.applicability}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-[#0f172a] uppercase tracking-wider text-[11px] mb-2">
                        Your Enforceable Statutory Rights
                      </h4>
                      <div className="space-y-1.5">
                        {law.rights.map((r, idx) => (
                          <div key={idx} className="flex items-start space-x-2 text-slate-900 font-semibold">
                            <CheckCircle size={14} className="text-emerald-700 mt-0.5 shrink-0" />
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 font-medium shadow-xs">
                      <strong className="text-amber-950 font-extrabold">Action Plan: </strong>
                      <span>{law.recommendedAction}</span>
                    </div>

                    <div className="pt-2 flex justify-end space-x-3">
                      <button
                        onClick={() => setCurrentTab('documents')}
                        className="bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-xs"
                      >
                        <span>Draft Petition under this Law</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
