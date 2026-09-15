import React from 'react';
import { Course, WordItem, WordProgress } from '../types';
import { soundEngine } from '../utils/audio';
import {
  Star,
  ArrowRight,
  Trophy,
  Shuffle,
  Shield,
  BookOpen,
} from 'lucide-react';

interface CourseSelectorProps {
  courses: Course[];
  selectedCourse: Course;
  onSelectCourse: (course: Course) => void;
  onSelectWord: (word: WordItem) => void;
  onStartCourseTest: () => void;
  progressMap: Record<string, WordProgress>;
  letterCase?: 'uppercase' | 'lowercase';
  onOpenParentDashboard: () => void;
}

// Subcomponent: Clean Course Pill for kids to tap and switch courses
const CoursePill: React.FC<{
  course: Course;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ course, isSelected, onSelect }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-sm whitespace-nowrap transition-all border-2 cursor-pointer active:scale-95 shrink-0 select-none ${
        isSelected
          ? 'bg-sky-500 text-white border-sky-400 shadow-md scale-102 ring-2 ring-sky-200'
          : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-50 shadow-2xs'
      }`}
    >
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ backgroundColor: course.color || '#0284C7' }}
      />
      <span>{course.title}</span>
      <span
        className={`text-xs px-2 py-0.5 rounded-full ${
          isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
        }`}
      >
        {course.words.length}
      </span>
    </button>
  );
};

// Subcomponent: Clean Word Card for kids to tap and trace
const WordCard: React.FC<{
  item: WordItem;
  idx: number;
  progress?: WordProgress;
  letterCase: 'uppercase' | 'lowercase';
  onSelect: () => void;
}> = ({ item, idx, progress, letterCase, onSelect }) => {
  const isCompleted = progress && progress.testPassed;
  const stars = progress ? progress.stars : 0;

  const displayWord =
    letterCase === 'lowercase' && item.language !== 'zh'
      ? item.word.toLowerCase()
      : item.word.toUpperCase();

  return (
    <div
      onClick={() => {
        soundEngine.playStarPop(idx);
        onSelect();
      }}
      className={`group relative rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-150 shadow-sm border-3 cursor-pointer active:scale-95 select-none ${
        isCompleted
          ? 'bg-gradient-to-b from-amber-50 to-amber-100/60 border-amber-300 hover:border-amber-400'
          : 'bg-white border-sky-200 hover:border-sky-400 hover:shadow-md'
      }`}
    >
      {/* Top Info: Index & Star Badge */}
      <div className="w-full flex justify-between items-center mb-1">
        <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center">
          {idx + 1}
        </span>

        <div className="flex items-center gap-0.5">
          {[1, 2, 3].map((starIdx) => (
            <Star
              key={starIdx}
              className={`w-3.5 h-3.5 ${
                starIdx <= stars
                  ? 'fill-amber-400 text-amber-500'
                  : 'text-slate-200 fill-slate-100'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Word Display */}
      <div className="my-2">
        <div className="text-3xl sm:text-4xl font-black text-slate-800 tracking-wide font-sans group-hover:scale-105 transition-transform">
          {displayWord}
        </div>
        {item.phonetic && (
          <div className="text-xs font-semibold text-amber-600 mt-0.5">
            {item.phonetic}
          </div>
        )}
      </div>

      {/* Translation Meaning */}
      <div className="text-xs text-slate-500 font-medium line-clamp-1">
        {item.translation}
      </div>

      {/* Action Ribbon */}
      <div className="mt-3 w-full py-1.5 rounded-xl bg-sky-50 group-hover:bg-sky-500 group-hover:text-white text-sky-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors">
        <span>{isCompleted ? 'Play Again' : 'Trace Now'}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </div>
  );
};

export const CourseSelector: React.FC<CourseSelectorProps> = ({
  courses,
  selectedCourse,
  onSelectCourse,
  onSelectWord,
  onStartCourseTest,
  progressMap,
  letterCase = 'uppercase',
  onOpenParentDashboard,
}) => {
  const words = selectedCourse.words;
  const totalWords = words.length;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">
      {/* Course Categories Horizontal Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1">
        {courses.map((c) => (
          <CoursePill
            key={c.id}
            course={c}
            isSelected={c.id === selectedCourse.id}
            onSelect={() => {
              soundEngine.playTraceStroke();
              onSelectCourse(c);
            }}
          />
        ))}
      </div>

      {/* Active Course Banner */}
      <div className="w-full bg-white rounded-3xl p-5 border-3 border-sky-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-800">
              {selectedCourse.title}
            </h3>
            {selectedCourse.subtitle && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300">
                {selectedCourse.subtitle}
              </span>
            )}
            <span className="text-xs font-semibold text-slate-500">
              ({totalWords} {totalWords === 1 ? 'word' : 'words'} • {selectedCourse.practiceReps || 2} traces each)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Tap any word card below to practice tracing, then take the test when ready!
          </p>
        </div>

        {/* Start Course Test Button */}
        <button
          onClick={() => {
            if (totalWords === 0) return;
            soundEngine.playVictoryFanfare();
            onStartCourseTest();
          }}
          disabled={totalWords === 0}
          className={`flex items-center justify-center gap-2 font-black px-5 py-2.5 rounded-2xl border-2 transition text-xs sm:text-sm whitespace-nowrap shadow-sm ${
            totalWords > 0
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 border-amber-300 active:scale-95 cursor-pointer'
              : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
          }`}
          title={totalWords === 0 ? 'No words in this course yet' : 'Take the course test'}
        >
          <Shuffle className={`w-4 h-4 ${totalWords > 0 ? 'text-amber-950 animate-spin-slow' : 'text-slate-400'}`} />
          <span>Course Test</span>
          <Trophy className={`w-4 h-4 ${totalWords > 0 ? 'text-amber-900' : 'text-slate-400'}`} />
        </button>
      </div>

      {/* Words Grid or Empty State */}
      {totalWords === 0 ? (
        <div className="bg-white/90 rounded-3xl p-8 border-3 border-dashed border-sky-300 text-center flex flex-col items-center justify-center my-6 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
            <BookOpen className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-black text-slate-800 mb-1">
            No Words in "{selectedCourse.title}" Yet
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-4 font-medium">
            Parents can add custom spelling words and vocabulary lists inside the Parent Zone!
          </p>
          <button
            onClick={onOpenParentDashboard}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black px-6 py-2.5 rounded-2xl shadow-sm transition active:scale-95 text-sm cursor-pointer border-2 border-amber-300"
          >
            <Shield className="w-4 h-4" />
            <span>Open Parent Zone</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {selectedCourse.words.map((item, idx) => (
            <WordCard
              key={item.id}
              item={item}
              idx={idx}
              progress={progressMap[item.id]}
              letterCase={letterCase}
              onSelect={() => onSelectWord(item)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
