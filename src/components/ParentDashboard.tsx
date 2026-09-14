import React, { useState } from 'react';
import { Course, Language, ParentSettings, WordItem, LearningStats } from '../types';
import { StorageService } from '../utils/storage';
import { soundEngine } from '../utils/audio';
import {
  Shield,
  BookOpen,
  Plus,
  Trash2,
  Settings,
  BarChart2,
  Volume2,
  RotateCcw,
  ArrowLeft,
  Check,
  Star,
  Award,
  AlertTriangle,
  Sparkles,
  X,
  FolderPlus,
} from 'lucide-react';

interface ParentDashboardProps {
  courses: Course[];
  settings: ParentSettings;
  stats: LearningStats;
  onUpdateCourses: (courses: Course[]) => void;
  onUpdateSettings: (settings: ParentSettings) => void;
  onExitParentMode: () => void;
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

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  courses,
  settings,
  stats,
  onUpdateCourses,
  onUpdateSettings,
  onExitParentMode,
}) => {
  const [activeTab, setActiveTab] = useState<'courses' | 'settings' | 'stats'>('courses');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses.find((c) => c.language === 'en')?.id || courses[0]?.id || ''
  );

  // New Course Form State
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseSubtitle, setNewCourseSubtitle] = useState('');
  const [newCourseLanguage, setNewCourseLanguage] = useState<Language>('en');
  const [newCourseColor, setNewCourseColor] = useState('#0284C7');
  const [newCourseReps, setNewCourseReps] = useState(2);
  const [newCourseFirstWord, setNewCourseFirstWord] = useState('');
  const [newCourseFirstTranslation, setNewCourseFirstTranslation] = useState('');

  // Course Deletion Confirmation State
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  // Word Deletion / Clear State
  const [isConfirmingClearWords, setIsConfirmingClearWords] = useState(false);

  // New Word Form State
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newPhonetic, setNewPhonetic] = useState('');
  const [newCategory, setNewCategory] = useState('');

  // Repetition Settings State
  const [localSettings, setLocalSettings] = useState<ParentSettings>(settings);
  const [saveToast, setSaveToast] = useState(false);

  const filteredCourses = courses.filter((c) => c.language === selectedLanguage);
  const currentCourse =
    courses.find((c) => c.id === selectedCourseId && c.language === selectedLanguage) ||
    filteredCourses[0] ||
    courses.find((c) => c.id === selectedCourseId) ||
    null;

  const handleLanguageTab = (lang: Language) => {
    setSelectedLanguage(lang);
    const firstMatch = courses.find((c) => c.language === lang);
    if (firstMatch) {
      setSelectedCourseId(firstMatch.id);
    } else {
      setSelectedCourseId('');
    }
  };

  // Open Add Course modal with defaults
  const handleOpenAddCourse = () => {
    setNewCourseTitle('');
    setNewCourseSubtitle('');
    setNewCourseLanguage(selectedLanguage);
    setNewCourseColor('#0284C7');
    setNewCourseReps(localSettings.repetitionsPerWord || 2);
    setNewCourseFirstWord('');
    setNewCourseFirstTranslation('');
    setIsAddingCourse(true);
  };

  // Create Course Handler
  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    const courseId = `course-${Date.now()}`;
    const initialWords: WordItem[] = [];

    if (newCourseFirstWord.trim()) {
      initialWords.push({
        id: `word-${Date.now()}`,
        word:
          newCourseLanguage === 'zh'
            ? newCourseFirstWord.trim()
            : newCourseFirstWord.trim().toUpperCase(),
        translation: newCourseFirstTranslation.trim() || 'First Word',
        category: newCourseTitle.trim(),
        language: newCourseLanguage,
        isCustom: true,
      });
    }

    const createdCourse: Course = {
      id: courseId,
      title: newCourseTitle.trim(),
      subtitle: newCourseSubtitle.trim() || `${newCourseTitle.trim()} practice`,
      language: newCourseLanguage,
      words: initialWords,
      practiceReps: newCourseReps,
      color: newCourseColor,
      iconName: 'BookOpen',
    };

    const updatedCourses = [...courses, createdCourse];
    onUpdateCourses(updatedCourses);
    StorageService.saveCourses(updatedCourses);

    // Switch view to created course
    setSelectedLanguage(newCourseLanguage);
    setSelectedCourseId(courseId);
    setIsAddingCourse(false);
    soundEngine.playStarPop(2);
  };

  // Delete Course Handlers
  const confirmDeleteCourse = (course: Course) => {
    setCourseToDelete(course);
  };

  const handleDeleteCourseConfirmed = () => {
    if (!courseToDelete) return;

    const updatedCourses = courses.filter((c) => c.id !== courseToDelete.id);
    onUpdateCourses(updatedCourses);
    StorageService.saveCourses(updatedCourses);

    // If deleted course was active, select another
    if (selectedCourseId === courseToDelete.id) {
      const remainingInLang = updatedCourses.filter((c) => c.language === selectedLanguage);
      if (remainingInLang.length > 0) {
        setSelectedCourseId(remainingInLang[0].id);
      } else if (updatedCourses.length > 0) {
        setSelectedLanguage(updatedCourses[0].language);
        setSelectedCourseId(updatedCourses[0].id);
      } else {
        setSelectedCourseId('');
      }
    }

    setCourseToDelete(null);
    soundEngine.playGentleBoop();
  };

  // Add Word Handler with optional "Add Another"
  const handleAddWord = (e: React.FormEvent, addAnother: boolean = false) => {
    e.preventDefault();
    if (!newWord.trim() || !currentCourse) return;

    const wordItem: WordItem = {
      id: `custom-${Date.now()}`,
      word:
        currentCourse.language === 'zh'
          ? newWord.trim()
          : newWord.trim().toUpperCase(),
      translation: newTranslation.trim() || 'Custom Word',
      phonetic: newPhonetic.trim() || undefined,
      category: newCategory.trim() || currentCourse.title,
      language: currentCourse.language,
      isCustom: true,
    };

    const updatedCourses = courses.map((course) => {
      if (course.id === currentCourse.id) {
        return {
          ...course,
          words: [...course.words, wordItem],
        };
      }
      return course;
    });

    onUpdateCourses(updatedCourses);
    StorageService.saveCourses(updatedCourses);

    // Reset Form inputs
    setNewWord('');
    setNewTranslation('');
    setNewPhonetic('');
    soundEngine.playStarPop(1);

    if (!addAnother) {
      setIsAddingWord(false);
    }
  };

  // Delete Word in Current Course (supports any word)
  const handleDeleteWord = (wordId: string) => {
    if (!currentCourse) return;
    const updatedCourses = courses.map((course) => {
      if (course.id === currentCourse.id) {
        return {
          ...course,
          words: course.words.filter((w) => w.id !== wordId),
        };
      }
      return course;
    });

    onUpdateCourses(updatedCourses);
    StorageService.saveCourses(updatedCourses);
    soundEngine.playGentleBoop();
  };

  // Clear all words in current course
  const handleClearAllWords = () => {
    if (!currentCourse) return;
    const updatedCourses = courses.map((course) => {
      if (course.id === currentCourse.id) {
        return {
          ...course,
          words: [],
        };
      }
      return course;
    });

    onUpdateCourses(updatedCourses);
    StorageService.saveCourses(updatedCourses);
    setIsConfirmingClearWords(false);
    soundEngine.playGentleBoop();
  };

  // Restore Default Courses
  const handleRestoreDefaultCourses = () => {
    if (
      window.confirm(
        'Restore the original starter courses for English, Bahasa Malaysia, and Chinese? Your curriculum will be reset to default.'
      )
    ) {
      const defaults = StorageService.resetDefaultCourses();
      onUpdateCourses(defaults);
      setSelectedLanguage('en');
      setSelectedCourseId(defaults[0]?.id || '');
      soundEngine.playVictoryFanfare();
    }
  };

  const handleSaveSettings = () => {
    onUpdateSettings(localSettings);
    StorageService.saveSettings(localSettings);
    soundEngine.setMuted(!localSettings.soundEffects);
    setSaveToast(true);
    soundEngine.playStarPop(2);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all learning progress and stars?')) {
      StorageService.resetProgress();
      window.location.reload();
    }
  };

  return (
    <div className="w-full min-h-[90vh] bg-slate-50 rounded-3xl border-4 border-slate-200 shadow-xl p-4 sm:p-6 select-none max-w-5xl mx-auto flex flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">Parent Setup Dashboard</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage courses, custom word lists, and kid tracing rules
            </p>
          </div>
        </div>

        {/* Back to Kid Mode */}
        <button
          onClick={onExitParentMode}
          className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-2xl shadow-sm transition active:scale-95 text-sm sm:text-base border-2 border-amber-300"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Kid Mode</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition ${
            activeTab === 'courses'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Curriculum & Words</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition ${
            activeTab === 'settings'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Tracing & Voice Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition ${
            activeTab === 'stats'
              ? 'bg-sky-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Progress Report</span>
        </button>
      </div>

      {/* Tab 1: Curriculum & Word Lists */}
      {activeTab === 'courses' && (
        <div className="flex-1 flex flex-col gap-4">
          {/* Language Selector and Top Course Action */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {[
                { code: 'en', label: 'English 🇬🇧' },
                { code: 'bm', label: 'Bahasa Malaysia 🇲🇾' },
                { code: 'zh', label: 'Chinese 中文 🇨🇳' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageTab(lang.code as Language)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition ${
                    selectedLanguage === lang.code
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {/* Quick Add Course Button */}
            <button
              onClick={handleOpenAddCourse}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs transition text-xs sm:text-sm active:scale-95"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ Add New Course</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            {/* Course List Column */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col justify-between gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-700 text-sm">Available Courses</h4>
                    <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {filteredCourses.length}
                    </span>
                  </div>

                  <button
                    onClick={handleOpenAddCourse}
                    className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                    title="Add Course"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {filteredCourses.length === 0 ? (
                  <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 flex flex-col items-center">
                    <BookOpen className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-xs font-bold text-slate-600">No courses in this language yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click "+ Add New Course" to begin</p>
                    <button
                      onClick={handleOpenAddCourse}
                      className="mt-3 text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
                    >
                      Create Course Now
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
                    {filteredCourses.map((course) => {
                      const isSelected = selectedCourseId === course.id;
                      return (
                        <div
                          key={course.id}
                          onClick={() => setSelectedCourseId(course.id)}
                          className={`group relative p-3 rounded-xl text-left transition border cursor-pointer flex items-center justify-between gap-2 ${
                            isSelected
                              ? 'bg-sky-50 border-sky-400 ring-2 ring-sky-200 shadow-xs'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: course.color || '#0284C7' }}
                              />
                              <div className="font-bold text-slate-800 text-sm truncate">{course.title}</div>
                            </div>
                            <div className="text-xs text-slate-500 truncate mt-0.5 pl-4.5">{course.subtitle}</div>
                            <div className="text-[11px] text-sky-600 font-semibold mt-1 pl-4.5">
                              {course.words.length} Words • {course.practiceReps} Traces
                            </div>
                          </div>

                          {/* Delete Course Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDeleteCourse(course);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition shrink-0"
                            title={`Delete course "${course.title}"`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Restore Defaults Footer Option */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleRestoreDefaultCourses}
                  className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-600 py-1 flex items-center justify-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Starter Curriculum</span>
                </button>
              </div>
            </div>

            {/* Word List for Selected Course */}
            <div className="md:col-span-2 bg-white p-4 rounded-2xl border border-slate-200 flex flex-col">
              {currentCourse ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: currentCourse.color || '#0284C7' }}
                        />
                        <h4 className="font-black text-slate-800 text-lg">
                          {currentCourse.title}
                        </h4>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {currentCourse.words.length} words
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {currentCourse.subtitle} • {currentCourse.practiceReps} traces per word
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setIsAddingWord(true)}
                        className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs sm:text-sm shadow-xs transition active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Word</span>
                      </button>

                      {currentCourse.words.length > 0 && (
                        <button
                          onClick={() => setIsConfirmingClearWords(true)}
                          className="flex items-center gap-1 text-slate-500 hover:text-slate-700 px-2.5 py-1.5 rounded-xl text-xs border border-slate-200 hover:bg-slate-50 transition"
                          title="Clear all words in this course"
                        >
                          <span>Clear All</span>
                        </button>
                      )}

                      <button
                        onClick={() => confirmDeleteCourse(currentCourse)}
                        className="flex items-center gap-1 text-red-500 hover:text-red-700 px-2.5 py-1.5 rounded-xl text-xs border border-red-200 hover:bg-red-50 transition"
                        title="Delete this entire course"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Course</span>
                      </button>
                    </div>
                  </div>

                  {/* Add Word Form */}
                  {isAddingWord && (
                    <form
                      onSubmit={(e) => handleAddWord(e, false)}
                      className="bg-sky-50 p-4 rounded-2xl border-2 border-sky-300 mb-4 flex flex-col gap-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-sky-900 text-sm">
                          Add New Word to "{currentCourse.title}"
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAddingWord(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-bold text-slate-600">Word / Character *</label>
                          <input
                            type="text"
                            required
                            value={newWord}
                            onChange={(e) => setNewWord(e.target.value)}
                            placeholder={
                              currentCourse.language === 'zh'
                                ? 'e.g. 猫 or 太阳'
                                : currentCourse.language === 'bm'
                                ? 'e.g. KUCING or buku'
                                : 'e.g. TIGER or school'
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-800 text-sm focus:outline-sky-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Meaning / Translation</label>
                          <input
                            type="text"
                            value={newTranslation}
                            onChange={(e) => setNewTranslation(e.target.value)}
                            placeholder="e.g. Striped big cat"
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm focus:outline-sky-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">
                            Phonetics / Pinyin (Optional)
                          </label>
                          <input
                            type="text"
                            value={newPhonetic}
                            onChange={(e) => setNewPhonetic(e.target.value)}
                            placeholder={
                              currentCourse.language === 'zh' ? 'e.g. māo' : 'e.g. /ˈtaɪ.ɡər/'
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm focus:outline-sky-500"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-600">Category</label>
                          <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder={`e.g. ${currentCourse.title}`}
                            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-sm focus:outline-sky-500"
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-2 mt-1 pt-2 border-t border-sky-200">
                        <button
                          type="button"
                          onClick={() => setIsAddingWord(false)}
                          className="px-4 py-1.5 rounded-xl text-slate-600 hover:bg-slate-200 text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleAddWord(e, true)}
                          className="px-4 py-1.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-bold text-xs border border-sky-300 transition"
                        >
                          Save & Add Another
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs"
                        >
                          Save Word
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Word List Table */}
                  <div className="flex-1 overflow-y-auto max-h-[380px] space-y-2 pr-1">
                    {currentCourse.words.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
                        <BookOpen className="w-10 h-10 text-slate-300 mb-2" />
                        <h5 className="font-bold text-slate-700 text-sm">This course has no words yet</h5>
                        <p className="text-xs text-slate-500 max-w-sm mt-1">
                          Click "+ Add Word" above to add spelling homework, sight words, or vocabulary.
                        </p>
                        <button
                          onClick={() => setIsAddingWord(true)}
                          className="mt-3 flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700 underline"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add First Word</span>
                        </button>
                      </div>
                    ) : (
                      currentCourse.words.map((item, index) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/80 transition"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                              {index + 1}
                            </span>
                            <div>
                              <div className="font-black text-slate-800 text-base">{item.word}</div>
                              <div className="text-xs text-slate-500">
                                {item.translation} {item.phonetic && `• (${item.phonetic})`}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => soundEngine.speak(item.word, item.language, settings.speechRate)}
                              className="p-2 text-slate-500 hover:text-sky-600 rounded-lg hover:bg-white"
                              title="Listen to pronunciation"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>

                            {/* Delete Word Button - Available for all words */}
                            <button
                              onClick={() => handleDeleteWord(item.id)}
                              className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                              title="Delete word"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <BookOpen className="w-12 h-12 text-slate-300 mb-3" />
                  <h4 className="text-base font-bold text-slate-700">No Course Selected</h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Select a course on the left or create a new course to manage its words.
                  </p>
                  <button
                    onClick={handleOpenAddCourse}
                    className="mt-4 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>Create Course</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Settings & Practice Rules */}
      {activeTab === 'settings' && (
        <div className="flex-1 max-w-2xl mx-auto w-full bg-white p-6 rounded-2xl border border-slate-200 flex flex-col gap-6">
          <h4 className="font-black text-slate-800 text-lg border-b pb-2">Kid Tracing Preferences</h4>

          {/* Letter Case (Capitals vs Small Letters) */}
          <div className="bg-sky-50/70 p-4 rounded-2xl border-2 border-sky-200">
            <label className="block text-sm font-black text-sky-950 mb-1">
              Letter Case (Alphabet Learning & Testing Style):
            </label>
            <p className="text-xs text-slate-600 mb-3">
              Choose whether your child traces and tests words in Capital (Uppercase) or Small (Lowercase) letters for English & Bahasa Malaysia.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLocalSettings((s) => ({ ...s, letterCase: 'uppercase' }))}
                className={`p-3.5 rounded-2xl text-left border-2 transition flex items-center gap-3 ${
                  localSettings.letterCase === 'uppercase'
                    ? 'bg-white border-sky-500 shadow-md ring-2 ring-sky-300'
                    : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500 text-white font-black text-lg flex items-center justify-center shadow-xs">
                  ABC
                </div>
                <div>
                  <div className="font-black text-slate-800 text-sm">Capital Letters (ABC)</div>
                  <div className="text-[11px] text-slate-500">Best for preschool & beginners</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setLocalSettings((s) => ({ ...s, letterCase: 'lowercase' }))}
                className={`p-3.5 rounded-2xl text-left border-2 transition flex items-center gap-3 ${
                  localSettings.letterCase === 'lowercase'
                    ? 'bg-white border-sky-500 shadow-md ring-2 ring-sky-300'
                    : 'bg-white/60 border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white font-black text-lg flex items-center justify-center shadow-xs">
                  abc
                </div>
                <div>
                  <div className="font-black text-slate-800 text-sm">Small Letters (abc)</div>
                  <div className="text-[11px] text-slate-500">Phonics & school handwriting</div>
                </div>
              </button>
            </div>
          </div>

          {/* Repetitions per Word */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Full Word Tracing Repetitions:
            </label>
            <p className="text-xs text-slate-500 mb-2">
              How many times your child traces each full word before advancing.
            </p>
            <div className="flex gap-3">
              {[1, 2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  onClick={() => setLocalSettings((s) => ({ ...s, repetitionsPerWord: count }))}
                  className={`w-12 h-12 rounded-2xl font-black text-lg transition border ${
                    localSettings.repetitionsPerWord === count
                      ? 'bg-amber-400 border-amber-500 text-slate-900 shadow-sm scale-105'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {count}x
                </button>
              ))}
            </div>
          </div>

          {/* Speech Rate */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">
              Narration Speech Rate:
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Slower pacing helps young children distinguish phonetics clearly.
            </p>
            <div className="flex gap-3">
              {[
                { val: 0.7, label: 'Slow (0.7x)' },
                { val: 0.85, label: 'Gentle (0.85x)' },
                { val: 1.0, label: 'Normal (1.0x)' },
              ].map((rate) => (
                <button
                  key={rate.val}
                  onClick={() => setLocalSettings((s) => ({ ...s, speechRate: rate.val }))}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm transition border ${
                    localSettings.speechRate === rate.val
                      ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {rate.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sound & Narration Toggles */}
          <div className="flex flex-col gap-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.autoNarrate}
                onChange={(e) => setLocalSettings((s) => ({ ...s, autoNarrate: e.target.checked }))}
                className="w-5 h-5 accent-sky-600 rounded"
              />
              <span className="font-bold text-slate-700 text-sm">
                Auto-read word aloud upon opening
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.soundEffects}
                onChange={(e) => setLocalSettings((s) => ({ ...s, soundEffects: e.target.checked }))}
                className="w-5 h-5 accent-sky-600 rounded"
              />
              <span className="font-bold text-slate-700 text-sm">
                Play celebratory sound effects & praise fanfare
              </span>
            </label>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3 pt-4 border-t">
            <button
              onClick={handleSaveSettings}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-3 rounded-2xl shadow-md transition active:scale-95"
            >
              <Check className="w-5 h-5" />
              <span>Save Changes</span>
            </button>
            {saveToast && <span className="text-emerald-600 font-bold text-sm">Saved!</span>}
          </div>
        </div>
      )}

      {/* Tab 3: Learning Stats Report */}
      {activeTab === 'stats' && (
        <div className="flex-1 max-w-3xl mx-auto w-full flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Star className="w-6 h-6 fill-amber-400 text-amber-500" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800">{stats.totalStars}</div>
                <div className="text-xs font-semibold text-slate-500">Stars Collected</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800">{stats.totalPracticedWords}</div>
                <div className="text-xs font-semibold text-slate-500">Words Traced</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-slate-800">{stats.totalTestsPassed}</div>
                <div className="text-xs font-semibold text-slate-500">Test Challenges Passed</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-800 text-base mb-2">Reset Learning Data</h4>
            <p className="text-xs text-slate-500 mb-4">
              Clear all stars and mastery history to start a fresh term or course for a new student.
            </p>
            <button
              onClick={handleResetProgress}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold px-4 py-2 rounded-xl border border-red-200 transition text-xs sm:text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset All Progress Data</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL 1: Create New Course Modal */}
      {isAddingCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border-4 border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg">Create New Course</h3>
                  <p className="text-xs text-slate-500">Design a custom learning unit for your child</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingCourse(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="flex flex-col gap-3">
              {/* Course Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  placeholder="e.g. School Supplies, Sight Words Week 1, 水果蔬菜"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 font-bold text-slate-800 text-sm focus:outline-sky-500 focus:bg-white"
                />
              </div>

              {/* Subtitle / Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subtitle / Description
                </label>
                <input
                  type="text"
                  value={newCourseSubtitle}
                  onChange={(e) => setNewCourseSubtitle(e.target.value)}
                  placeholder="e.g. Everyday items we take to class"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-800 text-sm focus:outline-sky-500 focus:bg-white"
                />
              </div>

              {/* Target Language Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Course Language
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
                      onClick={() => setNewCourseLanguage(lang.code as Language)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition ${
                        newCourseLanguage === lang.code
                          ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Theme Accent Color
                </label>
                <div className="flex items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setNewCourseColor(c.hex)}
                      className={`w-8 h-8 rounded-full transition-transform flex items-center justify-center ${
                        newCourseColor === c.hex ? 'scale-115 ring-2 ring-slate-800 ring-offset-2' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {newCourseColor === c.hex && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Repetitions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Traces Per Word in this Course: <span className="text-amber-600">{newCourseReps}x</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rep) => (
                    <button
                      key={rep}
                      type="button"
                      onClick={() => setNewCourseReps(rep)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition ${
                        newCourseReps === rep
                          ? 'bg-amber-400 border-amber-500 text-slate-900 shadow-2xs font-black'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {rep}x
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
                    value={newCourseFirstWord}
                    onChange={(e) => setNewCourseFirstWord(e.target.value)}
                    placeholder="Word (e.g. BOOK)"
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 font-bold text-xs text-slate-800"
                  />
                  <input
                    type="text"
                    value={newCourseFirstTranslation}
                    onChange={(e) => setNewCourseFirstTranslation(e.target.value)}
                    placeholder="Meaning (e.g. Something we read)"
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingCourse(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Create Course</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Delete Course Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border-4 border-red-100 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">Delete Course?</h3>
                <p className="text-xs text-slate-500">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-slate-600">
              Are you sure you want to delete the course{' '}
              <strong className="text-slate-900">"{courseToDelete.title}"</strong>?
              {courseToDelete.words.length > 0 && (
                <span className="block mt-1 font-semibold text-red-600">
                  All {courseToDelete.words.length} words in this course will also be removed.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCourseConfirmed}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Delete Course</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Clear All Words in Course Confirmation */}
      {isConfirmingClearWords && currentCourse && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border-4 border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-lg">Clear All Words?</h3>
                <p className="text-xs text-slate-500">Remove words in "{currentCourse.title}"</p>
              </div>
            </div>

            <p className="text-sm text-slate-600">
              This will remove all {currentCourse.words.length} words from{' '}
              <strong className="text-slate-900">"{currentCourse.title}"</strong>. The course
              itself will remain so you can add your child's fresh custom words.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsConfirmingClearWords(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAllWords}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Yes, Clear Words</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
