import React, { useState } from 'react';
import { Course, Language, WordItem } from '../types';
import { soundEngine } from '../utils/audio';
import { FolderPlus, X, Check } from 'lucide-react';

interface AddCourseModalProps {
  isOpen: boolean;
  initialLanguage: Language;
  defaultReps?: number;
  onClose: () => void;
  onCreateCourse: (newCourse: Course) => void;
}

const PRESET_COLORS = [
  { name: 'Sky Blue', hex: '#0284C7' },
  { name: 'Amber Gold', hex: '#D97706' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Purple Violet', hex: '#7C3AED' },
  { name: 'Rose Pink', hex: '#E11D48' },
  { name: 'Warm Orange', hex: '#EA580C' },
  { name: 'Teal Blue', hex: '#0D9488' },
];

export const AddCourseModal: React.FC<AddCourseModalProps> = ({
  isOpen,
  initialLanguage,
  defaultReps = 2,
  onClose,
  onCreateCourse,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [color, setColor] = useState('#0284C7');
  const [reps, setReps] = useState(defaultReps);
  const [firstWord, setFirstWord] = useState('');
  const [firstTranslation, setFirstTranslation] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const courseId = `course-${Date.now()}`;
    const initialWords: WordItem[] = [];

    if (firstWord.trim()) {
      initialWords.push({
        id: `word-${Date.now()}`,
        word: language === 'zh' ? firstWord.trim() : firstWord.trim().toUpperCase(),
        translation: firstTranslation.trim() || 'First Word',
        category: title.trim(),
        language: language,
        isCustom: true,
      });
    }

    const createdCourse: Course = {
      id: courseId,
      title: title.trim(),
      subtitle: subtitle.trim() || `${title.trim()} practice`,
      language: language,
      words: initialWords,
      practiceReps: reps,
      color: color,
      iconName: 'BookOpen',
    };

    soundEngine.playStarPop(2);
    onCreateCourse(createdCourse);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border-4 border-emerald-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg">Add New Course</h3>
              <p className="text-xs text-slate-500">Create a customized topic or spelling list</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Course Title *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. School Supplies, Sight Words Week 1, 水果蔬菜"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-800 text-sm focus:outline-emerald-500 focus:bg-white"
            />
          </div>

          {/* Subtitle / Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Topic Description / Subtitle
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Everyday words for class practice"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-sm focus:outline-emerald-500 focus:bg-white"
            />
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Target Language
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'en', label: 'English 🇬🇧' },
                { code: 'bm', label: 'Bahasa Malaysia 🇲🇾' },
                { code: 'zh', label: 'Chinese 中文 🇨🇳' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code as Language)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                    language === lang.code
                      ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Accent */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Theme Accent Color
            </label>
            <div className="flex items-center gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={`w-8 h-8 rounded-full transition-transform flex items-center justify-center ${
                    color === c.hex
                      ? 'scale-115 ring-2 ring-slate-800 ring-offset-2'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {color === c.hex && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Repetitions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tracing Repetitions per Word: <span className="text-amber-600 font-black">{reps}x</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReps(r)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                    reps === r
                      ? 'bg-amber-400 border-amber-500 text-slate-900 shadow-2xs font-black'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {r}x
                </button>
              ))}
            </div>
          </div>

          {/* Optional First Word */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-2">
            <span className="text-xs font-bold text-slate-700">Optional First Word</span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={firstWord}
                onChange={(e) => setFirstWord(e.target.value)}
                placeholder="Word (e.g. BOOK or 书)"
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 font-bold text-xs text-slate-800"
              />
              <input
                type="text"
                value={firstTranslation}
                onChange={(e) => setFirstTranslation(e.target.value)}
                placeholder="Meaning (e.g. For reading)"
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create Course</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
