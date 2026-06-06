// =====================
// Core Data Types
// =====================

export type RepeatType = 'daily' | 'weekly' | 'monthly';
export type RewardPeriod = 'daily' | 'weekly' | 'monthly';
export type ViewMode = 'daily' | 'weekly' | 'monthly';

export interface Member {
  id: string;
  name: string;
  role: string;
  icon: string;
  color: string;        // Tailwind text/border color class or hex
  bgColor: string;      // Tailwind bg color class or hex
  bgLightColor: string; // Lighter bg for cards
}

export interface Goal {
  id: string;
  memberId: string;
  category: string;
  content: string;
  repeatType: RepeatType;
  createdAt: string; // ISO string
  isActive: boolean;
}

export interface GoalCompletion {
  id: string;
  goalId: string;
  memberId: string;
  completedAt: string; // ISO string
  period: string;      // YYYY-MM-DD (daily) | YYYY-WXX (weekly) | YYYY-MM (monthly)
}

export interface Reward {
  id: string;
  period: RewardPeriod;
  targetPercentage: number; // 0-100
  description: string;
  createdAt: string; // ISO string
}

// =====================
// App State
// =====================

export interface AppData {
  members: Member[];
  goals: Goal[];
  completions: GoalCompletion[];
  rewards: Reward[];
}

// =====================
// API Response Types
// =====================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

// =====================
// UI Helper Types
// =====================

export interface MemberStats {
  memberId: string;
  totalGoals: number;
  completedGoals: number;
  percentage: number;
}

export interface FamilyStats {
  totalGoals: number;
  completedGoals: number;
  percentage: number;
  memberStats: MemberStats[];
}

// =====================
// Future Extension Types
// =====================

// 마음카드 (Heart Card) - 가족에게 보내는 감사/사랑 메시지
export interface HeartCard {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  message: string;
  emoji: string;
  createdAt: string;
}

// 칭찬 스티커 (Praise Sticker)
export interface PraiseSticker {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  sticker: string;
  reason: string;
  createdAt: string;
}

// 가족 미션 (Family Mission)
export interface FamilyMission {
  id: string;
  title: string;
  description: string;
  reward: string;
  targetDate: string;
  isCompleted: boolean;
  createdAt: string;
}
