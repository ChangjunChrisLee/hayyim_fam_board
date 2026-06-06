'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Goal, GoalCompletion, Reward, ViewMode, FamilyStats, MemberStats } from '@/types';
import { DEFAULT_MEMBERS, getCurrentPeriodKey, isGoalInView } from '@/lib/constants';
import { loadFromCloud, saveToCloud, isCloudEnabled, type DataStore } from '@/lib/clientStorage';

// ── localStorage helpers ──────────────────────────────────────────────────────

const LS = { goals: 'hfb_goals', completions: 'hfb_completions', rewards: 'hfb_rewards' };

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function lsSetAll(goals: Goal[], completions: GoalCompletion[], rewards: Reward[]) {
  try {
    localStorage.setItem(LS.goals, JSON.stringify(goals));
    localStorage.setItem(LS.completions, JSON.stringify(completions));
    localStorage.setItem(LS.rewards, JSON.stringify(rewards));
  } catch {}
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error' | 'loading';

export function useAppData() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [completions, setCompletions] = useState<GoalCompletion[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  const goalsRef = useRef(goals);
  const completionsRef = useRef(completions);
  const rewardsRef = useRef(rewards);
  goalsRef.current = goals;
  completionsRef.current = completions;
  rewardsRef.current = rewards;

  // ── Initial load ─────────────────────────────────────────────────────────────

  useEffect(() => {
    async function load() {
      setSyncStatus('loading');
      const cloud = isCloudEnabled() ? await loadFromCloud() : null;

      if (cloud) {
        const g = (cloud.goals ?? []) as Goal[];
        const c = (cloud.completions ?? []) as GoalCompletion[];
        const r = (cloud.rewards ?? []) as Reward[];
        setGoals(g);
        setCompletions(c);
        setRewards(r);
        lsSetAll(g, c, r);
      } else {
        setGoals(lsGet<Goal[]>(LS.goals, []));
        setCompletions(lsGet<GoalCompletion[]>(LS.completions, []));
        setRewards(lsGet<Reward[]>(LS.rewards, []));
      }

      setSyncStatus('idle');
      setIsLoaded(true);
    }
    load();
  }, []);

  // ── Cloud sync ────────────────────────────────────────────────────────────────

  const syncToCloud = useCallback(async () => {
    if (!isCloudEnabled()) return;
    setSyncStatus('saving');
    try {
      const data: DataStore = {
        goals: goalsRef.current,
        completions: completionsRef.current,
        rewards: rewardsRef.current,
      };
      await saveToCloud(data);
      setSyncStatus('saved');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  }, []);

  function update(newGoals: Goal[], newCompletions: GoalCompletion[], newRewards: Reward[]) {
    setGoals(newGoals);
    setCompletions(newCompletions);
    setRewards(newRewards);
    lsSetAll(newGoals, newCompletions, newRewards);
  }

  // ── Goals ─────────────────────────────────────────────────────────────────────

  const addGoal = useCallback((goalData: Omit<Goal, 'id' | 'createdAt' | 'isActive'>) => {
    const newGoal: Goal = { ...goalData, id: uuidv4(), createdAt: new Date().toISOString(), isActive: true };
    update([...goalsRef.current, newGoal], completionsRef.current, rewardsRef.current);
    return newGoal;
  }, []);

  const deleteGoal = useCallback((id: string) => {
    update(
      goalsRef.current.filter((g) => g.id !== id),
      completionsRef.current.filter((c) => c.goalId !== id),
      rewardsRef.current
    );
  }, []);

  // ── Completions ───────────────────────────────────────────────────────────────

  const toggleCompletion = useCallback((goal: Goal) => {
    const periodKey = getCurrentPeriodKey(goal.repeatType);
    const existing = completionsRef.current.find(
      (c) => c.goalId === goal.id && c.period === periodKey
    );
    if (existing) {
      update(goalsRef.current, completionsRef.current.filter((c) => c.id !== existing.id), rewardsRef.current);
    } else {
      const newC: GoalCompletion = {
        id: uuidv4(), goalId: goal.id, memberId: goal.memberId,
        completedAt: new Date().toISOString(), period: periodKey,
      };
      update(goalsRef.current, [...completionsRef.current, newC], rewardsRef.current);
    }
  }, []);

  const isGoalCompleted = useCallback((goal: Goal): boolean => {
    const periodKey = getCurrentPeriodKey(goal.repeatType);
    return completionsRef.current.some((c) => c.goalId === goal.id && c.period === periodKey);
  }, []);

  // ── Rewards ───────────────────────────────────────────────────────────────────

  const addReward = useCallback((rewardData: Omit<Reward, 'id' | 'createdAt'>) => {
    const newR: Reward = { ...rewardData, id: uuidv4(), createdAt: new Date().toISOString() };
    update(goalsRef.current, completionsRef.current, [...rewardsRef.current, newR]);
    return newR;
  }, []);

  const updateReward = useCallback((id: string, updates: Partial<Reward>) => {
    update(goalsRef.current, completionsRef.current,
      rewardsRef.current.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const deleteReward = useCallback((id: string) => {
    update(goalsRef.current, completionsRef.current, rewardsRef.current.filter((r) => r.id !== id));
  }, []);

  // ── Stats ─────────────────────────────────────────────────────────────────────

  const getStats = useCallback((mode: ViewMode): FamilyStats => {
    const visibleGoals = goals.filter((g) => g.isActive && isGoalInView(g, mode));
    const memberStats: MemberStats[] = DEFAULT_MEMBERS.map((m) => {
      const memberGoals = visibleGoals.filter((g) => g.memberId === m.id);
      const completedGoals = memberGoals.filter((g) => {
        const periodKey = getCurrentPeriodKey(g.repeatType);
        return completions.some((c) => c.goalId === g.id && c.period === periodKey);
      });
      const percentage = memberGoals.length === 0 ? 0
        : Math.round((completedGoals.length / memberGoals.length) * 100);
      return { memberId: m.id, totalGoals: memberGoals.length, completedGoals: completedGoals.length, percentage };
    });
    const totalGoals = memberStats.reduce((s, m) => s + m.totalGoals, 0);
    const completedGoals = memberStats.reduce((s, m) => s + m.completedGoals, 0);
    const percentage = totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);
    return { totalGoals, completedGoals, percentage, memberStats };
  }, [goals, completions]);

  const getMemberGoals = useCallback(
    (memberId: string, mode: ViewMode) =>
      goals.filter((g) => g.memberId === memberId && g.isActive && isGoalInView(g, mode)),
    [goals]
  );

  return {
    goals, completions, rewards,
    viewMode, setViewMode, isLoaded,
    cloudEnabled: isCloudEnabled(),
    syncStatus, syncToCloud,
    members: DEFAULT_MEMBERS,
    addGoal, deleteGoal,
    toggleCompletion, isGoalCompleted,
    addReward, updateReward, deleteReward,
    getStats, getMemberGoals,
  };
}
