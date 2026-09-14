import React, { useEffect, useRef, useState } from 'react';
import HanziWriter from 'hanzi-writer';
import { WordItem, ParentSettings } from '../types';
import { soundEngine } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Play, Sparkles, Volume2, RotateCcw, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';

interface ChineseHanziTracerProps {
  wordItem: WordItem;
  currentRepetition: number;
  totalRepetitions: number;
  settings: ParentSettings;
  onRepetitionComplete: () => void;
  onAdvanceToNextWord?: () => void;
  onAdvanceToTest?: () => void;
}

export const ChineseHanziTracer: React.FC<ChineseHanziTracerProps> = ({
  wordItem,
  currentRepetition,
  totalRepetitions,
  settings,
  onRepetitionComplete,
  onAdvanceToNextWord,
  onAdvanceToTest,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const writerRef = useRef<HanziWriter | null>(null);

  const characters = wordItem.word.split('');
  const [activeCharIndex, setActiveCharIndex] = useState(0);
  const activeChar = characters[activeCharIndex] || '学';

  const [isAnimating, setIsAnimating] = useState(false);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [characterPassed, setCharacterPassed] = useState(false);
  const [strokeMistakes, setStrokeMistakes] = useState(0);
  const [loadingError, setLoadingError] = useState(false);

  // Initialize HanziWriter for active character
  useEffect(() => {
    setCharacterPassed(false);
    setStrokeMistakes(0);
    setLoadingError(false);

    if (settings.autoNarrate) {
      soundEngine.speak(wordItem.word, 'zh', settings.speechRate);
    }

    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    try {
      const writer = HanziWriter.create(containerRef.current, activeChar, {
        width: 320,
        height: 320,
        padding: 24,
        showOutline: true,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 250,
        strokeColor: '#EA580C', // Orange theme matching logo
        outlineColor: '#CBD5E1',
        drawingColor: '#2563EB', // Blue drawing stroke
        drawingWidth: 26,
        showCharacter: false,
        showHintAfterMisses: 2,
        highlightColor: '#10B981', // Green highlight
        onLoadCharDataError: () => {
          setLoadingError(true);
        },
      });

      writerRef.current = writer;

      // Start quiz mode automatically for kids
      writer.quiz({
        onCorrectStroke: () => {
          soundEngine.playTraceStroke();
        },
        onMistake: () => {
          soundEngine.playGentleBoop();
          setStrokeMistakes((m) => m + 1);
        },
        onComplete: () => {
          setCharacterPassed(true);
          soundEngine.playVictoryFanfare();
          try {
            confetti({
              particleCount: 50,
              spread: 70,
              origin: { y: 0.65 },
              colors: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'],
            });
          } catch {}
        },
      });
      setIsQuizMode(true);
    } catch (err) {
      console.warn('HanziWriter init error', err);
      setLoadingError(true);
    }

    return () => {
      if (writerRef.current) {
        writerRef.current.cancelQuiz();
      }
    };
  }, [activeChar, wordItem.id, currentRepetition]);

  const speakCharacter = () => {
    soundEngine.speak(wordItem.word, 'zh', settings.speechRate);
  };

  const handleAnimateStrokes = () => {
    if (!writerRef.current || isAnimating) return;
    setIsAnimating(true);
    setIsQuizMode(false);
    writerRef.current.animateCharacter({
      onComplete: () => {
        setIsAnimating(false);
        // Resume quiz mode after animation finishes
        startQuiz();
      },
    });
  };

  const startQuiz = () => {
    if (!writerRef.current) return;
    setIsQuizMode(true);
    setCharacterPassed(false);
    writerRef.current.quiz({
      onCorrectStroke: () => {
        soundEngine.playTraceStroke();
      },
      onMistake: () => {
        soundEngine.playGentleBoop();
        setStrokeMistakes((m) => m + 1);
      },
      onComplete: () => {
        setCharacterPassed(true);
        soundEngine.playVictoryFanfare();
        try {
          confetti({
            particleCount: 50,
            spread: 70,
            origin: { y: 0.65 },
          });
        } catch {}
      },
    });
  };

  const handleGiveHint = () => {
    if (!writerRef.current) return;
    soundEngine.playTraceStroke();
    writerRef.current.hideCharacter();
    writerRef.current.showOutline();
  };

  const handleNextCharOrComplete = () => {
    if (activeCharIndex + 1 < characters.length) {
      setActiveCharIndex((prev) => prev + 1);
    } else {
      handleFullWordComplete();
    }
  };

  const handleFullWordComplete = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
      });
    } catch {}

    if (currentRepetition < totalRepetitions) {
      onRepetitionComplete();
    } else {
      if (onAdvanceToNextWord) {
        onAdvanceToNextWord();
      } else if (onAdvanceToTest) {
        onAdvanceToTest();
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center select-none">
      {/* Top Banner: Repetition Step & Chinese Pinyin */}
      <div className="w-full flex items-center justify-between bg-white/90 rounded-3xl p-3 sm:p-4 mb-3 border-2 border-rose-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-rose-500 text-white font-black px-3 py-1.5 rounded-2xl text-xs sm:text-sm tracking-wide shadow-xs">
            中文汉字笔顺 (CHINESE)
          </div>
          <div className="text-slate-600 font-bold text-xs sm:text-sm">
            练习次数: <span className="text-rose-600 font-black">{currentRepetition}</span> /{' '}
            <span className="text-slate-800">{totalRepetitions}</span>
          </div>
        </div>

        {/* Audio pronunciation */}
        <button
          onClick={speakCharacter}
          className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-amber-900 font-bold px-4 py-2 rounded-2xl border-2 border-amber-300 transition active:scale-95 text-sm sm:text-base"
        >
          <Volume2 className="w-5 h-5 text-amber-700 animate-bounce" />
          <span>读音: {wordItem.phonetic || wordItem.word}</span>
        </button>
      </div>

      {/* Multi-Character Navigation (if word has multiple Hanzi) */}
      {characters.length > 1 && (
        <div className="flex items-center gap-2 mb-3">
          {characters.map((char, idx) => (
            <button
              key={idx}
              onClick={() => setActiveCharIndex(idx)}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl transition-all ${
                idx === activeCharIndex
                  ? 'bg-rose-500 text-white shadow-md scale-105'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-rose-50'
              }`}
            >
              {char}
            </button>
          ))}
        </div>
      )}

      {/* Main Tian-Zi-Ge (田字格) Tracing Board */}
      <div className="relative w-full aspect-[4/3] max-h-[460px] bg-amber-50/60 rounded-3xl border-6 border-rose-300 shadow-2xl overflow-hidden flex flex-col items-center justify-center p-4">
        {/* Tian-Zi-Ge Grid Card */}
        <div className="relative p-2 rounded-3xl bg-white shadow-md border-4 border-rose-400">
          <div
            ref={containerRef}
            className="tian-zi-ge rounded-2xl flex items-center justify-center w-[300px] h-[300px] sm:w-[320px] sm:h-[320px] touch-none cursor-crosshair overflow-hidden"
          />

          {/* Loading or Offline Fallback if CDN Hanzi stroke data unavailable */}
          {loadingError && (
            <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
              <span className="text-7xl font-black text-rose-500 mb-2 font-sans">{activeChar}</span>
              <p className="text-sm text-slate-600 font-bold mb-3">
                Trace character "{activeChar}" directly on screen!
              </p>
              <button
                onClick={handleFullWordComplete}
                className="bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-sm"
              >
                Mark Done & Continue
              </button>
            </div>
          )}
        </div>

        {/* Stroke Action Floating Buttons */}
        <div className="flex items-center gap-2.5 mt-3">
          <button
            onClick={handleAnimateStrokes}
            disabled={isAnimating}
            className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95 text-xs sm:text-sm"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>演示笔顺 (Demonstrate)</span>
          </button>

          <button
            onClick={startQuiz}
            className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold px-3.5 py-2 rounded-xl shadow-xs transition active:scale-95 text-xs sm:text-sm border border-amber-300"
          >
            <RotateCcw className="w-4 h-4" />
            <span>重新描红 (Trace)</span>
          </button>

          <button
            onClick={handleGiveHint}
            className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 font-bold px-3 py-2 rounded-xl border border-slate-300 transition text-xs sm:text-sm shadow-2xs"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>提示 (Hint)</span>
          </button>
        </div>

        {/* Character Completed Overlay */}
        {characterPassed && (
          <div className="absolute inset-0 bg-slate-900/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300 z-10">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-3 shadow-lg animate-bounce">
              <Sparkles className="w-9 h-9" />
            </div>
            <h4 className="text-3xl font-black text-white mb-1">
              恭喜！汉字 "{activeChar}" 描红成功！
            </h4>
            <p className="text-emerald-300 font-bold text-sm mb-4">
              Pinyin: <strong className="text-yellow-300">{wordItem.phonetic}</strong> | 意思: {wordItem.translation}
            </p>

            <div className="flex gap-3">
              <button
                onClick={startQuiz}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-2xl border border-slate-600 transition"
              >
                <RotateCcw className="w-5 h-5" />
                <span>再写一次</span>
              </button>

              <button
                onClick={handleNextCharOrComplete}
                className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-6 py-2.5 rounded-2xl shadow-lg border-2 border-amber-300 transition active:scale-95 text-lg"
              >
                <span>下一关 (Next)</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Info Bar */}
      <div className="w-full flex items-center justify-between mt-3 px-2">
        <div className="text-slate-600 font-semibold text-xs sm:text-sm">
          汉字释义: <strong className="text-rose-600">{wordItem.translation}</strong>
          {wordItem.notes && <span className="ml-2 text-slate-400">({wordItem.notes})</span>}
        </div>

        <button
          onClick={handleFullWordComplete}
          className="flex items-center gap-1.5 text-rose-800 hover:text-rose-950 font-bold bg-rose-100 hover:bg-rose-200 px-4 py-2 rounded-2xl border border-rose-300 shadow-2xs text-sm"
        >
          <span>进入听写测试 (Test)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
