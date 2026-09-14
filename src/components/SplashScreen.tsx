import React from 'react';
import { AppIcon } from './AppIcon';
import { soundEngine } from '../utils/audio';
import { Play, Sparkles, BookOpen, PenTool } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface SplashScreenProps {
  onStart: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
  const handleStart = () => {
    soundEngine.playStarPop(3);
    soundEngine.playVictoryFanfare();
    onStart();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-[#E0F2FE] via-[#F0F9FF] to-[#DBEAFE] p-6 text-center select-none overflow-hidden">
      {/* Decorative Floating Clouds / Glow Bubbles */}
      <div className="absolute top-12 left-12 w-48 h-48 rounded-full bg-white/40 blur-2xl pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-64 h-64 rounded-full bg-amber-200/40 blur-3xl pointer-events-none" />

      {/* Main Tablet Hero Card */}
      <div className="relative max-w-lg w-full bg-white/85 backdrop-blur-md rounded-3xl p-6 sm:p-8 border-4 border-sky-200 shadow-2xl flex flex-col items-center">
        {/* Official App Icon Embedded Directly */}
        <div className="mb-4 transform hover:scale-105 transition-transform duration-300">
          <AppIcon size={140} showText={false} />
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-black text-sky-600 tracking-tight mb-2">
          WordPlay <span className="text-amber-500">Trace</span>
        </h1>

        <p className="text-slate-600 font-bold text-sm sm:text-base max-w-sm mb-6">
          Fun handwriting, spelling & stroke tracing for kids in English, Bahasa Malaysia, and Chinese!
        </p>

        {/* 3 Supported Languages Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 font-bold text-xs sm:text-sm shadow-2xs">
            <span>🇬🇧</span> English
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-orange-50 border border-orange-200 text-orange-800 font-bold text-xs sm:text-sm shadow-2xs">
            <span>🇲🇾</span> Bahasa Malaysia
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 font-bold text-xs sm:text-sm shadow-2xs">
            <span>🇨🇳</span> 中文汉字
          </span>
        </div>

        {/* Big Kid-Friendly Start Button */}
        <button
          onClick={handleStart}
          className="w-full sm:w-auto min-w-[240px] flex items-center justify-center gap-3 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-slate-950 font-black text-xl sm:text-2xl px-8 py-4 rounded-3xl shadow-xl shadow-amber-500/30 border-4 border-amber-300 transition-all active:scale-95 animate-pulse"
        >
          <Play className="w-7 h-7 fill-slate-950 text-slate-950" />
          <span>Let's Play & Trace!</span>
        </button>

        {/* PWA Install Button on Splash Screen */}
        <div className="mt-6">
          <PWAInstallButton />
        </div>
      </div>
    </div>
  );
};
