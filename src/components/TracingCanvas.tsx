import React, { useRef, useState, useEffect, useMemo } from 'react';
import { WordItem, ParentSettings } from '../types';
import { getStrokesForChar, StrokeDefinition } from '../utils/latinPaths';
import { soundEngine } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Volume2,
  RotateCcw,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  PenTool,
  HelpCircle,
} from 'lucide-react';

interface TracingCanvasProps {
  wordItem: WordItem;
  currentRepetition: number;
  totalRepetitions: number;
  settings: ParentSettings;
  onRepetitionComplete: () => void;
  onAdvanceToNextWord: () => void;
}

export const TracingCanvas: React.FC<TracingCanvasProps> = ({
  wordItem,
  currentRepetition,
  totalRepetitions,
  settings,
  onRepetitionComplete,
  onAdvanceToNextWord,
}) => {
  // Respect parent setting: uppercase or lowercase
  const displayedWord =
    settings.letterCase === 'lowercase'
      ? wordItem.word.toLowerCase()
      : wordItem.word.toUpperCase();

  const letters = useMemo(() => displayedWord.split(''), [displayedWord]);

  // Load strokes for each letter in the full word
  const wordStrokes = useMemo(() => {
    return letters.map((char) => getStrokesForChar(char, settings.letterCase));
  }, [letters, settings.letterCase]);

  // Tracing Progress across the Full Word
  const [activeCharIndex, setActiveCharIndex] = useState(0);
  const [activeStrokeIndex, setActiveStrokeIndex] = useState(0);
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState(0);

  // Completed strokes record: map of charIndex -> set of completed strokeIndexes
  const [completedStrokesByChar, setCompletedStrokesByChar] = useState<Record<number, number[]>>({});

  // Real-time ink drawn by child for the current stroke
  const [currentInkPoints, setCurrentInkPoints] = useState<[number, number][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isWordFinished, setIsWordFinished] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Reset when word or repetition changes
  useEffect(() => {
    setActiveCharIndex(0);
    setActiveStrokeIndex(0);
    setCurrentCheckpointIndex(0);
    setCompletedStrokesByChar({});
    setCurrentInkPoints([]);
    setIsDrawing(false);
    setIsWordFinished(false);
    setShowHint(false);

    if (settings.autoNarrate) {
      soundEngine.speak(displayedWord, wordItem.language, settings.speechRate);
    }
  }, [wordItem.id, currentRepetition, displayedWord, settings.letterCase]);

  // Read current letter phonetics when active letter changes
  useEffect(() => {
    if (activeCharIndex < letters.length && !isWordFinished) {
      const char = letters[activeCharIndex];
      soundEngine.speak(char, wordItem.language, settings.speechRate);
    }
  }, [activeCharIndex]);

  const speakWord = () => {
    soundEngine.speak(displayedWord, wordItem.language, settings.speechRate);
  };

  const activeCharStrokes = wordStrokes[activeCharIndex] || [];
  const currentStroke: StrokeDefinition | undefined = activeCharStrokes[activeStrokeIndex];

  // Convert client pointer event to normalized SVG coordinates (0 to letters.length * 100, 0 to 100)
  const getSvgCoordinates = (e: React.PointerEvent<SVGSVGElement>): [number, number] | null => {
    if (!svgRef.current) return null;
    const rect = svgRef.current.getBoundingClientRect();
    const totalSvgWidth = letters.length * 100;
    const x = ((e.clientX - rect.left) / rect.width) * totalSvgWidth;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return [Math.max(0, Math.min(totalSvgWidth, x)), Math.max(0, Math.min(100, y))];
  };

  // Checkpoint tolerance radius in normalized 100-unit coordinates
  // 14 units is approximately ~14% of the letter's height: accurate without frustrating young kids
  const CHECKPOINT_TOLERANCE = 14;

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isWordFinished || !currentStroke) return;
    const pt = getSvgCoordinates(e);
    if (!pt) return;

    // Must be in proximity of the active letter's start or current checkpoint
    const letterOffset = activeCharIndex * 100;
    const guidePoints = currentStroke.guidePoints;
    const targetCheckpoint = guidePoints[currentCheckpointIndex] || currentStroke.startPoint;
    const targetX = targetCheckpoint[0] + letterOffset;
    const targetY = targetCheckpoint[1];

    const distToTarget = Math.hypot(pt[0] - targetX, pt[1] - targetY);

    // If touching near the checkpoint (or start point if starting fresh)
    if (distToTarget <= CHECKPOINT_TOLERANCE * 1.5 || currentCheckpointIndex > 0) {
      setIsDrawing(true);
      setCurrentInkPoints([pt]);
      soundEngine.playTraceStroke();

      // If near current checkpoint, mark it hit
      if (distToTarget <= CHECKPOINT_TOLERANCE) {
        advanceCheckpoint();
      }
    } else {
      // Gentle reminder: touch the glowing guide dot!
      setShowHint(true);
      soundEngine.playGentleBoop();
      setTimeout(() => setShowHint(false), 1500);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing || isWordFinished || !currentStroke) return;
    const pt = getSvgCoordinates(e);
    if (!pt) return;

    setCurrentInkPoints((prev) => [...prev, pt]);

    const letterOffset = activeCharIndex * 100;
    const guidePoints = currentStroke.guidePoints;
    const targetCheckpoint = guidePoints[currentCheckpointIndex];

    if (targetCheckpoint) {
      const targetX = targetCheckpoint[0] + letterOffset;
      const targetY = targetCheckpoint[1];
      const dist = Math.hypot(pt[0] - targetX, pt[1] - targetY);

      if (dist <= CHECKPOINT_TOLERANCE) {
        advanceCheckpoint();
      }
    }
  };

  const advanceCheckpoint = () => {
    if (!currentStroke) return;
    const guidePoints = currentStroke.guidePoints;
    const nextIdx = currentCheckpointIndex + 1;

    soundEngine.playTraceStroke();

    if (nextIdx >= guidePoints.length) {
      // Completed the entire stroke with sequential precision!
      completeCurrentStroke();
    } else {
      setCurrentCheckpointIndex(nextIdx);
    }
  };

  const completeCurrentStroke = () => {
    if (!currentStroke) return;

    const charIndex = activeCharIndex;
    const strokeIndex = activeStrokeIndex;

    const charCompleted = completedStrokesByChar[charIndex] || [];
    const updatedStrokes = [...charCompleted, strokeIndex];

    setCompletedStrokesByChar((prev) => ({
      ...prev,
      [charIndex]: updatedStrokes,
    }));

    setCurrentInkPoints([]);
    setIsDrawing(false);
    soundEngine.playStarPop(updatedStrokes.length);

    // Check if current letter has finished all its strokes
    if (updatedStrokes.length >= activeCharStrokes.length) {
      // Letter completed!
      soundEngine.playVictoryFanfare();

      // Advance to next letter in the word
      if (charIndex + 1 < letters.length) {
        setActiveCharIndex(charIndex + 1);
        setActiveStrokeIndex(0);
        setCurrentCheckpointIndex(0);
      } else {
        // Entire Full Word Completed!
        handleWordFullyCompleted();
      }
    } else {
      // Move to next stroke in this letter
      setActiveStrokeIndex(strokeIndex + 1);
      setCurrentCheckpointIndex(0);
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (!currentStroke) return;
    const guidePoints = currentStroke.guidePoints;

    // High Precision Guard:
    // Only grant completion if child has sequentially completed at least 80% of guide points
    const progressRatio = currentCheckpointIndex / guidePoints.length;
    if (progressRatio >= 0.8) {
      completeCurrentStroke();
    } else {
      // Did not follow all the way - clear stroke so child learns the true stroke path!
      setCurrentInkPoints([]);
      setCurrentCheckpointIndex(0);
      soundEngine.playGentleBoop();
    }
  };

  const handleWordFullyCompleted = () => {
    setIsWordFinished(true);
    soundEngine.playVictoryFanfare();

    try {
      confetti({
        particleCount: 80,
        spread: 85,
        origin: { y: 0.65 },
        colors: ['#2563EB', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'],
      });
    } catch {}

    // Announce word celebration
    speakWord();
  };

  const handleNextRepetitionOrCourse = () => {
    if (currentRepetition < totalRepetitions) {
      onRepetitionComplete();
    } else {
      onAdvanceToNextWord();
    }
  };

  const handleResetCurrentWord = () => {
    setActiveCharIndex(0);
    setActiveStrokeIndex(0);
    setCurrentCheckpointIndex(0);
    setCompletedStrokesByChar({});
    setCurrentInkPoints([]);
    setIsDrawing(false);
    setIsWordFinished(false);
    soundEngine.playGentleBoop();
  };

  // Color palette for letters in the word
  const LETTER_COLORS = [
    { fill: '#2563EB', outline: '#93C5FD', bg: 'bg-blue-50' },
    { fill: '#059669', outline: '#6EE7B7', bg: 'bg-emerald-50' },
    { fill: '#D97706', outline: '#FCD34D', bg: 'bg-amber-50' },
    { fill: '#7C3AED', outline: '#C4B5FD', bg: 'bg-purple-50' },
    { fill: '#DC2626', outline: '#FCA5A5', bg: 'bg-rose-50' },
    { fill: '#0891B2', outline: '#67E8F9', bg: 'bg-cyan-50' },
  ];

  const totalSvgWidth = letters.length * 100;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center select-none">
      {/* Top Banner: Repetition Step, Case Badge, and Audio */}
      <div className="w-full flex items-center justify-between bg-white/95 rounded-3xl p-3 sm:p-4 mb-3 border-2 border-sky-300 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="bg-sky-500 text-white font-black px-3.5 py-1.5 rounded-2xl text-xs sm:text-sm tracking-wide shadow-xs">
            STEP 1: FULL WORD TRACING
          </div>
          <div className="text-slate-600 font-bold text-xs sm:text-sm">
            Repetition: <span className="text-sky-600 font-black text-base">{currentRepetition}</span> /{' '}
            <span className="text-slate-800 font-black">{totalRepetitions}</span>
          </div>
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            {settings.letterCase === 'lowercase' ? 'abc (Small Letters)' : 'ABC (Capitals)'}
          </span>
        </div>

        {/* Audio Button */}
        <button
          onClick={speakWord}
          className="flex items-center gap-2 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 text-amber-900 font-bold px-4 py-2 rounded-2xl border-2 border-amber-300 transition active:scale-95 text-sm sm:text-base shadow-2xs"
        >
          <Volume2 className="w-5 h-5 text-amber-700 animate-bounce" />
          <span>Say Word: "{displayedWord}"</span>
        </button>
      </div>

      {/* Main Tablet Lined Board (Full Word Ruled Canvas) */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[16/8] max-h-[440px] bg-[#FEFDF8] rounded-3xl border-6 border-sky-300 shadow-2xl overflow-hidden flex flex-col justify-center items-center p-3 sm:p-6">
        {/* Handwriting Ruled Lines (School Notebook Three-Lines) */}
        <div className="absolute inset-x-0 inset-y-0 pointer-events-none flex flex-col justify-center opacity-85">
          {/* Top Line (Sky Blue) */}
          <div className="absolute w-full top-[16%] border-b-3 border-sky-300" />
          {/* Midline / X-Height (Dashed Amber) */}
          <div className="absolute w-full top-[46%] border-b-3 border-dashed border-amber-400" />
          {/* Baseline (Solid Emerald Green) */}
          <div className="absolute w-full top-[84%] border-b-4 border-emerald-500" />
          {/* Descender guideline (Soft Rose) */}
          <div className="absolute w-full top-[96%] border-b border-dashed border-rose-300 opacity-60" />
        </div>

        {/* SVG Full Word Handwriting Surface */}
        <svg
          ref={svgRef}
          viewBox={`0 0 ${totalSvgWidth} 100`}
          className="relative w-full h-full touch-none cursor-crosshair z-10"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Render each letter in the full word horizontally */}
          {letters.map((char, charIdx) => {
            const letterOffset = charIdx * 100;
            const strokes = wordStrokes[charIdx] || [];
            const charCompletedStrokes = completedStrokesByChar[charIdx] || [];
            const isCharComplete = charCompletedStrokes.length >= strokes.length;
            const isActiveChar = charIdx === activeCharIndex && !isWordFinished;
            const letterStyle = LETTER_COLORS[charIdx % LETTER_COLORS.length];

            return (
              <g key={charIdx} id={`letter-slot-${charIdx}`}>
                {/* Active letter highlight column */}
                {isActiveChar && (
                  <rect
                    x={letterOffset + 6}
                    y={10}
                    width={88}
                    height={82}
                    rx={14}
                    fill="#38BDF8"
                    fillOpacity="0.08"
                    stroke="#38BDF8"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Dotted Reference Paths for all strokes of this letter */}
                {strokes.map((stroke, sIdx) => {
                  const isStrokeCompleted = charCompletedStrokes.includes(stroke.strokeIndex);
                  const isCurrentActiveStroke =
                    isActiveChar && sIdx === activeStrokeIndex;

                  return (
                    <g key={sIdx} transform={`translate(${letterOffset}, 0)`}>
                      {/* Background broad track for visual contrast */}
                      <path
                        d={stroke.path}
                        fill="none"
                        stroke="#E2E8F0"
                        strokeWidth="18"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Dotted guideline */}
                      <path
                        d={stroke.path}
                        fill="none"
                        stroke={isStrokeCompleted ? letterStyle.fill : '#94A3B8'}
                        strokeWidth={isStrokeCompleted ? '16' : '12'}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray={isStrokeCompleted ? 'none' : '2 12'}
                      />

                      {/* If stroke completed: vibrant solid filled stroke with highlight */}
                      {isStrokeCompleted && (
                        <>
                          <path
                            d={stroke.path}
                            fill="none"
                            stroke={letterStyle.fill}
                            strokeWidth="14"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d={stroke.path}
                            fill="none"
                            stroke="#FFFFFF"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.5"
                          />
                        </>
                      )}

                      {/* If this is the active stroke, display directional guide and start point */}
                      {isCurrentActiveStroke && (
                        <>
                          {/* Animated pulsing trace guide */}
                          <path
                            d={stroke.path}
                            fill="none"
                            stroke="#0284C7"
                            strokeWidth="13"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeDasharray="4 10"
                            className="animate-pulse"
                            opacity="0.75"
                          />

                          {/* Green Start Circle with Direction Arrow */}
                          <circle
                            cx={stroke.startPoint[0]}
                            cy={stroke.startPoint[1]}
                            r="9"
                            fill="#10B981"
                            stroke="#FFFFFF"
                            strokeWidth="2.5"
                            className="drop-shadow-xs"
                          />
                          <circle
                            cx={stroke.startPoint[0]}
                            cy={stroke.startPoint[1]}
                            r="3.5"
                            fill="#FFFFFF"
                          />

                          {/* Target checkpoint guide dot: where the child must draw to next */}
                          {stroke.guidePoints[currentCheckpointIndex] && (
                            <g
                              transform={`translate(${stroke.guidePoints[currentCheckpointIndex][0]}, ${stroke.guidePoints[currentCheckpointIndex][1]})`}
                            >
                              <circle
                                r="11"
                                fill="#F59E0B"
                                fillOpacity="0.3"
                                className="animate-ping"
                              />
                              <circle
                                r="7"
                                fill="#F59E0B"
                                stroke="#FFFFFF"
                                strokeWidth="2"
                              />
                            </g>
                          )}
                        </>
                      )}
                    </g>
                  );
                })}

                {/* Finished Letter Checkmark Badge */}
                {isCharComplete && (
                  <g transform={`translate(${letterOffset + 70}, 20)`}>
                    <circle cx="0" cy="0" r="10" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                    <path
                      d="M -4 0 L -1 3 L 4 -3"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </g>
                )}
              </g>
            );
          })}

          {/* Child's real-time live ink stroke */}
          {currentInkPoints.length > 1 && (
            <polyline
              points={currentInkPoints.map(([x, y]) => `${x},${y}`).join(' ')}
              fill="none"
              stroke="#2563EB"
              strokeWidth="15"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
          )}
        </svg>

        {/* Tip prompt if child touches outside guide point */}
        {showHint && currentStroke && (
          <div className="absolute top-4 bg-amber-500 text-white font-bold px-4 py-1.5 rounded-2xl text-xs sm:text-sm shadow-md animate-bounce z-20">
            Start at the green dot and follow the arrow! 🎯
          </div>
        )}

        {/* Full Word Finished Overlay */}
        {isWordFinished && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300 z-30">
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-2 shadow-lg animate-bounce">
              <Sparkles className="w-9 h-9" />
            </div>

            <h3 className="text-3xl sm:text-4xl font-black text-white mb-1 tracking-wide">
              {currentRepetition < totalRepetitions
                ? `Awesome! Repetition ${currentRepetition} Done!`
                : 'Word Mastered! Fantastic Tracing!'}
            </h3>

            <p className="text-amber-300 font-bold text-base sm:text-lg mb-6">
              Word: <strong className="text-white text-2xl ml-1 tracking-wider">{displayedWord}</strong>
              <span className="text-slate-300 ml-2">({wordItem.translation})</span>
            </p>

            <div className="flex gap-4">
              <button
                onClick={handleResetCurrentWord}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-3 rounded-2xl border border-slate-600 transition"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Trace Again</span>
              </button>

              <button
                onClick={handleNextRepetitionOrCourse}
                className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-7 py-3 rounded-2xl shadow-xl border-2 border-amber-300 transition active:scale-95 text-lg"
              >
                <span>
                  {currentRepetition < totalRepetitions
                    ? `Next Round (${currentRepetition + 1}/${totalRepetitions})`
                    : 'Next Word 🌟'}
                </span>
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Information & Action Bar */}
      <div className="w-full flex items-center justify-between mt-3 px-2">
        <div className="text-slate-600 font-semibold text-xs sm:text-sm">
          Meaning: <strong className="text-sky-700">{wordItem.translation}</strong>
          {wordItem.phonetic && (
            <span className="ml-2 text-slate-500 font-mono">({wordItem.phonetic})</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetCurrentWord}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-800 font-bold bg-white px-3.5 py-1.5 rounded-xl border border-slate-300 shadow-2xs text-xs sm:text-sm transition active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear Word</span>
          </button>

          <button
            onClick={handleNextRepetitionOrCourse}
            className="flex items-center gap-1.5 text-sky-800 hover:text-sky-950 font-bold bg-sky-100 hover:bg-sky-200 px-4 py-1.5 rounded-xl border border-sky-300 shadow-2xs text-xs sm:text-sm transition active:scale-95"
          >
            <span>Skip / Done</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
