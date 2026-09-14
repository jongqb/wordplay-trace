import React, { useState } from 'react';
import { Lock, X, Delete } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface PinModalProps {
  isOpen: boolean;
  correctPin: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const PinModal: React.FC<PinModalProps> = ({
  isOpen,
  correctPin,
  onSuccess,
  onClose,
}) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (enteredPin.length >= 4) return;
    soundEngine.playTraceStroke();
    const nextPin = enteredPin + digit;
    setEnteredPin(nextPin);

    if (nextPin.length === 4) {
      if (nextPin === correctPin) {
        soundEngine.playStarPop(2);
        setTimeout(() => {
          setEnteredPin('');
          onSuccess();
        }, 150);
      } else {
        soundEngine.playGentleBoop();
        setErrorShake(true);
        setTimeout(() => {
          setEnteredPin('');
          setErrorShake(false);
        }, 600);
      }
    }
  };

  const handleDelete = () => {
    soundEngine.playTraceStroke();
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border-4 border-amber-300 text-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-3 border-2 border-amber-200">
          <Lock className="w-7 h-7" />
        </div>

        <h3 className="text-2xl font-bold text-slate-800">Parent Zone</h3>
        <p className="text-sm text-slate-500 mt-1 mb-4">
          Enter parent PIN to manage courses (Default: <strong className="text-amber-600">1234</strong>)
        </p>

        {/* PIN Indicators */}
        <div
          className={`flex justify-center gap-3 mb-6 transition-transform ${
            errorShake ? 'animate-bounce text-red-500' : ''
          }`}
        >
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = enteredPin.length > idx;
            return (
              <div
                key={idx}
                className={`w-5 h-5 rounded-full border-2 transition-all ${
                  isFilled
                    ? 'bg-amber-500 border-amber-600 scale-110 shadow-sm'
                    : 'border-slate-300 bg-slate-100'
                }`}
              />
            );
          })}
        </div>

        {/* Numeric Keypad for Tablet */}
        <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              onClick={() => handleDigit(digit)}
              className="h-14 rounded-2xl bg-slate-100 hover:bg-amber-100 active:bg-amber-200 text-2xl font-bold text-slate-800 shadow-xs border border-slate-200 transition active:scale-95 flex items-center justify-center"
            >
              {digit}
            </button>
          ))}

          <button
            onClick={() => setEnteredPin('')}
            className="h-14 rounded-2xl bg-slate-100 hover:bg-red-50 active:bg-red-100 text-xs font-semibold text-slate-500 border border-slate-200 transition flex items-center justify-center"
          >
            Clear
          </button>

          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-slate-100 hover:bg-amber-100 active:bg-amber-200 text-2xl font-bold text-slate-800 shadow-xs border border-slate-200 transition active:scale-95 flex items-center justify-center"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-100 hover:bg-amber-100 active:bg-amber-200 text-slate-700 border border-slate-200 transition active:scale-95 flex items-center justify-center"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
