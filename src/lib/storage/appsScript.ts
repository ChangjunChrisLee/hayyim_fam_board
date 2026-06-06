/**
 * Google Apps Script 웹앱을 통한 스토리지.
 *
 * 데이터를 스프레드시트의 A1 셀에 JSON 전체를 저장합니다.
 * 단순하고 무료이며 개인 구글 계정으로 동작합니다.
 *
 * 환경변수: APPS_SCRIPT_URL
 */

import { v4 as uuidv4 } from 'uuid';
import type { Goal, GoalCompletion, Reward } from '@/types';
import type { IStorage } from './types';

interface DataStore {
  goals: Goal[];
  completions: GoalCompletion[];
  rewards: Reward[];
}

const EMPTY: DataStore = { goals: [], completions: [], rewards: [] };

async function readAll(): Promise<DataStore> {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) throw new Error('APPS_SCRIPT_URL not set');
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return EMPTY;
    return (await res.json()) as DataStore;
  } catch {
    return EMPTY;
  }
}

async function writeAll(data: DataStore): Promise<void> {
  const url = process.env.APPS_SCRIPT_URL;
  if (!url) throw new Error('APPS_SCRIPT_URL not set');
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export class AppsScriptStorage implements IStorage {
  // Goals
  async getGoals(): Promise<Goal[]> {
    return (await readAll()).goals;
  }

  async createGoal(goal: Omit<Goal, 'id' | 'createdAt'>): Promise<Goal> {
    const data = await readAll();
    const newGoal: Goal = { ...goal, id: uuidv4(), createdAt: new Date().toISOString() };
    data.goals.push(newGoal);
    await writeAll(data);
    return newGoal;
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    const data = await readAll();
    const idx = data.goals.findIndex((g) => g.id === id);
    if (idx === -1) throw new Error(`Goal ${id} not found`);
    data.goals[idx] = { ...data.goals[idx], ...updates };
    await writeAll(data);
    return data.goals[idx];
  }

  async deleteGoal(id: string): Promise<void> {
    const data = await readAll();
    data.goals = data.goals.filter((g) => g.id !== id);
    data.completions = data.completions.filter((c) => c.goalId !== id);
    await writeAll(data);
  }

  // Completions
  async getCompletions(): Promise<GoalCompletion[]> {
    return (await readAll()).completions;
  }

  async createCompletion(completion: Omit<GoalCompletion, 'id' | 'completedAt'>): Promise<GoalCompletion> {
    const data = await readAll();
    const newC: GoalCompletion = {
      ...completion,
      id: uuidv4(),
      completedAt: new Date().toISOString(),
    };
    data.completions.push(newC);
    await writeAll(data);
    return newC;
  }

  async deleteCompletion(id: string): Promise<void> {
    const data = await readAll();
    data.completions = data.completions.filter((c) => c.id !== id);
    await writeAll(data);
  }

  // Rewards
  async getRewards(): Promise<Reward[]> {
    return (await readAll()).rewards;
  }

  async createReward(reward: Omit<Reward, 'id' | 'createdAt'>): Promise<Reward> {
    const data = await readAll();
    const newR: Reward = { ...reward, id: uuidv4(), createdAt: new Date().toISOString() };
    data.rewards.push(newR);
    await writeAll(data);
    return newR;
  }

  async updateReward(id: string, updates: Partial<Reward>): Promise<Reward> {
    const data = await readAll();
    const idx = data.rewards.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Reward ${id} not found`);
    data.rewards[idx] = { ...data.rewards[idx], ...updates };
    await writeAll(data);
    return data.rewards[idx];
  }

  async deleteReward(id: string): Promise<void> {
    const data = await readAll();
    data.rewards = data.rewards.filter((r) => r.id !== id);
    await writeAll(data);
  }
}
