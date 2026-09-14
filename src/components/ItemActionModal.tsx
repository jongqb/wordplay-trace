import React from 'react';
import { Course, WordItem } from '../types';
import { Edit, Trash2, Plus, Play, X, Sparkles, Folder } from 'lucide-react';

interface CourseActionMenuProps {
  type: 'course';
  course: Course;
  onEdit: () => void;
  onDelete: () => void;
  onAddWord: () => void;
  onClose: () => void;
}

interface WordActionMenuProps {
  type: 'word';
  word: WordItem;
  course: Course;
  letterCase?: 'uppercase' | 'lowercase';
  onEdit: () => void;
  onDelete: () => void;
  onTrace: () => void;
  onClose: () => void;
}

export type ItemActionModalProps =
  | (CourseActionMenuProps & { isOpen: boolean })
  | (WordActionMenuProps & { isOpen: boolean });

export const ItemActionModal: React.FC<ItemActionModalProps> = (props) => {
  if (!props.isOpen) return null;

  if (props.type === 'course') {
    const { course, onEdit, onDelete, onAddWord, onClose } = props;
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
        <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl border-4 border-amber-300 flex flex-col gap-4 animate-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-2xl text-white flex items-center justify-center shadow-xs"
                style={{ backgroundColor: course.color || '#0284C7' }}
              >
                <Folder className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                    Course Actions
                  </span>
                  <Sparkles className="w-3 h-3 text-amber-500" />
                </div>
                <h3 className="font-black text-slate-800 text-base leading-tight truncate max-w-[180px]">
                  {course.title}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="text-xs text-slate-500 px-1">
            {course.words.length} words in this curriculum unit. Choose an action:
          </div>

          {/* Action List */}
          <div className="flex flex-col gap-2">
            {/* Edit Course */}
            <button
              onClick={() => {
                onClose();
                onEdit();
              }}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100/80 active:scale-98 text-amber-950 font-black text-sm border-2 border-amber-200 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center">
                <Edit className="w-4 h-4" />
              </div>
              <div className="text-left flex-1">
                <div className="text-slate-900 font-black">Edit Course</div>
                <div className="text-[11px] text-amber-800 font-normal">
                  Rename, change language, or theme color
                </div>
              </div>
            </button>

            {/* Add Word */}
            <button
              onClick={() => {
                onClose();
                onAddWord();
              }}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-sky-50 hover:bg-sky-100/80 active:scale-98 text-sky-950 font-black text-sm border-2 border-sky-200 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <div className="text-left flex-1">
                <div className="text-slate-900 font-black">Add Word</div>
                <div className="text-[11px] text-sky-700 font-normal">
                  Add a new spelling or sight word
                </div>
              </div>
            </button>

            {/* Delete Course */}
            <button
              onClick={() => {
                onClose();
                onDelete();
              }}
              className="flex items-center gap-3 p-3.5 rounded-2xl bg-red-50 hover:bg-red-100/80 active:scale-98 text-red-900 font-black text-sm border-2 border-red-200 transition cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-red-500 text-white flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="text-left flex-1">
                <div className="text-red-700 font-black">Delete Course</div>
                <div className="text-[11px] text-red-600 font-normal">
                  Remove course and all its words
                </div>
              </div>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 font-bold text-xs transition cursor-pointer text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Word Action Menu
  const { word, course, letterCase, onEdit, onDelete, onTrace, onClose } = props;
  const displayWord =
    letterCase === 'lowercase' && word.language !== 'zh'
      ? word.word.toLowerCase()
      : word.word.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl border-4 border-sky-300 flex flex-col gap-4 animate-in zoom-in-95 duration-150">
        {/* Header with Word Display */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
              Word Options
            </span>
            <div className="flex items-baseline gap-2">
              <h3 className="font-black text-slate-900 text-2xl tracking-wide">
                {displayWord}
              </h3>
              {word.phonetic && (
                <span className="text-xs text-sky-500 font-medium">
                  {word.phonetic}
                </span>
              )}
            </div>
            {word.translation && (
              <p className="text-xs text-slate-500 font-medium">
                Meaning: {word.translation}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action List */}
        <div className="flex flex-col gap-2">
          {/* Practice / Trace */}
          <button
            onClick={() => {
              onClose();
              onTrace();
            }}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 active:scale-98 text-emerald-950 font-black text-sm border-2 border-emerald-300 transition cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <Play className="w-4 h-4" />
            </div>
            <div className="text-left flex-1">
              <div className="text-slate-900 font-black">Trace This Word</div>
              <div className="text-[11px] text-emerald-700 font-normal">
                Start guided stroke practice now
              </div>
            </div>
          </button>

          {/* Edit Word */}
          <button
            onClick={() => {
              onClose();
              onEdit();
            }}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-sky-50 hover:bg-sky-100/80 active:scale-98 text-sky-950 font-black text-sm border-2 border-sky-200 transition cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center">
              <Edit className="w-4 h-4" />
            </div>
            <div className="text-left flex-1">
              <div className="text-slate-900 font-black">Edit Word</div>
              <div className="text-[11px] text-sky-700 font-normal">
                Change spelling, meaning, or pinyin
              </div>
            </div>
          </button>

          {/* Delete Word */}
          <button
            onClick={() => {
              onClose();
              onDelete();
            }}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-red-50 hover:bg-red-100/80 active:scale-98 text-red-900 font-black text-sm border-2 border-red-200 transition cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-red-500 text-white flex items-center justify-center">
              <Trash2 className="w-4 h-4" />
            </div>
            <div className="text-left flex-1">
              <div className="text-red-700 font-black">Delete Word</div>
              <div className="text-[11px] text-red-600 font-normal">
                Remove from {course.title}
              </div>
            </div>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl text-slate-500 hover:bg-slate-100 font-bold text-xs transition cursor-pointer text-center"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
