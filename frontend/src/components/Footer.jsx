import React from 'react';
import { Shield, Lock, AlertCircle, Phone } from 'lucide-react';
import { Logo } from './Logo';

export const Footer = ({ setCurrentTab }) => {
  return (
    <footer className="w-full bg-[#f8f7f4] border-t border-stone-200 text-slate-600 text-xs py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div onClick={() => setCurrentTab('home')} className="cursor-pointer">
              <Logo size="sm" variant="dark" />
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              Institutional statutory guidance, verified Bar Council advocate consultations, automated legal drafting, and confidential citizen protection infrastructure.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-[#b38b4d] font-semibold">
              <Lock size={12} />
              <span>256-bit TLS Encrypted Client Privilege</span>
            </div>
          </div>

          {/* Quick Access */}
          <div>
            <h4 className="font-bold text-[#0f172a] uppercase tracking-wider text-[11px] mb-3">
              Practice Services
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setCurrentTab('ai-assistant')} className="hover:text-[#0f172a] transition text-left">
                  Statutory Guidance & Rights
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('case-intelligence')} className="hover:text-[#0f172a] transition text-left">
                  Case Briefs & Evidence Dossiers
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('lawyers')} className="hover:text-[#0f172a] transition text-left">
                  Empanelled Bar Council Advocates
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('documents')} className="hover:text-[#0f172a] transition text-left">
                  Automated Legal Notices & FIRs
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('evidence')} className="hover:text-[#0f172a] transition text-left">
                  Section 65B Evidence Vault
                </button>
              </li>
              <li className="pt-1 border-t border-stone-200/60">
                <button onClick={() => setCurrentTab('login')} className="text-[#0f172a] font-bold hover:text-[#854d0e] transition text-left flex items-center space-x-1">
                  <span>Sign In to Legal Portal</span>
                  <span>→</span>
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('register')} className="text-[#854d0e] font-bold hover:underline transition text-left flex items-center space-x-1">
                  <span>Create Account / Register</span>
                  <span>→</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Emergency Helplines */}
          <div>
            <h4 className="font-bold text-[#0f172a] uppercase tracking-wider text-[11px] mb-3">
              National Emergency Helplines
            </h4>
            <ul className="space-y-2 text-slate-700">
              <li className="flex items-center space-x-2">
                <Phone size={12} className="text-red-700" />
                <span>Police National Emergency: <strong className="text-slate-900 font-bold">112</strong></span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={12} className="text-red-700" />
                <span>Women Helpline: <strong className="text-slate-900 font-bold">1091</strong></span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={12} className="text-[#b38b4d]" />
                <span>NCW 24/7 Helpline: <strong className="text-slate-900 font-bold">7827170170</strong></span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={12} className="text-slate-700" />
                <span>Cyber Crime Portal: <strong className="text-slate-900 font-bold">1930</strong></span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={12} className="text-emerald-700" />
                <span>Childline Support: <strong className="text-slate-900 font-bold">1098</strong></span>
              </li>
            </ul>
          </div>

          {/* Disclaimers */}
          <div>
            <h4 className="font-bold text-[#0f172a] uppercase tracking-wider text-[11px] mb-3">
              Bar Council Compliance Notice
            </h4>
            <div className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs space-y-2 text-[11px] leading-relaxed text-slate-600">
              <div className="flex items-start space-x-1.5 text-[#b38b4d] font-semibold">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>Statutory Disclaimer</span>
              </div>
              <p>
                LawShield provides legal informatics, statutory research, and document drafting templates. It does not replace a licensed advocate-client relationship. In imminent danger, dial 112.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} LawShield. Dedicated to citizen safety and constitutional justice.</p>
          <div className="flex space-x-4 mt-2 sm:mt-0">
            <span className="hover:text-slate-800 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-800 cursor-pointer">Privacy & Data Protection</span>
            <span>•</span>
            <span className="hover:text-slate-800 cursor-pointer">Section 65B Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
