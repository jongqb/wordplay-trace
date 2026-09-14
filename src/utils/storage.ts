import { Course, Language, ParentSettings, WordProgress, LearningStats } from '../types';

export const DEFAULT_PARENT_SETTINGS: ParentSettings = {
  pin: '1234',
  childName: 'Little Star',
  repetitionsPerWord: 2, // Practice 2 times before test
  speechRate: 0.85,
  soundEffects: true,
  autoNarrate: true,
  penColor: '#2563EB',
  penWidth: 12,
  letterCase: 'uppercase',
};

export const INITIAL_COURSES: Course[] = [
  // ENGLISH COURSES
  {
    id: 'en-animals',
    title: 'Happy Animals',
    subtitle: 'Common animal friends',
    language: 'en',
    practiceReps: 2,
    color: '#3B82F6',
    iconName: 'Dog',
    words: [
      { id: 'en-cat', word: 'CAT', translation: 'Feline friend that meows', phonetic: '/kæt/', category: 'Animals', language: 'en' },
      { id: 'en-dog', word: 'DOG', translation: 'Friendly puppy that barks', phonetic: '/dɒɡ/', category: 'Animals', language: 'en' },
      { id: 'en-lion', word: 'LION', translation: 'Brave king of the jungle', phonetic: '/ˈlaɪ.ən/', category: 'Animals', language: 'en' },
      { id: 'en-fish', word: 'FISH', translation: 'Swims in the water', phonetic: '/fɪʃ/', category: 'Animals', language: 'en' },
      { id: 'en-bird', word: 'BIRD', translation: 'Flies high in the sky', phonetic: '/bɜːd/', category: 'Animals', language: 'en' },
    ],
  },
  {
    id: 'en-colors',
    title: 'Rainbow Colors',
    subtitle: 'Bright everyday colors',
    language: 'en',
    practiceReps: 2,
    color: '#F59E0B',
    iconName: 'Palette',
    words: [
      { id: 'en-red', word: 'RED', translation: 'Like ripe strawberries', phonetic: '/red/', category: 'Colors', language: 'en' },
      { id: 'en-blue', word: 'BLUE', translation: 'Like clear ocean waves', phonetic: '/bluː/', category: 'Colors', language: 'en' },
      { id: 'en-gold', word: 'GOLD', translation: 'Like shining sunshine', phonetic: '/ɡoʊld/', category: 'Colors', language: 'en' },
      { id: 'en-pink', word: 'PINK', translation: 'Like blooming flowers', phonetic: '/pɪŋk/', category: 'Colors', language: 'en' },
    ],
  },
  {
    id: 'en-nature',
    title: 'Wonder Nature',
    subtitle: 'Sky and earth wonders',
    language: 'en',
    practiceReps: 2,
    color: '#10B981',
    iconName: 'Sun',
    words: [
      { id: 'en-sun', word: 'SUN', translation: 'Gives us light and warmth', phonetic: '/sʌn/', category: 'Nature', language: 'en' },
      { id: 'en-star', word: 'STAR', translation: 'Twinkles in the night', phonetic: '/stɑːr/', category: 'Nature', language: 'en' },
      { id: 'en-tree', word: 'TREE', translation: 'Green plant with leaves', phonetic: '/triː/', category: 'Nature', language: 'en' },
      { id: 'en-moon', word: 'MOON', translation: 'Shines in the dark sky', phonetic: '/muːn/', category: 'Nature', language: 'en' },
    ],
  },

  // BAHASA MALAYSIA COURSES
  {
    id: 'bm-haiwan',
    title: 'Kawan Haiwan',
    subtitle: 'Haiwan comel di sekeliling kita',
    language: 'bm',
    practiceReps: 2,
    color: '#F97316',
    iconName: 'Cat',
    words: [
      { id: 'bm-kucing', word: 'KUCING', translation: 'Cat (Kucing comel)', phonetic: 'ku-cing', category: 'Haiwan', language: 'bm' },
      { id: 'bm-ikan', word: 'IKAN', translation: 'Fish (Ikan berenang)', phonetic: 'i-kan', category: 'Haiwan', language: 'bm' },
      { id: 'bm-ayam', word: 'AYAM', translation: 'Chicken (Ayam berkokok)', phonetic: 'a-yam', category: 'Haiwan', language: 'bm' },
      { id: 'bm-burung', word: 'BURUNG', translation: 'Bird (Burung terbang)', phonetic: 'bu-rung', category: 'Haiwan', language: 'bm' },
      { id: 'bm-katak', word: 'KATAK', translation: 'Frog (Katak melompat)', phonetic: 'ka-tak', category: 'Haiwan', language: 'bm' },
    ],
  },
  {
    id: 'bm-alam',
    title: 'Alam Semesta',
    subtitle: 'Perkataan mudah alam & warna',
    language: 'bm',
    practiceReps: 2,
    color: '#06B6D4',
    iconName: 'Sparkles',
    words: [
      { id: 'bm-bintang', word: 'BINTANG', translation: 'Star (Bintang berkelip)', phonetic: 'bin-tang', category: 'Alam', language: 'bm' },
      { id: 'bm-pokok', word: 'POKOK', translation: 'Tree (Pokok hijau)', phonetic: 'po-kok', category: 'Alam', language: 'bm' },
      { id: 'bm-buku', word: 'BUKU', translation: 'Book (Buku cerita)', phonetic: 'bu-ku', category: 'Sekolah', language: 'bm' },
      { id: 'bm-rumah', word: 'RUMAH', translation: 'Home (Rumah selesa)', phonetic: 'ru-mah', category: 'Kehidupan', language: 'bm' },
    ],
  },

  // CHINESE COURSES
  {
    id: 'zh-basic',
    title: '基础汉字启蒙',
    subtitle: '最常用初学基础汉字',
    language: 'zh',
    practiceReps: 2,
    color: '#EC4899',
    iconName: 'BookOpen',
    words: [
      { id: 'zh-xue', word: '学', translation: 'Learn / Study', phonetic: 'xué', category: '启蒙', language: 'zh', notes: 'Logo character: WordPlay Trace' },
      { id: 'zh-da', word: '大', translation: 'Big / Large', phonetic: 'dà', category: '日常', language: 'zh' },
      { id: 'zh-xiao', word: '小', translation: 'Small / Little', phonetic: 'xiǎo', category: '日常', language: 'zh' },
      { id: 'zh-ri', word: '日', translation: 'Sun / Day', phonetic: 'rì', category: '自然', language: 'zh' },
      { id: 'zh-yue', word: '月', translation: 'Moon / Month', phonetic: 'yuè', category: '自然', language: 'zh' },
      { id: 'zh-ren', word: '人', translation: 'Person / Human', phonetic: 'rén', category: '人物', language: 'zh' },
    ],
  },
  {
    id: 'zh-nature',
    title: '自然与天地',
    subtitle: '水火木土山水自然字',
    language: 'zh',
    practiceReps: 2,
    color: '#10B981',
    iconName: 'TreePine',
    words: [
      { id: 'zh-shui', word: '水', translation: 'Water', phonetic: 'shuǐ', category: '自然', language: 'zh' },
      { id: 'zh-huo', word: '火', translation: 'Fire', phonetic: 'huǒ', category: '自然', language: 'zh' },
      { id: 'zh-mu', word: '木', translation: 'Wood / Tree', phonetic: 'mù', category: '自然', language: 'zh' },
      { id: 'zh-shan', word: '山', translation: 'Mountain', phonetic: 'shān', category: '自然', language: 'zh' },
      { id: 'zh-tian', word: '天', translation: 'Sky / Heaven', phonetic: 'tiān', category: '自然', language: 'zh' },
    ],
  },
];

