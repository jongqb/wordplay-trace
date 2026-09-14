import React, { useState } from 'react';
import { Course, WordItem } from '../types';
import { soundEngine } from '../utils/audio';
import { Plus, X, Sparkles } from 'lucide-react';

interface AddWordModalProps {
  isOpen: boolean;
  course: Course | null;
  onClose: () => void;
  onAddWord: (word: WordItem, addAnother?: boolean) => void;
}

export const AddWordModal: React.FC<AddWordModalProps> = ({
  isOpen,
  course,
  onClose,
  onAddWord,
}) => {
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [category, setCategory] = useState('');

  if (!isOpen || !course) return null;

  const handleSubmit = (e: React.FormEvent, addAnother: boolean = false) => {
    e.preventDefault();
    if (!word.trim()) return;

    const formattedWord =
      course.language === 'zh' ? word.trim() : word.trim().toUpperCase();

    const newWordItem: WordItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      word: formattedWord,
      translation: translation.trim() || 'Custom Word',
      phonetic: phonetic.trim() || undefined,
      category: category.trim() || course.title,
      language: course.language,
      isCustom: true,
    };

    soundEngine.playStarPop(1);
    onAddWord(newWordItem, addAnother);

    // Reset inputs
    setWord('');
    setTranslation('');
    setPhonetic('');

    if (!addAnother) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border-4 border-sky-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg">
                Add Word to "{course.title}"
              </h3>
              <p className="text-xs text-slate-500">
                Add spelling homework, sight words, or vocabulary
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="flex flex-col gap-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Word / Character *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder={
                course.language === 'zh'
                  ? 'e.g. 猫 or 太阳'
                  : course.language === 'bm'
                  ? 'e.g. KUCING or buku'
                  : 'e.g. TIGER or school'
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 font-black text-slate-900 text-base focus:outline-sky-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Meaning / Translation
            </label>
            <input
              type="text"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              placeholder="e.g. Big cat with stripes"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-sm focus:outline-sky-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {course.language === 'zh' ? 'Pinyin (e.g. māo)' : 'Phonetics (Optional)'}
              </label>
              <input
                type="text"
                value={phonetic}
                onChange={(e) => setPhonetic(e.target.value)}
                placeholder={course.language === 'zh' ? 'e.g. māo' : 'e.g. /ˈtaɪ.ɡər/'}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-sm focus:outline-sky-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={course.title}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-sm focus:outline-sky-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="px-4 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-xs border border-sky-300 transition"
            >
              Save & Add Another
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Save Word</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
