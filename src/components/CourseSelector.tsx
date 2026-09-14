import React, { useState } from 'react';
import { Course, WordItem, WordProgress } from '../types';
import { soundEngine } from '../utils/audio';
import { useLongPress } from '../hooks/useLongPress';
import { ItemActionModal } from './ItemActionModal';
import {
  Sparkles,
  Star,
  ArrowRight,
  Trophy,
  Shuffle,
  Plus,
  Trash2,
  FolderPlus,
  Shield,
  Edit,
  Edit3,
  Check,
  MousePointerClick,
} from 'lucide-react';

interface CourseSelectorProps {
  courses: Course[];
  selectedCourse: Course;
  onSelectCourse: (course: Course) => void;
  onSelectWord: (word: WordItem) => void;
  onStartCourseTest: () => void;
  progressMap: Record<string, WordProgress>;
  letterCase?: 'uppercase' | 'lowercase';
  onOpenAddCourse: () => void;
  onOpenAddWord: (course: Course) => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (course: Course) => void;
  onEditWord: (course: Course, word: WordItem) => void;
  onDeleteWord: (courseId: string, wordId: string) => void;
  onOpenParentDashboard: () => void;
}

// Subcomponent: Long-pressable Course Pill
const CoursePill: React.FC<{
  course: Course;
  isSelected: boolean;
  onSelect: () => void;
  onHold: () => void;
}> = ({ course, isSelected, onSelect, onHold }) => {
  const { isPressing, handlers } = useLongPress({
    onClick: onSelect,
    onLongPress: onHold,
    delay: 450,
  });

  return (
    <div className="relative group shrink-0 select-none">
      <button
        type="button"
        {...handlers}
        className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-sm whitespace-nowrap transition-all border-2 cursor-pointer ${
          isPressing
            ? 'scale-92 ring-4 ring-amber-400 bg-amber-100'
            : isSelected
            ? 'bg-sky-500 text-white border-sky-400 shadow-md scale-102 ring-2 ring-sky-200'
            : 'bg-white text-slate-700 border-sky-200 hover:bg-sky-50 shadow-2xs'
        }`}
        title="Tap to select • Click & hold to edit or delete course"
      >
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: course.color || '#0284C7' }}
        />
        <span>{course.title}</span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full ${
            isSelected
              ? 'bg-white/25 text-white'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {course.words.length}
        </span>

        {/* Visual Holding Feedback Indicator */}
        {isPressing && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-md animate-pulse">
            Holding...
          </span>
        )}
      </button>
    </div>
  );
};

// Subcomponent: Long-pressable Word Card
const WordCard: React.FC<{
  item: WordItem;
  idx: number;
  course: Course;
  progress?: WordProgress;
  letterCase: 'uppercase' | 'lowercase';
  isEditMode: boolean;
  onSelect: () => void;
  onHold: () => void;
  onDelete: () => void;
}> = ({
  item,
  idx,
  course,
  progress,
  letterCase,
  isEditMode,
  onSelect,
  onHold,
  onDelete,
}) => {
  const { isPressing, handlers } = useLongPress({
    onClick: () => {
      if (!isEditMode) {
        soundEngine.playStarPop(idx);
        onSelect();
      }
    },
    onLongPress: onHold,
    delay: 450,
  });

  const isCompleted = progress && progress.testPassed;
  const stars = progress ? progress.stars : 0;

  const displayWord =
    letterCase === 'lowercase' && item.language !== 'zh'
      ? item.word.toLowerCase()
      : item.word.toUpperCase();

  return (
    <div
      {...handlers}
      className={`group relative rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-between text-center transition-all duration-150 shadow-sm border-3 select-none ${
        isPressing
          ? 'scale-92 ring-4 ring-amber-400 bg-amber-50 border-amber-400 shadow-lg'
          : isEditMode
          ? 'cursor-default ring-2 ring-amber-300'
          : 'cursor-pointer active:scale-95'
      } ${
        isCompleted
          ? 'bg-gradient-to-b from-amber-50 to-amber-100/60 border-amber-300 hover:border-amber-400'
          : 'bg-white border-sky-200 hover:border-sky-400 hover:shadow-md'
      }`}
      title="Tap to trace • Click & hold to edit or delete"
    >
      {/* Holding Alert Indicator */}
      {isPressing && (
        <div className="absolute inset-0 z-30 bg-amber-500/15 backdrop-blur-[1px] rounded-3xl flex items-center justify-center pointer-events-none">
          <div className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-lg border border-amber-500 animate-bounce">
            Options Menu...
          </div>
        </div>
      )}

      {/* Delete Word Button */}
      {isEditMode ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 right-2 px-2 py-1 rounded-xl bg-red-500 hover:bg-red-600 active:scale-90 text-white shadow-md transition z-20 flex items-center gap-1 text-[11px] font-black cursor-pointer"
          title={`Delete word "${item.word}"`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 right-2 p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 opacity-60 hover:opacity-100 group-hover:opacity-100 transition z-20 cursor-pointer"
          title={`Delete word "${item.word}"`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {/* Top Info: Index & Star Badge */}
      <div className="w-full flex justify-between items-center mb-1">
        <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center">
          {idx + 1}
        </span>

        <div className="flex items-center gap-0.5 pr-4">
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
        {item.translation || 'Click & hold to edit'}
      </div>

      {/* Action Ribbon or Delete Prompt */}
      {isEditMode ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="mt-3 w-full py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Word</span>
        </button>
      ) : (
        <div className="mt-3 w-full py-1.5 rounded-xl bg-sky-50 group-hover:bg-sky-500 group-hover:text-white text-sky-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors">
          <span>{isCompleted ? 'Play Again' : 'Trace Now'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      )}
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
  onOpenAddCourse,
  onOpenAddWord,
  onEditCourse,
  onDeleteCourse,
  onEditWord,
  onDeleteWord,
  onOpenParentDashboard,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [actionItem, setActionItem] = useState<
    | { type: 'course'; course: Course }
    | { type: 'word'; word: WordItem; course: Course }
    | null
  >(null);

  const words = selectedCourse.words;
  const totalWords = words.length;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">
      {/* Click & Hold Gesture Tip Ribbon */}
      <div className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-between shadow-xs border-2 border-amber-300">
        <div className="flex items-center gap-2">
          <MousePointerClick className="w-4 h-4 text-slate-900 shrink-0 animate-bounce" />
          <span>
            <strong>Interactive Gesture:</strong> Click & hold (or tap & hold) on any course or word to <strong>Edit</strong> or <strong>Delete</strong> it!
          </span>
        </div>
        <span className="hidden md:inline-block bg-slate-950/10 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
          Hold for 0.5s
        </span>
      </div>

      {/* Course & Word Management Toolbar Banner */}
      <div className="w-full bg-gradient-to-r from-emerald-50 via-white to-sky-50 rounded-3xl p-3.5 sm:p-4 border-3 border-emerald-300 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-black text-slate-800 block">
              Curriculum & Word Controls
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Click & hold any item, or use these quick buttons
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Course */}
          <button
            onClick={onOpenAddCourse}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black px-4 py-2 rounded-2xl text-xs sm:text-sm shadow-sm transition cursor-pointer border border-emerald-500"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Add Course</span>
          </button>

          {/* Edit Current Course */}
          <button
            onClick={() => onEditCourse(selectedCourse)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black px-3.5 py-2 rounded-2xl text-xs sm:text-sm shadow-2xs transition cursor-pointer border border-amber-400"
            title="Edit selected course details"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Course</span>
          </button>

          {/* Add Word */}
          <button
            onClick={() => onOpenAddWord(selectedCourse)}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-black px-4 py-2 rounded-2xl text-xs sm:text-sm shadow-sm transition cursor-pointer border border-sky-500"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Word</span>
          </button>

          {/* Toggle Delete Words */}
          {totalWords > 0 && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-black border transition cursor-pointer ${
                isEditMode
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm ring-2 ring-amber-300'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
              }`}
            >
              {isEditMode ? <Check className="w-4 h-4" /> : <Trash2 className="w-4 h-4 text-red-500" />}
              <span>{isEditMode ? 'Done Deleting' : 'Delete Words (🗑️)'}</span>
            </button>
          )}

          {/* Delete Selected Course */}
          <button
            onClick={() => onDeleteCourse(selectedCourse)}
            className="flex items-center gap-1.5 text-red-600 hover:text-white hover:bg-red-600 border-2 border-red-300 font-black px-3.5 py-2 rounded-2xl text-xs sm:text-sm transition cursor-pointer shadow-2xs"
            title="Delete this entire course and its words"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Course</span>
          </button>

          {/* Open Parent Zone */}
          <button
            onClick={onOpenParentDashboard}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white font-black px-3.5 py-2 rounded-2xl text-xs sm:text-sm transition cursor-pointer shadow-2xs"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Parent Zone</span>
          </button>
        </div>
      </div>

      {/* Course Categories Pills + Add New Course Button */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 px-1">
        {/* FIRST PILL: + Add New Course */}
        <button
          onClick={onOpenAddCourse}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl font-black text-sm bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-md border-2 border-emerald-500 transition-all whitespace-nowrap shrink-0 cursor-pointer"
          title="Create a new course or custom spelling unit"
        >
          <FolderPlus className="w-4 h-4" />
          <span>+ Add Course</span>
        </button>

        {/* Long-pressable Course Pills */}
        {courses.map((c) => (
          <CoursePill
            key={c.id}
            course={c}
            isSelected={c.id === selectedCourse.id}
            onSelect={() => {
              soundEngine.playTraceStroke();
              onSelectCourse(c);
            }}
            onHold={() => {
              soundEngine.playGentleBoop();
              setActionItem({ type: 'course', course: c });
            }}
          />
        ))}
      </div>

      {/* Active Course Banner */}
      <div className="w-full bg-white rounded-3xl p-5 border-3 border-sky-300 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
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
            Trace words one by one, or click & hold any item to edit or delete!
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Edit Course Button */}
          <button
            onClick={() => onEditCourse(selectedCourse)}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black px-3.5 py-2 rounded-2xl text-xs sm:text-sm shadow-xs transition cursor-pointer"
            title="Edit course title, theme, and settings"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Course</span>
          </button>

          {/* Add Word Button */}
          <button
            onClick={() => onOpenAddWord(selectedCourse)}
            className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-black px-3.5 py-2 rounded-2xl text-xs sm:text-sm shadow-xs transition cursor-pointer"
            title="Add sight word or spelling word to this course"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Word</span>
          </button>

          {/* Toggle Edit/Delete Words Mode */}
          {totalWords > 0 && (
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold border transition cursor-pointer ${
                isEditMode
                  ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs ring-2 ring-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
              }`}
            >
              {isEditMode ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Done Editing</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4 text-slate-600" />
                  <span>Delete Words Mode</span>
                </>
              )}
            </button>
          )}

          {/* Start Course Test Button */}
          <button
            onClick={() => {
              if (totalWords === 0) return;
              soundEngine.playVictoryFanfare();
              onStartCourseTest();
            }}
            disabled={totalWords === 0}
            className={`flex items-center justify-center gap-2 font-black px-4 sm:px-5 py-2 rounded-2xl border-2 transition text-xs sm:text-sm whitespace-nowrap ${
              totalWords > 0
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 border-amber-300 shadow-sm active:scale-95 cursor-pointer'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
            title={totalWords === 0 ? 'Add words before taking test' : 'Start random course test'}
          >
            <Shuffle className={`w-4 h-4 ${totalWords > 0 ? 'text-amber-950 animate-spin-slow' : 'text-slate-400'}`} />
            <span>Course Test</span>
            <Trophy className={`w-4 h-4 ${totalWords > 0 ? 'text-amber-900' : 'text-slate-400'}`} />
          </button>
        </div>
      </div>

      {/* Edit Mode Notice Banner */}
      {isEditMode && (
        <div className="bg-amber-100 border-2 border-amber-300 rounded-2xl p-3 flex items-center justify-between gap-3 text-amber-950 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-800 shrink-0" />
            <span>
              <strong>Word Deletion Mode Active:</strong> Tap the red <strong>trash can (🗑️)</strong> on any card to delete it, or click and hold any card to edit it.
            </span>
          </div>
          <button
            onClick={() => setIsEditMode(false)}
            className="font-black bg-amber-200 hover:bg-amber-300 px-3 py-1 rounded-xl text-xs border border-amber-400 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      )}

      {/* Words Grid or Empty State */}
      {totalWords === 0 ? (
        <div className="bg-white/80 rounded-3xl p-8 border-3 border-dashed border-sky-300 text-center flex flex-col items-center justify-center my-6 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
            <Plus className="w-8 h-8" />
          </div>
          <h4 className="text-xl font-black text-slate-800 mb-1">
            No Words in "{selectedCourse.title}" Yet
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-4 font-medium">
            Add spelling words or sight words so kids can start guided stroke tracing!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => onOpenAddWord(selectedCourse)}
              className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white font-black px-6 py-2.5 rounded-2xl shadow-sm transition active:scale-95 text-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add First Word</span>
            </button>
            <button
              onClick={() => onEditCourse(selectedCourse)}
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-2xl shadow-sm transition active:scale-95 text-sm cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Course</span>
            </button>
            <button
              onClick={() => onDeleteCourse(selectedCourse)}
              className="flex items-center gap-1.5 text-red-600 hover:bg-red-50 border border-red-200 font-bold px-4 py-2.5 rounded-2xl text-sm transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Course</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {selectedCourse.words.map((item, idx) => (
            <WordCard
              key={item.id}
              item={item}
              idx={idx}
              course={selectedCourse}
              progress={progressMap[item.id]}
              letterCase={letterCase}
              isEditMode={isEditMode}
              onSelect={() => onSelectWord(item)}
              onHold={() => {
                soundEngine.playGentleBoop();
                setActionItem({
                  type: 'word',
                  word: item,
                  course: selectedCourse,
                });
              }}
              onDelete={() => onDeleteWord(selectedCourse.id, item.id)}
            />
          ))}

          {/* Quick Add Word Card Tile at end of grid */}
          <button
            onClick={() => onOpenAddWord(selectedCourse)}
            className="rounded-3xl p-5 border-3 border-dashed border-sky-300 bg-white/70 hover:bg-sky-50 text-sky-700 hover:text-sky-900 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 min-h-[170px] cursor-pointer group shadow-2xs hover:shadow-sm"
            title="Add a new word to this course"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-100 group-hover:bg-sky-200 text-sky-700 flex items-center justify-center transition-colors">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-black text-sm text-slate-800 group-hover:text-sky-800">
              + Add Word
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              To {selectedCourse.title}
            </span>
          </button>
        </div>
      )}

      {/* Contextual Click-and-Hold Action Modal */}
      {actionItem && actionItem.type === 'course' && (
        <ItemActionModal
          isOpen={true}
          type="course"
          course={actionItem.course}
          onEdit={() => {
            const crs = actionItem.course;
            setActionItem(null);
            onEditCourse(crs);
          }}
          onDelete={() => {
            const crs = actionItem.course;
            setActionItem(null);
            onDeleteCourse(crs);
          }}
          onAddWord={() => {
            const crs = actionItem.course;
            setActionItem(null);
            onOpenAddWord(crs);
          }}
          onClose={() => setActionItem(null)}
        />
      )}

      {actionItem && actionItem.type === 'word' && (
        <ItemActionModal
          isOpen={true}
          type="word"
          word={actionItem.word}
          course={actionItem.course}
          letterCase={letterCase}
          onEdit={() => {
            const { course, word } = actionItem;
            setActionItem(null);
            onEditWord(course, word);
          }}
          onDelete={() => {
            const { course, word } = actionItem;
            setActionItem(null);
            onDeleteWord(course.id, word.id);
          }}
          onTrace={() => {
            const { word } = actionItem;
            setActionItem(null);
            onSelectWord(word);
          }}
          onClose={() => setActionItem(null)}
        />
      )}
    </div>
  );
};