const STORAGE_KEYS = {
  COURSES: 'wordplay_courses_v1',
  SETTINGS: 'wordplay_settings_v1',
  PROGRESS: 'wordplay_progress_v1',
  STATS: 'wordplay_stats_v1',
};

export class StorageService {
  public static getCourses(): Course[] {
    if (typeof window === 'undefined') return INITIAL_COURSES;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COURSES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
        return INITIAL_COURSES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_COURSES;
    }
  }

  public static saveCourses(courses: Course[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(courses));
    } catch {}
  }

  public static getSettings(): ParentSettings {
    if (typeof window === 'undefined') return DEFAULT_PARENT_SETTINGS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_PARENT_SETTINGS, ...JSON.parse(data) } : DEFAULT_PARENT_SETTINGS;
    } catch {
      return DEFAULT_PARENT_SETTINGS;
    }
  }

  public static saveSettings(settings: ParentSettings) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  }

  public static getProgress(): Record<string, WordProgress> {
    if (typeof window === 'undefined') return {};
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  public static saveWordProgress(wordId: string, updates: Partial<WordProgress>) {
    if (typeof window === 'undefined') return;
    try {
      const allProgress = this.getProgress();
      const current = allProgress[wordId] || {
        wordId,
        practiceCount: 0,
        testPassed: false,
        stars: 0,
        lastPracticed: Date.now(),
      };
      allProgress[wordId] = {
        ...current,
        ...updates,
        lastPracticed: Date.now(),
      };
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(allProgress));
    } catch {}
  }

  public static getStats(): LearningStats {
    if (typeof window === 'undefined') {
      return { totalPracticedWords: 0, totalTestsPassed: 0, totalStars: 0, currentStreakDays: 1 };
    }
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      return data
        ? JSON.parse(data)
        : { totalPracticedWords: 0, totalTestsPassed: 0, totalStars: 0, currentStreakDays: 1 };
    } catch {
      return { totalPracticedWords: 0, totalTestsPassed: 0, totalStars: 0, currentStreakDays: 1 };
    }
  }

  public static addStats(starsEarned: number, testPassed: boolean = false) {
    if (typeof window === 'undefined') return;
    try {
      const current = this.getStats();
      const next: LearningStats = {
        totalPracticedWords: current.totalPracticedWords + 1,
        totalTestsPassed: current.totalTestsPassed + (testPassed ? 1 : 0),
        totalStars: current.totalStars + starsEarned,
        currentStreakDays: Math.max(1, current.currentStreakDays),
      };
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(next));
    } catch {}
  }

  public static resetProgress() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEYS.PROGRESS);
      localStorage.removeItem(STORAGE_KEYS.STATS);
    } catch {}
  }

  public static resetDefaultCourses(): Course[] {
    if (typeof window === 'undefined') return INITIAL_COURSES;
    try {
      localStorage.setItem(STORAGE_KEYS.COURSES, JSON.stringify(INITIAL_COURSES));
      return INITIAL_COURSES;
    } catch {
      return INITIAL_COURSES;
    }
  }
}
