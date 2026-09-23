import React from 'react';
import { Mic } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const FloatingVoiceButton = ({ onOpenVoiceModal }) => {
  const { currentLangConfig, t } = useLanguage();

  return (
    <div className="fixed bottom-24 right-6 z-40 flex items-center group">
      {/* Tooltip on hover */}
      <div className="hidden md:flex items-center mr-3 px-3 py-1.5 rounded-lg bg-white border border-stone-200 text-xs text-slate-800 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0 pointer-events-none whitespace-nowrap">
        <span className="font-semibold text-[#b38b4d] mr-1.5">{currentLangConfig.flag} {t('voice_dictate')}:</span>
        <span className="text-slate-600">Dictate in {currentLangConfig.nativeName}</span>
      </div>

      {/* Floating Action Button - Deep Navy with Muted Gold Icon */}
      <button
        onClick={onOpenVoiceModal}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-[#0f172a] hover:bg-[#1e293b] text-white border border-stone-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[#0f172a]/20"
        title={t('voice_dictate')}
        aria-label="Open Voice Legal Intake"
      >
        <Mic className="w-5 h-5 text-[#b38b4d]" />
      </button>
    </div>
  );
};
