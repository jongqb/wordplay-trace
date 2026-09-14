import React, { useState, useEffect } from 'react';
import { Course, Language } from '../types';
import { soundEngine } from '../utils/audio';
import { Edit, X, Check, Save } from 'lucide-react';

interface EditCourseModalProps {
  isOpen: boolean;
  course: Course | null;
  onClose: () => void;
  onUpdateCourse: (updatedCourse: Course) => void;
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

export const EditCourseModal: React.FC<EditCourseModalProps> = ({
  isOpen,
  course,
  onClose,
  onUpdateCourse,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [color, setColor] = useState('#0284C7');
  const [reps, setReps] = useState(2);

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setSubtitle(course.subtitle || '');
      setLanguage(course.language);
      setColor(course.color || '#0284C7');
      setReps(course.practiceReps || 2);
    }
  }, [course]);

  if (!isOpen || !course) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const updated: Course = {
      ...course,
      title: title.trim(),
      subtitle: subtitle.trim(),
      language,
      color,
      practiceReps: reps,
    };

    soundEngine.playStarPop(2);
    onUpdateCourse(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border-4 border-amber-300 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Edit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg">Edit Course</h3>
              <p className="text-xs text-slate-500">Update course details and settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
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
              placeholder="e.g. Sight Words Week 1"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-800 text-sm focus:outline-amber-500 focus:bg-white"
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
              placeholder="e.g. Everyday vocabulary"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-sm focus:outline-amber-500 focus:bg-white"
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
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
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
                  className={`w-8 h-8 rounded-full transition-transform flex items-center justify-center cursor-pointer ${
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
              Tracing Repetitions: <span className="text-amber-600 font-black">{reps}x</span>
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReps(r)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
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

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
