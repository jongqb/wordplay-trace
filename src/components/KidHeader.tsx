import React from 'react';
import { AppIcon } from './AppIcon';
import { Language } from '../types';
import { Star, Volume2, VolumeX, Shield, Sparkles } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { soundEngine } from '../utils/audio';

interface KidHeaderProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  stars: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenParentPin: () => void;
  letterCase?: 'uppercase' | 'lowercase';
  onToggleLetterCase?: () => void;
}

export const KidHeader: React.FC<KidHeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  stars,
  isMuted,
  onToggleMute,
  onOpenParentPin,
  letterCase = 'uppercase',
  onToggleLetterCase,
}) => {
  const languages: { code: Language; label: string; flag: string; color: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧', color: 'from-blue-500 to-indigo-600' },
    { code: 'bm', label: 'B. Malaysia', flag: '🇲🇾', color: 'from-orange-500 to-amber-600' },
    { code: 'zh', label: '中文 (Chinese)', flag: '🇨🇳', color: 'from-rose-500 to-red-600' },
  ];

  return (
    <header className="w-full bg-white/90 backdrop-blur-md border-b-4 border-sky-100 shadow-xs px-4 py-2.5 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-40">
      {/* Brand & App Icon */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <AppIcon size={46} showText={false} className="hover:scale-105 transition-transform" />
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-sky-600 font-sans">
              WordPlay
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-500">
              Trace
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium hidden sm:block">
            Learn • Spell • Trace
          </p>
        </div>
      </div>

      {/* Language Pills for Tablet */}
      <div className="flex items-center bg-sky-100/70 p-1 rounded-2xl border border-sky-200 gap-1">
        {languages.map((lang) => {
          const isActive = currentLanguage === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => {
                soundEngine.playTraceStroke();
                onLanguageChange(lang.code);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 ${
                isActive
                  ? 'bg-white text-sky-700 shadow-sm border border-sky-300 scale-102'
                  : 'text-slate-600 hover:text-sky-800 hover:bg-white/50'
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="hidden md:inline">{lang.label}</span>
              <span className="md:hidden">{lang.code.toUpperCase()}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Letter Case Toggle (for English & Malay) */}
      {currentLanguage !== 'zh' && onToggleLetterCase && (
        <button
          onClick={onToggleLetterCase}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-300 text-amber-900 font-black text-xs transition active:scale-95 shadow-2xs"
          title="Switch between Capital Letters and Small Letters"
        >
          <span className="text-base font-mono">{letterCase === 'lowercase' ? 'abc' : 'ABC'}</span>
          <span className="hidden lg:inline text-[11px] text-amber-700 font-bold">
            ({letterCase === 'lowercase' ? 'Small' : 'Capitals'})
          </span>
        </button>
      )}

      {/* Right Controls: Stars, Sound, Install, Parent Lock */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Star Counter */}
        <div className="flex items-center gap-1.5 bg-amber-50 border-2 border-amber-200 px-3 py-1.5 rounded-2xl shadow-xs">
          <Star className="w-5 h-5 fill-amber-400 text-amber-500 animate-pulse" />
          <span className="font-black text-amber-800 text-base sm:text-lg">{stars}</span>
        </div>

        {/* Mute/Unmute */}
        <button
          onClick={onToggleMute}
          className="p-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition active:scale-90"
          title={isMuted ? 'Turn Sound On' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5" />}
        </button>

        {/* PWA Install */}
        <div className="hidden sm:block">
          <PWAInstallButton />
        </div>

        {/* Parent Zone Button with clear label */}
        <button
          onClick={onOpenParentPin}
          className="flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 active:scale-95 text-slate-950 font-black px-3 sm:px-4 py-2 rounded-2xl border-2 border-amber-300 shadow-xs transition text-xs sm:text-sm cursor-pointer"
          title="Parent Dashboard - Add/Delete Courses, Custom Words & Settings (PIN: 1234)"
        >
          <Shield className="w-4 h-4 text-slate-950" />
          <span className="inline">Parent Zone</span>
        </button>
      </div>
    </header>
  );
};
