'use client';

/**
 * Main data hook.
 * Talks to the Next.js API routes on server (which use Google Sheets).
 * Falls back to localStorage when the API returns an error (e.g., env vars not set).
 */

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Goal, GoalCompletion, Reward, ViewMode, FamilyStats, MemberStats } from '@/types';
import { DEFAULT_MEMBERS } from '@/lib/constants';
import { getCurrentPeriodKey, isInViewPeriod, isGoalInView } from '@/lib/constants';

// ── localStorage helpers ──────────────────────────────────────────────────────

const LS_KEYS = { goals: 'hfb_goals', completions: 'hfb_completions', rewards: 'hfb_rewards' };

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...init });
    const json = await res.json();
    if (!res.ok) return null;
    return json.data as T;
  } catch {
    return null;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAppData() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [completions, setCompletions] = useState<GoalCompletion[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [isLoaded, setIsLoaded] = useState(false);
  const [useLocalStorage, setUseLocalStorage] = useState(false);

  // ── Initial load ────────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      const [apiGoals, apiCompletions, apiRewards] = await Promise.all([
        apiFetch<Goal[]>('/api/goals'),
        apiFetch<GoalCompletion[]>('/api/completions'),
        apiFetch<Reward[]>('/api/rewards'),
      ]);

      if (apiGoals !== null) {
        // API available → use it
        setGoals(apiGoals);
        setCompletions(apiCompletions ?? []);
        setRewards(apiRewards ?? []);
        setUseLocalStorage(false);
      } else {
        // Fallback to localStorage
        setGoals(lsGet<Goal[]>(LS_KEYS.goals, []));
        setCompletions(lsGet<GoalCompletion[]>(LS_KEYS.completions, []));
        setRewards(lsGet<Reward[]>(LS_KEYS.rewards, []));
        setUseLocalStorage(true);
      }
      setIsLoaded(true);
    }
    load();
  }, []);

  // ── Goals ───────────────────────────────────────────────────────────────────

  const addGoal = useCallback(
    async (goalData: Omit<Goal, 'id' | 'createdAt' | 'isActive'>) => {
      const payload = { ...goalData, isActive: true };

      if (useLocalStorage) {
        const newGoal: Goal = { ...payload, id: uuidv4(), createdAt: new Date().toISOString() };
        const next = [...goals, newGoal];
        setGoals(next);
        lsSet(LS_KEYS.goals, next);
        return newGoal;
      }

      const newGoal = await apiFetch<Goal>('/api/goals', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (newGoal) setGoals((prev) => [...prev, newGoal]);
      return newGoal;
    },
    [goals, useLocalStorage]
  );

  const deleteGoal = useCallback(
    async (id: string) => {
      if (useLocalStorage) {
        const next = goals.filter((g) => g.id !== id);
        setGoals(next);
        lsSet(LS_KEYS.goals, next);
        const nextC = completions.filter((c) => c.goalId !== id);
        setCompletions(nextC);
        lsSet(LS_KEYS.completions, nextC);
        return;
      }
      await apiFetch('/api/goals', { method: 'DELETE', body: JSON.stringify({ id }) });
      setGoals((prev) => prev.filter((g) => g.id !== id));
      setCompletions((prev) => prev.filter((c) => c.goalId !== id));
    },
    [goals, completions, useLocalStorage]
  );

  // ── Completions ─────────────────────────────────────────────────────────────

  const toggleCompletion = useCallback(
    async (goal: Goal) => {
      const periodKey = getCurrentPeriodKey(goal.repeatType);
      const existing = completions.find(
        (c) => c.goalId === goal.id && c.period === periodKey
      );

      if (existing) {
        // Undo completion
        if (useLocalStorage) {
          const next = completions.filter((c) => c.id !== existing.id);
          setCompletions(next);
          lsSet(LS_KEYS.completions, next);
          return;
        }
        await apiFetch('/api/completions', {
          method: 'DELETE',
          body: JSON.stringify({ id: existing.id }),
        });
        setCompletions((prev) => prev.filter((c) => c.id !== existing.id));
      } else {
        // Mark complete
        const payload = { goalId: goal.id, memberId: goal.memberId, period: periodKey };
        if (useLocalStorage) {
          const newC: GoalCompletion = {
            ...payload,
            id: uuidv4(),
            completedAt: new Date().toISOString(),
          };
          const next = [...completions, newC];
          setCompletions(next);
          lsSet(LS_KEYS.completions, next);
          return;
        }
        const newC = await apiFetch<GoalCompletion>('/api/completions', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        if (newC) setCompletions((prev) => [...prev, newC]);
      }
    },
    [completions, useLocalStorage]
  );

  const isGoalCompleted = useCallback(
    (goal: Goal): boolean => {
      const periodKey = getCurrentPeriodKey(goal.repeatType);
      return completions.some((c) => c.goalId === goal.id && c.period === periodKey);
    },
    [completions]
  );

  // ── Rewards ─────────────────────────────────────────────────────────────────

  const addReward = useCallback(
    async (rewardData: Omit<Reward, 'id' | 'createdAt'>) => {
      if (useLocalStorage) {
        const newR: Reward = { ...rewardData, id: uuidv4(), createdAt: new Date().toISOString() };
        const next = [...rewards, newR];
        setRewards(next);
        lsSet(LS_KEYS.rewards, next);
        return newR;
      }
      const newR = await apiFetch<Reward>('/api/rewards', {
        method: 'POST',
        body: JSON.stringify(rewardData),
      });
      if (newR) setRewards((prev) => [...prev, newR]);
      return newR;
    },
    [rewards, useLocalStorage]
  );

  const updateReward = useCallback(
    async (id: string, updates: Partial<Reward>) => {
      if (useLocalStorage) {
        const next = rewards.map((r) => (r.id === id ? { ...r, ...updates } : r));
        setRewards(next);
        lsSet(LS_KEYS.rewards, next);
        return;
      }
      const updated = await apiFetch<Reward>('/api/rewards', {
        method: 'PATCH',
        body: JSON.stringify({ id, ...updates }),
      });
      if (updated) setRewards((prev) => prev.map((r) => (r.id === id ? updated : r)));
    },
    [rewards, useLocalStorage]
  );

  const deleteReward = useCallback(
    async (id: string) => {
      if (useLocalStorage) {
        const next = rewards.filter((r) => r.id !== id);
        setRewards(next);
        lsSet(LS_KEYS.rewards, next);
        return;
      }
      await apiFetch('/api/rewards', { method: 'DELETE', body: JSON.stringify({ id }) });
      setRewards((prev) => prev.filter((r) => r.id !== id));
    },
    [rewards, useLocalStorage]
  );

  // ── Stats ───────────────────────────────────────────────────────────────────

  const getStats = useCallback(
    (mode: ViewMode): FamilyStats => {
      const visibleGoals = goals.filter((g) => g.isActive && isGoalInView(g, mode));

      const memberStats: MemberStats[] = DEFAULT_MEMBERS.map((m) => {
        const memberGoals = visibleGoals.filter((g) => g.memberId === m.id);
        const completedGoals = memberGoals.filter((g) => {
          const periodKey = getCurrentPeriodKey(g.repeatType);
          return completions.some((c) => c.goalId === g.id && c.period === periodKey);
        });
        const percentage =
          memberGoals.length === 0
            ? 0
            : Math.round((completedGoals.length / memberGoals.length) * 100);
        return {
          memberId: m.id,
          totalGoals: memberGoals.length,
          completedGoals: completedGoals.length,
          percentage,
        };
      });

      const totalGoals = memberStats.reduce((s, m) => s + m.totalGoals, 0);
      const completedGoals = memberStats.reduce((s, m) => s + m.completedGoals, 0);
      const percentage =
        totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);

      return { totalGoals, completedGoals, percentage, memberStats };
    },
    [goals, completions]
  );

  // Goals filtered for a specific member in the current view
  const getMemberGoals = useCallback(
    (memberId: string, mode: ViewMode) =>
      goals.filter(
        (g) => g.memberId === memberId && g.isActive && isGoalInView(g, mode)
      ),
    [goals]
  );

  return {
    goals,
    completions,
    rewards,
    viewMode,
    setViewMode,
    isLoaded,
    useLocalStorage,
    members: DEFAULT_MEMBERS,
    // Actions
    addGoal,
    deleteGoal,
    toggleCompletion,
    isGoalCompleted,
    addReward,
    updateReward,
    deleteReward,
    // Computed
    getStats,
    getMemberGoals,
  };
}
