import React, { useRef, useState, useEffect } from 'react';
import { WordItem, ParentSettings } from '../types';
import { soundEngine } from '../utils/audio';
import { StorageService } from '../utils/storage';
import confetti from 'canvas-confetti';
import {
  Volume2,
  RotateCcw,
  Sparkles,
  Star,
  CheckCircle,
  Eye,
  EyeOff,
  Palette,
  Eraser,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

interface TestCanvasProps {
  wordItem: WordItem;
  currentIndex: number;
  totalWords: number;
  courseTitle: string;
  settings: ParentSettings;
  onTestComplete: (starsEarned: number) => void;
  onQuitTest: () => void;
}

export const TestCanvas: React.FC<TestCanvasProps> = ({
  wordItem,
  currentIndex,
  totalWords,
  courseTitle,
  settings,
  onTestComplete,
  onQuitTest,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [selectedColor, setSelectedColor] = useState('#2563EB'); // Default ocean blue
  const [brushWidth, setBrushWidth] = useState(14);
  const [isEraser, setIsEraser] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Test Evaluation State
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    passed: boolean;
    stars: number;
    feedback: string;
  } | null>(null);
  const [showPeek, setShowPeek] = useState(false);

  // Formatted word based on settings
  const targetWord =
    settings.letterCase === 'lowercase'
      ? wordItem.word.toLowerCase()
      : wordItem.word.toUpperCase();

  // Audio prompt on mount or word change
  useEffect(() => {
    narrateTestPrompt();
    clearCanvas();
  }, [wordItem.id, settings.letterCase]);

  const narrateTestPrompt = () => {
    let prompt = `Spell the word: ${targetWord}`;
    if (wordItem.language === 'bm') {
      prompt = `Eja perkataan: ${targetWord}`;
    } else if (wordItem.language === 'zh') {
      prompt = `听写汉字: ${targetWord}`;
    }
    soundEngine.speak(prompt, wordItem.language, settings.speechRate);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setStrokeCount(0);
    setHasDrawn(false);
    setEvaluationResult(null);
    setShowPeek(false);
    soundEngine.playGentleBoop();
  };

  // Canvas drawing event handlers
  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || evaluationResult) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#FFFFFF' : selectedColor;
    ctx.lineWidth = isEraser ? 32 : brushWidth;

    setIsDrawing(true);
    setHasDrawn(true);
    setStrokeCount((s) => s + 1);
    soundEngine.playTraceStroke();
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || evaluationResult) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Integrated Handwriting Verification Engine
  const evaluateHandwriting = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawn) {
      soundEngine.playGentleBoop();
      return;
    }

    setIsEvaluating(true);

    // Analyze pixel coverage & bounding density
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let nonWhitePixels = 0;
    let minX = canvas.width;
    let maxX = 0;
    let minY = canvas.height;
    let maxY = 0;

    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3];
      if (alpha > 50) {
        nonWhitePixels++;
        const pixelIdx = i / 4;
        const px = pixelIdx % canvas.width;
        const py = Math.floor(pixelIdx / canvas.width);
        if (px < minX) minX = px;
        if (px > maxX) maxX = px;
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }
    }

    const drawnWidth = Math.max(0, maxX - minX);

    setTimeout(() => {
      setIsEvaluating(false);

      // Kid-friendly validation logic:
      const expectedCharCount = wordItem.word.length;
      let stars = 3;
      let feedback = 'Outstanding Handwriting!';

      if (nonWhitePixels < 800 || drawnWidth < 40) {
        stars = 1;
        feedback = 'Keep practicing! Try writing bigger and clearer across the lines.';
      } else if (strokeCount < Math.max(1, expectedCharCount * 0.8) && wordItem.language !== 'zh') {
        stars = 2;
        feedback = 'Good effort! Remember all the letter strokes.';
      } else {
        stars = 3;
        feedback = 'Superb spelling! You nailed it!';
      }

      setEvaluationResult({
        passed: stars >= 2,
        stars,
        feedback,
      });

      // Update storage and stats
      StorageService.saveWordProgress(wordItem.id, {
        testPassed: stars >= 2,
        stars,
      });
      StorageService.addStats(stars, stars >= 2);

      // Fanfare and confetti
      soundEngine.playStarPop(stars);
      soundEngine.playVictoryFanfare();

      try {
        confetti({
          particleCount: stars === 3 ? 100 : 50,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#3B82F6', '#10B981', '#EC4899', '#8B5CF6'],
        });
      } catch {}
    }, 400);
  };

  const handleNextWordClick = () => {
    if (evaluationResult) {
      onTestComplete(evaluationResult.stars);
    }
  };

  const colors = [
    { name: 'Blue', hex: '#2563EB' },
    { name: 'Green', hex: '#16A34A' },
    { name: 'Orange', hex: '#EA580C' },
    { name: 'Purple', hex: '#9333EA' },
    { name: 'Pink', hex: '#DB2777' },
    { name: 'Black', hex: '#1E293B' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center select-none">
      {/* Top Test Header: Randomized Course Test Progress */}
      <div className="w-full flex items-center justify-between bg-white/95 rounded-3xl p-3 sm:p-4 mb-3 border-2 border-amber-300 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="bg-amber-500 text-white font-black px-3 py-1.5 rounded-2xl text-xs sm:text-sm tracking-wide shadow-xs flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>COURSE TEST (RANDOMIZED)</span>
          </div>

          <div className="text-slate-700 font-bold text-xs sm:text-sm">
            Word: <span className="text-amber-600 font-black text-base">{currentIndex + 1}</span> /{' '}
            <span className="text-slate-800 font-black">{totalWords}</span>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            {settings.letterCase === 'lowercase' ? 'abc (Small)' : 'ABC (Capitals)'}
          </span>
        </div>

        {/* Audio Repeat Button */}
        <button
          onClick={narrateTestPrompt}
          className="flex items-center gap-1.5 bg-sky-100 hover:bg-sky-200 active:bg-sky-300 text-sky-900 font-bold px-3.5 py-2 rounded-2xl border border-sky-300 transition active:scale-95 text-xs sm:text-sm shadow-2xs"
          title="Repeat spoken word"
        >
          <Volume2 className="w-4 h-4 text-sky-700 animate-bounce" />
          <span>Repeat Word</span>
        </button>
      </div>

      {/* Main Handwriting Test Canvas */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[16/8] max-h-[440px] bg-[#FEFDF8] rounded-3xl border-6 border-amber-300 shadow-2xl overflow-hidden flex flex-col justify-center items-center">
        {/* Lined Notebook Guides */}
        <div className="absolute inset-x-0 inset-y-0 pointer-events-none flex flex-col justify-center opacity-80">
          <div className="absolute w-full top-[16%] border-b-2 border-sky-200" />
          <div className="absolute w-full top-[48%] border-b-3 border-dashed border-amber-300" />
          <div className="absolute w-full top-[82%] border-b-4 border-emerald-500" />
          <div className="absolute w-full top-[94%] border-b border-dashed border-rose-200 opacity-60" />
        </div>

        {/* Peek Word Overlay (Hint for young kids if requested) */}
        {showPeek && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-white/40 backdrop-blur-2xs z-20">
            <span className="text-7xl sm:text-9xl font-black text-slate-300/60 font-sans tracking-widest animate-pulse select-none">
              {targetWord}
            </span>
          </div>
        )}

        {/* Drawing Canvas */}
        <canvas
          ref={canvasRef}
          width={960}
          height={480}
          className="relative w-full h-full touch-none cursor-crosshair z-10"
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
        />

        {/* Evaluation Result Banner Overlay */}
        {evaluationResult && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200 z-30">
            {/* Stars Award */}
            <div className="flex items-center gap-2 mb-3">
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-12 h-12 sm:w-16 sm:h-16 transform transition-all duration-300 ${
                    s <= evaluationResult.stars
                      ? 'fill-amber-400 text-amber-500 scale-110 drop-shadow-md animate-bounce'
                      : 'fill-slate-600 text-slate-500 opacity-50'
                  }`}
                  style={{ animationDelay: `${s * 150}ms` }}
                />
              ))}
            </div>

            <h3 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-wide">
              {evaluationResult.stars === 3
                ? '⭐ Superb Writing! ⭐'
                : evaluationResult.stars === 2
                ? 'Well Done!'
                : 'Good Try!'}
            </h3>

            <p className="text-amber-300 text-base sm:text-lg font-bold mb-6 max-w-md">
              {evaluationResult.feedback}
            </p>

            <div className="flex gap-4">
              <button
                onClick={clearCanvas}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-3 rounded-2xl border border-slate-600 transition"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Try Again</span>
              </button>

              <button
                onClick={handleNextWordClick}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black px-7 py-3 rounded-2xl shadow-xl transition active:scale-95 text-lg"
              >
                <span>{currentIndex + 1 < totalWords ? 'Next Test Word' : 'See Course Results! 🏆'}</span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Canvas Controls Toolbar */}
      <div className="w-full flex items-center justify-between mt-3 px-2 flex-wrap gap-2">
        {/* Left: Hint & Clear */}
        <div className="flex items-center gap-2">
          {/* Peek Word Toggle */}
          <button
            onClick={() => {
              setShowPeek(!showPeek);
              soundEngine.playTraceStroke();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-bold transition shadow-2xs ${
              showPeek
                ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-200'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {showPeek ? <EyeOff className="w-4 h-4 text-amber-700" /> : <Eye className="w-4 h-4 text-slate-500" />}
            <span>{showPeek ? 'Hide Word' : 'Peek Word'}</span>
          </button>

          {/* Clear Canvas */}
          <button
            onClick={clearCanvas}
            className="flex items-center gap-1.5 bg-white text-slate-600 hover:text-slate-800 font-bold px-3 py-1.5 rounded-xl border border-slate-300 shadow-2xs text-xs sm:text-sm transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>

        {/* Center: Colors and Eraser */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs">
          {colors.map((c) => (
            <button
              key={c.hex}
              onClick={() => {
                setSelectedColor(c.hex);
                setIsEraser(false);
                soundEngine.playTraceStroke();
              }}
              style={{ backgroundColor: c.hex }}
              className={`w-7 h-7 rounded-xl transition transform active:scale-90 ${
                !isEraser && selectedColor === c.hex
                  ? 'ring-3 ring-sky-400 scale-110 shadow-xs'
                  : 'hover:opacity-80'
              }`}
              title={c.name}
            />
          ))}

          <div className="w-[1px] h-6 bg-slate-200 mx-1" />

          {/* Eraser */}
          <button
            onClick={() => {
              setIsEraser(!isEraser);
              soundEngine.playTraceStroke();
            }}
            className={`p-1.5 rounded-xl border transition ${
              isEraser
                ? 'bg-rose-500 text-white border-rose-600 ring-2 ring-rose-200'
                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
            }`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Check My Work Action Button */}
        <button
          onClick={evaluateHandwriting}
          disabled={!hasDrawn || isEvaluating}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-sm sm:text-base shadow-md transition active:scale-95 ${
            hasDrawn && !isEvaluating
              ? 'bg-amber-400 hover:bg-amber-500 text-slate-950 border-2 border-amber-300 shadow-amber-200 animate-pulse'
              : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed'
          }`}
        >
          <Sparkles className="w-5 h-5 text-amber-800" />
          <span>{isEvaluating ? 'Checking...' : 'Check My Spelling!'}</span>
        </button>
      </div>

      {/* Meaning description hint */}
      <div className="w-full text-center text-xs text-slate-500 font-semibold mt-2">
        Meaning hint: <span className="text-slate-700 italic">"{wordItem.translation}"</span>
      </div>
    </div>
  );
};
