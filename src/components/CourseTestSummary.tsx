import React, { useEffect } from 'react';
import { Course, ParentSettings } from '../types';
import { soundEngine } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Trophy, Star, RotateCcw, ArrowRight, Award, CheckCircle2 } from 'lucide-react';

export interface TestResultItem {
  wordId: string;
  word: string;
  translation: string;
  stars: number;
  passed: boolean;
}

interface CourseTestSummaryProps {
  course: Course;
  results: TestResultItem[];
  settings: ParentSettings;
  onRetakeTest: () => void;
  onBackToCourse: () => void;
}

export const CourseTestSummary: React.FC<CourseTestSummaryProps> = ({
  course,
  results,
  settings,
  onRetakeTest,
  onBackToCourse,
}) => {
  const totalStars = results.reduce((sum, r) => sum + r.stars, 0);
  const maxPossibleStars = results.length * 3;
  const passedCount = results.filter((r) => r.passed).length;
  const isMastery = passedCount === results.length;

  useEffect(() => {
    soundEngine.playVictoryFanfare();
    try {
      confetti({
        particleCount: 120,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
      });
    } catch {}
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-3xl border-4 border-amber-300 shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
      {/* Trophy Badge */}
      <div className="relative mb-4">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-900 flex items-center justify-center shadow-xl transform rotate-3">
          <Trophy className="w-14 h-14 sm:w-16 sm:h-16 text-amber-950 animate-bounce" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-xs font-black px-2.5 py-1 rounded-full border-2 border-white shadow-xs">
          PASSED!
        </div>
      </div>

      <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-1 tracking-tight">
        {isMastery ? 'Mastery Certificate!' : 'Course Test Complete!'}
      </h2>

      <p className="text-sm sm:text-base text-slate-600 font-semibold mb-6">
        {settings.childName || 'Little Star'} successfully completed the final test for{' '}
        <strong className="text-amber-600 font-black">{course.title}</strong>!
      </p>

      {/* Score and Stars Banner */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex flex-col items-center">
          <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            Total Stars
          </div>
          <div className="flex items-center gap-1.5 text-2xl sm:text-3xl font-black text-amber-600">
            <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
            <span>
              {totalStars} / {maxPossibleStars}
            </span>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex flex-col items-center">
          <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            Words Passed
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">
            {passedCount} / {results.length}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-sky-50 rounded-2xl p-4 border border-sky-200 flex flex-col items-center">
          <div className="text-xs font-bold text-sky-700 uppercase tracking-wider mb-1">
            Letter Style
          </div>
          <div className="text-sm sm:text-base font-black text-sky-800 mt-1">
            {settings.letterCase === 'lowercase' ? 'abc (Small Letters)' : 'ABC (Capitals)'}
          </div>
        </div>
      </div>

      {/* Breakdown of Words Tested */}
      <div className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6 text-left">
        <div className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
          Randomized Word Test Breakdown:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-52 overflow-y-auto pr-1">
          {results.map((res, idx) => {
            const displayWord =
              settings.letterCase === 'lowercase'
                ? res.word.toLowerCase()
                : res.word.toUpperCase();

            return (
              <div
                key={res.wordId + idx}
                className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 shadow-2xs"
              >
                <div>
                  <div className="font-black text-slate-800 text-base">{displayWord}</div>
                  <div className="text-xs text-slate-500">{res.translation}</div>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= res.stars
                          ? 'fill-amber-400 text-amber-500'
                          : 'fill-slate-100 text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-wrap justify-center gap-3 w-full">
        <button
          onClick={onRetakeTest}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-3 rounded-2xl border border-slate-300 transition active:scale-95 text-sm sm:text-base"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Retake Random Test</span>
        </button>

        <button
          onClick={onBackToCourse}
          className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-7 py-3 rounded-2xl border-2 border-amber-300 shadow-lg transition active:scale-95 text-base sm:text-lg"
        >
          <span>Back to Course Words</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
