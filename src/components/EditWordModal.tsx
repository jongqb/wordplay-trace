import React, { useState, useEffect } from 'react';
import { WordItem, Course } from '../types';
import { soundEngine } from '../utils/audio';
import { Edit3, X, Save } from 'lucide-react';

interface EditWordModalProps {
  isOpen: boolean;
  word: WordItem | null;
  course: Course | null;
  onClose: () => void;
  onUpdateWord: (courseId: string, updatedWord: WordItem) => void;
}

export const EditWordModal: React.FC<EditWordModalProps> = ({
  isOpen,
  word,
  course,
  onClose,
  onUpdateWord,
}) => {
  const [wordText, setWordText] = useState('');
  const [translation, setTranslation] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (word) {
      setWordText(word.word);
      setTranslation(word.translation || '');
      setPhonetic(word.phonetic || '');
      setCategory(word.category || '');
    }
  }, [word]);

  if (!isOpen || !word || !course) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordText.trim()) return;

    const updated: WordItem = {
      ...word,
      word: wordText.trim(),
      translation: translation.trim() || undefined,
      phonetic: phonetic.trim() || undefined,
      category: category.trim() || undefined,
    };

    soundEngine.playStarPop(1);
    onUpdateWord(course.id, updated);
    onClose();
  };

  const isChinese = word.language === 'zh';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border-4 border-sky-300 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg">Edit Word</h3>
              <p className="text-xs text-slate-500">
                Editing in <span className="font-bold text-sky-600">{course.title}</span>
              </p>
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
          {/* Word / Character */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isChinese ? 'Chinese Characters (汉字) *' : 'Word / Spelling *'}
            </label>
            <input
              type="text"
              required
              autoFocus
              value={wordText}
              onChange={(e) => setWordText(e.target.value)}
              placeholder={isChinese ? 'e.g. 太阳 or 猫' : 'e.g. Cat or Apple'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-800 text-base focus:outline-sky-500 focus:bg-white"
            />
          </div>

          {/* Translation / Meaning */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Meaning / Translation
            </label>
            <input
              type="text"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              placeholder="e.g. Sun, Kucing, or Cat"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-sm focus:outline-sky-500 focus:bg-white"
            />
          </div>

          {/* Phonetic / Pinyin */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {isChinese ? 'Pinyin (拼音)' : 'Phonetics / Sound Hint'}
            </label>
            <input
              type="text"
              value={phonetic}
              onChange={(e) => setPhonetic(e.target.value)}
              placeholder={isChinese ? 'e.g. tài yáng' : 'e.g. /kæt/'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-sm focus:outline-sky-500 focus:bg-white"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Category (Optional)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Animals, Nature, Food"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-sm focus:outline-sky-500 focus:bg-white"
            />
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
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Word</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
