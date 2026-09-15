import React, { useState, useEffect } from 'react';
import { Course, Language, ParentSettings, WordItem, WordProgress, LearningStats } from './types';
import { StorageService, DEFAULT_PARENT_SETTINGS } from './utils/storage';
import { soundEngine } from './utils/audio';
import { KidHeader } from './components/KidHeader';
import { CourseSelector } from './components/CourseSelector';
import { TracingCanvas } from './components/TracingCanvas';
import { ChineseHanziTracer } from './components/ChineseHanziTracer';
import { TestCanvas } from './components/TestCanvas';
import { CourseTestSummary, TestResultItem } from './components/CourseTestSummary';
import { ParentDashboard } from './components/ParentDashboard';
import { PinModal } from './components/PinModal';
import { SplashScreen } from './components/SplashScreen';
import { ArrowLeft, Shield } from 'lucide-react';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(false);
  const [appMode, setAppMode] = useState<'kid' | 'parent'>('kid');
  const [kidPhase, setKidPhase] = useState<
    'selector' | 'practice' | 'course_test' | 'course_test_summary'
  >('selector');

  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedWord, setSelectedWord] = useState<WordItem | null>(null);

  // Practice Repetitions
  const [currentRepetition, setCurrentRepetition] = useState<number>(1);
  const [parentSettings, setParentSettings] = useState<ParentSettings>(DEFAULT_PARENT_SETTINGS);
  const [progressMap, setProgressMap] = useState<Record<string, WordProgress>>({});
  const [stats, setStats] = useState<LearningStats>({
    totalPracticedWords: 0,
    totalTestsPassed: 0,
    totalStars: 0,
    currentStreakDays: 1,
  });

  // Randomized Course Test State
  const [testQueue, setTestQueue] = useState<WordItem[]>([]);
  const [currentTestIndex, setCurrentTestIndex] = useState<number>(0);
  const [testResults, setTestResults] = useState<TestResultItem[]>([]);

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize data on mount
  useEffect(() => {
    const loadedCourses = StorageService.getCourses();
    const loadedSettings = StorageService.getSettings();
    const loadedProgress = StorageService.getProgress();
    const loadedStats = StorageService.getStats();

    setCourses(loadedCourses);
    setParentSettings(loadedSettings);
    setProgressMap(loadedProgress);
    setStats(loadedStats);

    // Initial selected course
    const firstCourse =
      loadedCourses.find((c) => c.language === currentLanguage) || loadedCourses[0];
    setSelectedCourse(firstCourse || null);
  }, []);

  // Filter courses for active language
  const activeCourses = courses.filter((c) => c.language === currentLanguage);
  const activeCourse =
    selectedCourse && selectedCourse.language === currentLanguage
      ? selectedCourse
      : activeCourses[0] || null;

  // Language switcher
  const handleLanguageChange = (lang: Language) => {
    setCurrentLanguage(lang);
    const match = courses.find((c) => c.language === lang);
    if (match) {
      setSelectedCourse(match);
    }
    setKidPhase('selector');
    setSelectedWord(null);
  };

  // Toggle letter case (Capitals vs Small)
  const handleToggleLetterCase = () => {
    const nextCase = parentSettings.letterCase === 'lowercase' ? 'uppercase' : 'lowercase';
    const updated = { ...parentSettings, letterCase: nextCase as 'uppercase' | 'lowercase' };
    setParentSettings(updated);
    StorageService.saveSettings(updated);
    soundEngine.playStarPop(1);
  };

  // Kid selects a word for full-word practice
  const handleSelectWord = (word: WordItem) => {
    setSelectedWord(word);
    setCurrentRepetition(1);
    setKidPhase('practice');
  };

  // Repetition complete within full-word tracing
  const handleRepetitionComplete = () => {
    const totalReps = parentSettings.repetitionsPerWord || 2;
    if (currentRepetition < totalReps) {
      setCurrentRepetition((prev) => prev + 1);
    } else {
      handleAdvanceToNextWord();
    }
  };

  // Advance to next word in the course during practice
  const handleAdvanceToNextWord = () => {
    if (!activeCourse || !selectedWord) {
      setKidPhase('selector');
      return;
    }

    // Save practice progress
    const currentProg = progressMap[selectedWord.id] || {
      wordId: selectedWord.id,
      practiceCount: 0,
      testPassed: false,
      stars: 0,
      lastPracticed: Date.now(),
    };
    StorageService.saveWordProgress(selectedWord.id, {
      practiceCount: (currentProg.practiceCount || 0) + 1,
    });
    setProgressMap(StorageService.getProgress());

    const currentIndex = activeCourse.words.findIndex((w) => w.id === selectedWord.id);
    if (currentIndex !== -1 && currentIndex + 1 < activeCourse.words.length) {
      // Advance to next word in the course
      const nextWord = activeCourse.words[currentIndex + 1];
      setSelectedWord(nextWord);
      setCurrentRepetition(1);
      setKidPhase('practice');
    } else {
      // Finished all words in course! Launch the Course Test!
      handleStartCourseTest();
    }
  };

  // Shuffle array helper for randomized testing
  const shuffleArray = <T,>(array: T[]): T[] => {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  // Start Randomized Course Test (Testing all words in this course in random order)
  const handleStartCourseTest = () => {
    if (!activeCourse || activeCourse.words.length === 0) return;
    const shuffledWords = shuffleArray(activeCourse.words);
    setTestQueue(shuffledWords);
    setCurrentTestIndex(0);
    setTestResults([]);
    setKidPhase('course_test');
  };

  // Single word completed during the randomized course test
  const handleWordTestComplete = (starsEarned: number) => {
    if (currentTestIndex >= testQueue.length) return;

    const testedWord = testQueue[currentTestIndex];
    const newResult: TestResultItem = {
      wordId: testedWord.id,
      word: testedWord.word,
      translation: testedWord.translation,
      stars: starsEarned,
      passed: starsEarned >= 2,
    };

    const updatedResults = [...testResults, newResult];
    setTestResults(updatedResults);

    // Refresh progress and stats
    setProgressMap(StorageService.getProgress());
    setStats(StorageService.getStats());

    if (currentTestIndex + 1 < testQueue.length) {
      // Next random word in the course test
      setCurrentTestIndex((prev) => prev + 1);
    } else {
      // All words in the course test completed!
      setKidPhase('course_test_summary');
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMuted(nextMuted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E0F2FE] via-[#F0F9FF] to-[#E2E8F0] text-slate-800 flex flex-col font-sans select-none antialiased">
      {/* Splash Screen */}
      {showSplash && <SplashScreen onStart={() => setShowSplash(false)} />}

      {/* Top Tablet Header with Quick Letter Case Switcher */}
      <KidHeader
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        stars={stats.totalStars}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenParentPin={() => setIsPinModalOpen(true)}
        letterCase={parentSettings.letterCase}
        onToggleLetterCase={handleToggleLetterCase}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-3 sm:p-6 flex flex-col items-center justify-center">
        {/* Parent Mode Screen */}
        {appMode === 'parent' ? (
          <ParentDashboard
            courses={courses}
            settings={parentSettings}
            stats={stats}
            onUpdateCourses={(updated) => {
              setCourses(updated);
              StorageService.saveCourses(updated);
            }}
            onUpdateSettings={(updated) => {
              setParentSettings(updated);
              StorageService.saveSettings(updated);
            }}
            onExitParentMode={() => setAppMode('kid')}
          />
        ) : (
          /* Kid Mode Screen */
          <div className="w-full flex-1 flex flex-col items-center">
            {/* Breadcrumb / Back Navigation */}
            {kidPhase !== 'selector' && (
              <div className="w-full max-w-4xl flex items-center justify-between mb-3 px-1">
                <button
                  onClick={() => {
                    soundEngine.playTraceStroke();
                    setKidPhase('selector');
                  }}
                  className="flex items-center gap-2 bg-white/90 hover:bg-white text-sky-800 font-bold px-4 py-2 rounded-2xl border-2 border-sky-200 shadow-2xs transition active:scale-95 text-xs sm:text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Course Words</span>
                </button>

                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold bg-white/80 px-4 py-1.5 rounded-2xl border border-sky-200 text-slate-700">
                  <span>Course:</span>
                  <span className="text-sky-600">{activeCourse?.title}</span>
                </div>
              </div>
            )}

            {/* View 1: Course & Words Selector */}
            {kidPhase === 'selector' && activeCourse && (
              <div className="w-full">
                <div className="text-center mb-5">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-1">
                    What would you like to trace today?
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Trace full words with guided strokes, then test all words at the end of the course!
                  </p>
                </div>

                <CourseSelector
                  courses={activeCourses}
                  selectedCourse={activeCourse}
                  onSelectCourse={(course) => setSelectedCourse(course)}
                  onSelectWord={handleSelectWord}
                  onStartCourseTest={handleStartCourseTest}
                  progressMap={progressMap}
                  letterCase={parentSettings.letterCase}
                  onOpenParentDashboard={() => setIsPinModalOpen(true)}
                />
              </div>
            )}

            {/* Empty Courses State in Kid Mode */}
            {kidPhase === 'selector' && !activeCourse && (
              <div className="w-full max-w-lg mx-auto bg-white rounded-3xl p-8 border-3 border-dashed border-sky-300 text-center flex flex-col items-center justify-center my-12 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                  <Shield className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-1">No Courses In This Language Yet</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-4">
                  Parents can easily create new courses and sight words inside the Parent Zone.
                </p>
                <button
                  onClick={() => setIsPinModalOpen(true)}
                  className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-6 py-2.5 rounded-2xl shadow-sm transition active:scale-95 text-sm cursor-pointer border-2 border-amber-300"
                >
                  Open Parent Zone
                </button>
              </div>
            )}

            {/* View 2: Step 1 Full Word Tracing (English & BM Latin) */}
            {kidPhase === 'practice' && selectedWord && selectedWord.language !== 'zh' && (
              <TracingCanvas
                wordItem={selectedWord}
                currentRepetition={currentRepetition}
                totalRepetitions={parentSettings.repetitionsPerWord || 2}
                settings={parentSettings}
                onRepetitionComplete={handleRepetitionComplete}
                onAdvanceToNextWord={handleAdvanceToNextWord}
              />
            )}

            {/* View 3: Step 1 Chinese Hanzi Tracing */}
            {kidPhase === 'practice' && selectedWord && selectedWord.language === 'zh' && (
              <ChineseHanziTracer
                wordItem={selectedWord}
                currentRepetition={currentRepetition}
                totalRepetitions={parentSettings.repetitionsPerWord || 2}
                settings={parentSettings}
                onRepetitionComplete={handleRepetitionComplete}
                onAdvanceToNextWord={handleAdvanceToNextWord}
              />
            )}

            {/* View 4: End-of-Course Randomized Test Phase */}
            {kidPhase === 'course_test' && testQueue[currentTestIndex] && activeCourse && (
              <TestCanvas
                wordItem={testQueue[currentTestIndex]}
                currentIndex={currentTestIndex}
                totalWords={testQueue.length}
                courseTitle={activeCourse.title}
                settings={parentSettings}
                onTestComplete={handleWordTestComplete}
                onQuitTest={() => setKidPhase('selector')}
              />
            )}

            {/* View 5: End-of-Course Test Certificate & Summary */}
            {kidPhase === 'course_test_summary' && activeCourse && (
              <CourseTestSummary
                course={activeCourse}
                results={testResults}
                settings={parentSettings}
                onRetakeTest={handleStartCourseTest}
                onBackToCourse={() => {
                  setKidPhase('selector');
                  setSelectedWord(null);
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Parent PIN Security Modal */}
      <PinModal
        isOpen={isPinModalOpen}
        correctPin={parentSettings.pin || '1234'}
        onSuccess={() => {
          setIsPinModalOpen(false);
          setAppMode('parent');
        }}
        onClose={() => {
          setIsPinModalOpen(false);
        }}
      />
    </div>
  );
}
