import React from 'react';
import { Scale } from 'lucide-react';

export const Logo = ({ 
  size = 'md', 
  showText = true, 
  animated = false, 
  subtitle = 'Digital Legal Counsel & Protection',
  className = '',
  variant = 'dark' // 'dark' text for light backgrounds, 'light' text for dark backgrounds
}) => {
  // Dimensions mapping
  const sizeMap = {
    sm: { icon: 32, text: 'text-base', subtext: 'text-[9px]', badge: 'text-[8px] px-1.5 py-0.5' },
    md: { icon: 40, text: 'text-lg', subtext: 'text-[10px]', badge: 'text-[9px] px-1.5 py-0.5' },
    lg: { icon: 54, text: 'text-2xl', subtext: 'text-xs', badge: 'text-[10px] px-2 py-0.5' },
    xl: { icon: 72, text: 'text-3xl sm:text-4xl', subtext: 'text-xs sm:text-sm', badge: 'text-xs px-2.5 py-1' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const iconPx = currentSize.icon;

  const isLightText = variant === 'light';

  return (
    <div className={`inline-flex items-center space-x-3 group select-none ${className}`}>
      {/* Modern Legal Shield & Scales of Justice Emblem */}
      <div 
        className="relative flex items-center justify-center shrink-0"
        style={{ width: iconPx, height: iconPx }}
      >
        {/* Subtle shadow */}
        <div className="absolute inset-0 rounded-xl bg-slate-900/5 blur-sm pointer-events-none" />

        {/* Master SVG Emblem */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full relative z-10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Shield Body Gradient - Deep Oxford Navy */}
            <linearGradient id="legalShieldBg" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* Noble Gold / Platinum Bevel Gradient */}
            <linearGradient id="legalBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="30%" stopColor="#b38b4d" />
              <stop offset="70%" stopColor="#d4af37" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>

            {/* Muted Gold Accent Gradient */}
            <linearGradient id="legalGoldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#b38b4d" />
              <stop offset="100%" stopColor="#997b3d" />
            </linearGradient>
          </defs>

          {/* Outer Shield Shell */}
          <path
            d="M50 10 L82 22 C82 56 68 78 50 90 C32 78 18 56 18 22 Z"
            fill="url(#legalShieldBg)"
            stroke="url(#legalBorderGrad)"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* Inner Inset Border */}
          <path
            d="M50 16 L76 26 C76 52 64 72 50 82 C36 72 24 52 24 26 Z"
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1"
          />

          {/* Classical Scales of Justice Pillar */}
          <line x1="50" y1="28" x2="50" y2="68" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="42" y1="68" x2="58" y2="68" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />

          {/* Scales Balance Beam */}
          <line x1="30" y1="36" x2="70" y2="36" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />

          {/* Central Scales Jewel */}
          <circle cx="50" cy="36" r="2.8" fill="url(#legalGoldAccent)" />

          {/* Left Scale Strings & Pan */}
          <line x1="30" y1="36" x2="24" y2="48" stroke="#94a3b8" strokeWidth="1.2" />
          <line x1="30" y1="36" x2="36" y2="48" stroke="#94a3b8" strokeWidth="1.2" />
          <path
            d="M22 48 C24 54 36 54 38 48 Z"
            fill="rgba(179, 139, 77, 0.3)"
            stroke="url(#legalGoldAccent)"
            strokeWidth="1.4"
          />

          {/* Right Scale Strings & Pan */}
          <line x1="70" y1="36" x2="64" y2="48" stroke="#94a3b8" strokeWidth="1.2" />
          <line x1="70" y1="36" x2="76" y2="48" stroke="#94a3b8" strokeWidth="1.2" />
          <path
            d="M62 48 C64 54 76 54 78 48 Z"
            fill="rgba(179, 139, 77, 0.3)"
            stroke="url(#legalGoldAccent)"
            strokeWidth="1.4"
          />

          {/* Subtle Base Star / Seal Emblem */}
          <path
            d="M50 74 L52 79 L57 79 L53 82 L55 87 L50 84 L45 87 L47 82 L43 79 L48 79 Z"
            fill="url(#legalGoldAccent)"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col justify-center text-left leading-tight">
          <div className="flex items-center space-x-2">
            <span className={`font-bold tracking-tight font-sans ${currentSize.text} ${isLightText ? 'text-white' : 'text-slate-900'}`}>
              Law<span className="text-[#b38b4d] font-semibold">Shield</span>
            </span>

            {/* Institutional Seal Tag */}
            <span className={`text-[9px] font-semibold tracking-wider uppercase border px-1.5 py-0.5 rounded ${
              isLightText
                ? 'text-amber-300 border-amber-500/40 bg-slate-900/80'
                : 'text-[#997b3d] border-amber-200/90 bg-amber-50/80'
            }`}>
              Chamber
            </span>
          </div>

          {subtitle && (
            <p className={`font-normal tracking-wide mt-0.5 ${currentSize.subtext} ${isLightText ? 'text-slate-400' : 'text-slate-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
