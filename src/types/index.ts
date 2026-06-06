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
  color: string;
  bgColor: string;
  bgLightColor: string;
}

export interface Goal {
  id: string;
  memberId: string;
  category: string;
  content: string;
  repeatType: RepeatType;
  createdAt: string;
  isActive: boolean;
}

export interface GoalCompletion {
  id: string;
  goalId: string;
  memberId: string;
  completedAt: string;
  period: string;
}

export interface Reward {
  id: string;
  period: RewardPeriod;
  targetPercentage: number;
  description: string;
  createdAt: string;
}

export interface Note {
  id: string;
  memberId: string;
  content: string;
  createdAt: string;
}

// =====================
// App State
// =====================

export interface AppData {
  members: Member[];
  goals: Goal[];
  completions: GoalCompletion[];
  rewards: Reward[];
  notes: Note[];
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
