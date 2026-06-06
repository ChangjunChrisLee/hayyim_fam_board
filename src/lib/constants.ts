import type { Member } from '@/types';

// =====================
// Default Family Members
// =====================
export const DEFAULT_MEMBERS: Member[] = [
  {
    id: 'dad',
    name: '이창준',
    role: '아빠',
    icon: '🦁',
    color: '#5B9BD5',
    bgColor: '#BFD7FF',
    bgLightColor: '#E8F1FF',
  },
  {
    id: 'mom',
    name: '문소원',
    role: '엄마',
    icon: '🐰',
    color: '#E07A95',
    bgColor: '#FFD6E0',
    bgLightColor: '#FFF0F3',
  },
  {
    id: 'haim',
    name: '이하임',
    role: '초5',
    icon: '🐥',
    color: '#8B6BC8',
    bgColor: '#E0D7FF',
    bgLightColor: '#F5F2FF',
  },
  {
    id: 'haun',
    name: '이하운',
    role: '초3',
    icon: '🐻',
    color: '#3BAA8E',
    bgColor: '#C7F2E8',
    bgLightColor: '#EDFAF6',
  },
  {
    id: 'hayul',
    name: '이하율',
    role: '6살',
    icon: '🐣',
    color: '#D4A017',
    bgColor: '#FFF3C4',
    bgLightColor: '#FFFAE8',
  },
];

// =====================
// Encouragement Messages
// =====================
export const ENCOURAGEMENT_MESSAGES = {
  low: ['시작이 반이에요! 🌱', '오늘도 파이팅! 💪', '할 수 있어요! ✨'],
  medium: ['잘 하고 있어요! 🌟', '멋져요! 계속 달려봐요! 🏃', '훌륭해요! 더 가봐요! 🚀'],
  high: ['와~ 거의 다 왔어요! 🎯', '대단해요! 목표가 눈앞에! 🏆', '놀라워요! 조금만 더! ⭐'],
  perfect: ['완벽해요! 최고의 가족! 🎉', '우리 가족 최고! 🥇', '만점이에요! 대박! 🌈'],
};

export const getEncouragementMessage = (percentage: number): string => {
  const msgs =
    percentage === 100
      ? ENCOURAGEMENT_MESSAGES.perfect
      : percentage >= 70
      ? ENCOURAGEMENT_MESSAGES.high
      : percentage >= 40
      ? ENCOURAGEMENT_MESSAGES.medium
      : ENCOURAGEMENT_MESSAGES.low;
  return msgs[Math.floor(Math.random() * msgs.length)];
};

// =====================
// Period Helpers
// =====================
export const getPeriodKey = (date: Date, repeatType: 'daily' | 'weekly' | 'monthly'): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');

  if (repeatType === 'daily') return `${y}-${m}-${d}`;
  if (repeatType === 'monthly') return `${y}-${m}`;

  // weekly: ISO week
  const thursday = new Date(date);
  thursday.setDate(date.getDate() - ((date.getDay() + 6) % 7) + 3);
  const firstThursday = new Date(thursday.getFullYear(), 0, 4);
  const weekNum = Math.round(
    ((thursday.getTime() - firstThursday.getTime()) / 86400000 + 1) / 7
  );
  return `${thursday.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
};

export const getCurrentPeriodKey = (repeatType: 'daily' | 'weekly' | 'monthly'): string =>
  getPeriodKey(new Date(), repeatType);

// Check if a completion belongs to the current view period
export const isInViewPeriod = (
  completedAt: string,
  viewMode: 'daily' | 'weekly' | 'monthly'
): boolean => {
  const date = new Date(completedAt);
  const now = new Date();

  if (viewMode === 'daily') {
    return date.toDateString() === now.toDateString();
  }
  if (viewMode === 'weekly') {
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return date >= startOfWeek && date <= endOfWeek;
  }
  // monthly
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
};

// Check if a goal should appear in the current view
export const isGoalInView = (
  goal: { repeatType: 'daily' | 'weekly' | 'monthly' },
  viewMode: 'daily' | 'weekly' | 'monthly'
): boolean => {
  if (viewMode === 'daily') return goal.repeatType === 'daily';
  if (viewMode === 'weekly') return goal.repeatType === 'daily' || goal.repeatType === 'weekly';
  return true; // monthly shows all
};
