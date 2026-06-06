/**
 * File-based JSON storage.
 *
 * data.json 파일 하나에 모든 데이터를 저장합니다.
 * 이 파일을 Google Drive 폴더에 두면 자동 동기화됩니다.
 *
 * 환경변수: DATA_FILE_PATH (기본값: ./data.json)
 */

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { Goal, GoalCompletion, Reward } from '@/types';
import type { IStorage } from './types';

interface DataStore {
  goals: Goal[];
  completions: GoalCompletion[];
  rewards: Reward[];
}

function getFilePath(): string {
  return process.env.DATA_FILE_PATH
    ? path.resolve(process.env.DATA_FILE_PATH)
    : path.resolve(process.cwd(), 'data.json');
}

function readData(): DataStore {
  const filePath = getFilePath();
  try {
    if (!fs.existsSync(filePath)) {
      return { goals: [], completions: [], rewards: [] };
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as DataStore;
  } catch {
    return { goals: [], completions: [], rewards: [] };
  }
}

function writeData(data: DataStore): void {
  const filePath = getFilePath();
  // 파일이 없으면 디렉토리 생성
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export class FileStorage implements IStorage {
  // Goals
  async getGoals(): Promise<Goal[]> {
    return readData().goals;
  }

  async createGoal(goal: Omit<Goal, 'id' | 'createdAt'>): Promise<Goal> {
    const data = readData();
    const newGoal: Goal = { ...goal, id: uuidv4(), createdAt: new Date().toISOString() };
    data.goals.push(newGoal);
    writeData(data);
    return newGoal;
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    const data = readData();
    const idx = data.goals.findIndex((g) => g.id === id);
    if (idx === -1) throw new Error(`Goal ${id} not found`);
    data.goals[idx] = { ...data.goals[idx], ...updates };
    writeData(data);
    return data.goals[idx];
  }

  async deleteGoal(id: string): Promise<void> {
    const data = readData();
    data.goals = data.goals.filter((g) => g.id !== id);
    data.completions = data.completions.filter((c) => c.goalId !== id);
    writeData(data);
  }

  // Completions
  async getCompletions(): Promise<GoalCompletion[]> {
    return readData().completions;
  }

  async createCompletion(completion: Omit<GoalCompletion, 'id' | 'completedAt'>): Promise<GoalCompletion> {
    const data = readData();
    const newC: GoalCompletion = {
      ...completion,
      id: uuidv4(),
      completedAt: new Date().toISOString(),
    };
    data.completions.push(newC);
    writeData(data);
    return newC;
  }

  async deleteCompletion(id: string): Promise<void> {
    const data = readData();
    data.completions = data.completions.filter((c) => c.id !== id);
    writeData(data);
  }

  // Rewards
  async getRewards(): Promise<Reward[]> {
    return readData().rewards;
  }

  async createReward(reward: Omit<Reward, 'id' | 'createdAt'>): Promise<Reward> {
    const data = readData();
    const newR: Reward = { ...reward, id: uuidv4(), createdAt: new Date().toISOString() };
    data.rewards.push(newR);
    writeData(data);
    return newR;
  }

  async updateReward(id: string, updates: Partial<Reward>): Promise<Reward> {
    const data = readData();
    const idx = data.rewards.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Reward ${id} not found`);
    data.rewards[idx] = { ...data.rewards[idx], ...updates };
    writeData(data);
    return data.rewards[idx];
  }

  async deleteReward(id: string): Promise<void> {
    const data = readData();
    data.rewards = data.rewards.filter((r) => r.id !== id);
    writeData(data);
  }
}
