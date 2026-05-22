import React from "react";
import { KeyRound } from "lucide-react";

export const HootLogo = () => (
  <div className="flex flex-col items-center justify-center select-none" dir="ltr">
    <div className="flex items-center gap-1">
      <span className="text-5xl font-black tracking-tighter text-white">H</span>
      <div className="relative w-28 h-12 flex items-center justify-between">
        <svg viewBox="0 0 100 40" className="w-full h-full drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
          <path d="M 10 10 Q 50 -10 90 10 Q 90 40 50 40 Q 10 40 10 10 Z" fill="#111" />
          <circle cx="30" cy="22" r="14" fill="none" stroke="#eab308" strokeWidth="6" />
          <circle cx="32" cy="20" r="4" fill="white" />
          <circle cx="70" cy="22" r="14" fill="none" stroke="#eab308" strokeWidth="6" />
          <circle cx="68" cy="20" r="4" fill="white" />
          <path d="M 45 35 L 55 35 L 50 45 Z" fill="#111" />
        </svg>
      </div>
      <span className="text-5xl font-black tracking-tighter text-white">T</span>
    </div>
    <div className="flex items-center justify-between w-48 mt-1 border-t border-white/20 pt-1">
      <span className="text-white tracking-[0.3em] text-[10px] font-semibold">S</span>
      <span className="text-white tracking-[0.3em] text-[10px] font-semibold">T</span>
      <span className="text-white tracking-[0.3em] text-[10px] font-semibold">U</span>
      <span className="text-white tracking-[0.3em] text-[10px] font-semibold">D</span>
      <span className="text-white tracking-[0.3em] text-[10px] font-semibold">I</span>
      <span className="text-white tracking-[0.3em] text-[10px] font-semibold">O</span>
    </div>
  </div>
);

interface HeaderProps {
  onOpenAuth: () => void;
  apiStatus: "ready" | "demo" | "error" | "quota";
}

export default function Header({ onOpenAuth, apiStatus }: HeaderProps) {
  // Translate system states into descriptive Persian badges
  const getBadgeStyle = () => {
    switch (apiStatus) {
      case "ready":
        return { text: "API آماده است", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
      case "demo":
        return { text: "حالت دمو (محلی)", bg: "bg-blue-500/10 text-blue-400 border-blue-500/30" };
      case "quota":
        return { text: "سهمیه محدود شده", bg: "bg-orange-500/10 text-orange-400 border-orange-500/30" };
      case "error":
        return { text: "خطای اتصال API", bg: "bg-rose-500/10 text-rose-400 border-rose-500/30" };
      default:
        return { text: "تعریف نشده", bg: "bg-slate-700/10 text-slate-400 border-slate-700/30" };
    }
  };

  const badge = getBadgeStyle();

  return (
    <header className="py-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex flex-col items-center justify-center shrink-0 relative">
      <HootLogo />
      <p className="text-amber-500 mt-3 text-sm font-medium tracking-wide">AI Product Photography Studio</p>
      
      {/* Badges and API keys trigger panel */}
      <div className="absolute left-4 top-4 md:left-6 md:top-6 flex items-center gap-3">
        <span className={`hidden sm:inline-block px-3 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
          {badge.text}
        </span>
        <button 
          onClick={onOpenAuth}
          className="text-slate-400 hover:text-amber-500 transition-colors flex items-center gap-2 text-xs bg-slate-800/80 px-3.5 py-2 rounded-full border border-slate-700/60"
        >
          <KeyRound size={14} />
          مدیریت API
        </button>
      </div>

      <div className="absolute right-4 top-4 md:right-6 md:top-6 sm:hidden">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${badge.bg}`}>
          {badge.text}
        </span>
      </div>
    </header>
  );
}
