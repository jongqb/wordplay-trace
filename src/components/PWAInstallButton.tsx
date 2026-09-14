import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Download, Share, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Hide if already running inside standalone PWA
  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-2xl bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold px-4 py-2.5 shadow-md active:scale-95 transition-all text-sm sm:text-base border-2 border-amber-300"
        title="Install Tablet App"
      >
        <Download className="w-5 h-5 animate-bounce text-amber-900" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-900 font-semibold px-3 py-2 text-xs sm:text-sm border border-sky-300 transition"
        >
          <Share className="w-4 h-4 text-sky-600" />
          <span>Install on iPad</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border-4 border-sky-200 text-center">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-sky-900">Install on iPad / iPhone</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed text-left">
                1. Tap the <strong className="text-sky-600">Share</strong> button in your Safari navigation bar.<br />
                2. Scroll down and choose <strong className="text-sky-600">Add to Home Screen</strong>.<br />
                3. Open WordPlay Trace directly with full-screen tablet experience!
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-2xl bg-sky-500 hover:bg-sky-600 py-3 text-white font-bold transition shadow-md"
              >
                Got It!
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
