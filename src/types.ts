export type Language = 'en' | 'bm' | 'zh';

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  speechLang: string;
  badge: string;
  color: string;
}

export interface WordItem {
  id: string;
  word: string;
  translation: string;
  phonetic?: string; // Pinyin for Chinese, phonetic guide for EN/BM
  category: string;
  language: Language;
  isCustom?: boolean;
  notes?: string;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  language: Language;
  words: WordItem[];
  practiceReps: number; // Configurable repetitions per word (default 2 or 3)
  color: string;
  iconName: string;
}

export interface WordProgress {
  wordId: string;
  practiceCount: number; // How many times completed in current session
  testPassed: boolean;
  stars: number; // 0-3
  lastPracticed: number;
}

export interface ParentSettings {
  pin: string;
  childName: string;
  repetitionsPerWord: number;
  speechRate: number;
  soundEffects: boolean;
  autoNarrate: boolean;
  penColor: string;
  penWidth: number;
  letterCase: 'uppercase' | 'lowercase';
}

export interface LearningStats {
  totalPracticedWords: number;
  totalTestsPassed: number;
  totalStars: number;
  currentStreakDays: number;
}
