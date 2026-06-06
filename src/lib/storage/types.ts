import type { Goal, GoalCompletion, Reward } from '@/types';

// Storage interface — implement this to swap backends (localStorage ↔ Google Sheets ↔ Supabase)
export interface IStorage {
  // Goals
  getGoals(): Promise<Goal[]>;
  createGoal(goal: Omit<Goal, 'id' | 'createdAt'>): Promise<Goal>;
  updateGoal(id: string, updates: Partial<Goal>): Promise<Goal>;
  deleteGoal(id: string): Promise<void>;

  // Completions
  getCompletions(): Promise<GoalCompletion[]>;
  createCompletion(completion: Omit<GoalCompletion, 'id' | 'completedAt'>): Promise<GoalCompletion>;
  deleteCompletion(id: string): Promise<void>;

  // Rewards
  getRewards(): Promise<Reward[]>;
  createReward(reward: Omit<Reward, 'id' | 'createdAt'>): Promise<Reward>;
  updateReward(id: string, updates: Partial<Reward>): Promise<Reward>;
  deleteReward(id: string): Promise<void>;
}
