'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Goal, GoalCompletion, Reward, Note, ViewMode, FamilyStats, MemberStats, FamilyMission } from '@/types';
import { DEFAULT_MEMBERS, getCurrentPeriodKey, getPeriodKey, getPeriodLabel, isGoalInView } from '@/lib/constants';
import { loadFromCloud, saveToCloud, isCloudEnabled, type DataStore } from '@/lib/clientStorage';

const LS = { goals: 'hfb_goals', completions: 'hfb_completions', rewards: 'hfb_rewards', notes: 'hfb_notes', missions: 'hfb_missions' };

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function lsSetAll(goals: Goal[], completions: GoalCompletion[], rewards: Reward[], notes: Note[] = [], missions: FamilyMission[] = []) {
  try {
    localStorage.setItem(LS.goals, JSON.stringify(goals));
    localStorage.setItem(LS.completions, JSON.stringify(completions));
    localStorage.setItem(LS.rewards, JSON.stringify(rewards));
    localStorage.setItem(LS.notes, JSON.stringify(notes));
    localStorage.setItem(LS.missions, JSON.stringify(missions));
  } catch {}
}

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'error' | 'loading';

export function useAppData() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [completions, setCompletions] = useState<GoalCompletion[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [missions, setMissions] = useState<FamilyMission[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  const goalsRef = useRef(goals);
  const completionsRef = useRef(completions);
  const rewardsRef = useRef(rewards);
  const notesRef = useRef(notes);
  const missionsRef = useRef(missions);
  const selectedDateRef = useRef(selectedDate);
  goalsRef.current = goals;
  completionsRef.current = completions;
  rewardsRef.current = rewards;
  notesRef.current = notes;
  missionsRef.current = missions;
  selectedDateRef.current = selectedDate;

  useEffect(() => {
    async function load() {
      setSyncStatus('loading');
      const cloud = isCloudEnabled() ? await loadFromCloud() : null;
      if (cloud) {
        const g = (cloud.goals ?? []) as Goal[];
        const c = (cloud.completions ?? []) as GoalCompletion[];
        const r = (cloud.rewards ?? []) as Reward[];
        const n = (cloud.notes ?? []) as Note[];
        const ms = (cloud.missions ?? []) as FamilyMission[];
        setGoals(g); setCompletions(c); setRewards(r); setNotes(n); setMissions(ms);
        lsSetAll(g, c, r, n, ms);
      } else {
        setGoals(lsGet<Goal[]>(LS.goals, []));
        setCompletions(lsGet<GoalCompletion[]>(LS.completions, []));
        setRewards(lsGet<Reward[]>(LS.rewards, []));
        setNotes(lsGet<Note[]>(LS.notes, []));
        setMissions(lsGet<FamilyMission[]>(LS.missions, []));
      }
      setSyncStatus('idle');
      setIsLoaded(true);
    }
    load();
  }, []);

  const syncToCloud = useCallback(async () => {
    if (!isCloudEnabled()) return;
    setSyncStatus('saving');
    try {
      const data: DataStore = {
        goals: goalsRef.current,
        completions: completionsRef.current,
        rewards: rewardsRef.current,
        notes: notesRef.current,
        missions: missionsRef.current,
      };
      await saveToCloud(data);
      setSyncStatus('saved');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  }, []);

  function update(newGoals: Goal[], newCompletions: GoalCompletion[], newRewards: Reward[], newNotes?: Note[], newMissions?: FamilyMission[]) {
    setGoals(newGoals);
    setCompletions(newCompletions);
    setRewards(newRewards);
    if (newNotes !== undefined) setNotes(newNotes);
    if (newMissions !== undefined) setMissions(newMissions);
    lsSetAll(newGoals, newCompletions, newRewards, newNotes ?? notesRef.current, newMissions ?? missionsRef.current);
  }

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

  const toggleCompletion = useCallback((goal: Goal) => {
    const periodKey = getPeriodKey(selectedDateRef.current, goal.repeatType);
    const existing = completionsRef.current.find((c) => c.goalId === goal.id && c.period === periodKey);
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
    const periodKey = getPeriodKey(selectedDateRef.current, goal.repeatType);
    return completionsRef.current.some((c) => c.goalId === goal.id && c.period === periodKey);
  }, []);

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

  const getStats = useCallback((mode: ViewMode): FamilyStats => {
    const visibleGoals = goals.filter((g) => g.isActive && isGoalInView(g, mode));
    const memberStats: MemberStats[] = DEFAULT_MEMBERS.map((m) => {
      const memberGoals = visibleGoals.filter((g) => g.memberId === m.id);
      const completedGoals = memberGoals.filter((g) => {
        const periodKey = getPeriodKey(selectedDate, g.repeatType);
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
  }, [goals, completions, selectedDate]);

  const getMemberGoals = useCallback(
    (memberId: string, mode: ViewMode) =>
      goals.filter((g) => g.memberId === memberId && g.isActive && isGoalInView(g, mode)),
    [goals]
  );

  const navigatePeriod = useCallback((dir: 'prev' | 'next') => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      const delta = dir === 'prev' ? -1 : 1;
      if (viewMode === 'daily') next.setDate(prev.getDate() + delta);
      else if (viewMode === 'weekly') next.setDate(prev.getDate() + delta * 7);
      else next.setMonth(prev.getMonth() + delta);
      return next;
    });
  }, [viewMode]);

  const goToToday = useCallback(() => setSelectedDate(new Date()), []);

  const isCurrentPeriod = (() => {
    const now = new Date();
    if (viewMode === 'daily') return selectedDate.toDateString() === now.toDateString();
    if (viewMode === 'weekly') return getPeriodKey(selectedDate, 'weekly') === getPeriodKey(now, 'weekly');
    return selectedDate.getFullYear() === now.getFullYear() && selectedDate.getMonth() === now.getMonth();
  })();

  const periodLabel = getPeriodLabel(selectedDate, viewMode);

  const addNote = useCallback((memberId: string, content: string) => {
    const newNote: Note = { id: uuidv4(), memberId, content, createdAt: new Date().toISOString() };
    const updated = [...notesRef.current, newNote];
    setNotes(updated);
    lsSetAll(goalsRef.current, completionsRef.current, rewardsRef.current, updated);
  }, []);


  const addMission = useCallback((data: Omit<FamilyMission, 'id' | 'createdAt' | 'isActive' | 'contributions'>) => {
    const newM: FamilyMission = { ...data, id: uuidv4(), createdAt: new Date().toISOString(), isActive: true, contributions: [] };
    const updated = [...missionsRef.current, newM];
    setMissions(updated);
    lsSetAll(goalsRef.current, completionsRef.current, rewardsRef.current, notesRef.current, updated);
    return newM;
  }, []);

  const updateMission = useCallback((id: string, updates: Partial<FamilyMission>) => {
    const updated = missionsRef.current.map((m) => m.id === id ? { ...m, ...updates } : m);
    setMissions(updated);
    lsSetAll(goalsRef.current, completionsRef.current, rewardsRef.current, notesRef.current, updated);
  }, []);

  const deleteMission = useCallback((id: string) => {
    const updated = missionsRef.current.filter((m) => m.id !== id);
    setMissions(updated);
    lsSetAll(goalsRef.current, completionsRef.current, rewardsRef.current, notesRef.current, updated);
  }, []);


  const contributeMission = useCallback((missionId: string, memberId: string) => {
    const updated = missionsRef.current.map((m) => {
      if (m.id !== missionId) return m;
      return { ...m, contributions: [...m.contributions, { memberId, createdAt: new Date().toISOString() }] };
    });
    setMissions(updated);
    lsSetAll(goalsRef.current, completionsRef.current, rewardsRef.current, notesRef.current, updated);
  }, []);

  const undoContribution = useCallback((missionId: string, memberId: string) => {
    const updated = missionsRef.current.map((m) => {
      if (m.id !== missionId) return m;
      const contributions = [...m.contributions];
      // remove last contribution of this member
      const idx = contributions.map((c) => c.memberId).lastIndexOf(memberId);
      if (idx !== -1) contributions.splice(idx, 1);
      return { ...m, contributions };
    });
    setMissions(updated);
    lsSetAll(goalsRef.current, completionsRef.current, rewardsRef.current, notesRef.current, updated);
  }, []);

  const deleteNote = useCallback((id: string) => {
    const updated = notesRef.current.filter((n) => n.id !== id);
    setNotes(updated);
    lsSetAll(goalsRef.current, completionsRef.current, rewardsRef.current, updated);
  }, []);

  return {
    goals, completions, rewards, notes,
    viewMode, setViewMode, isLoaded,
    selectedDate, navigatePeriod, goToToday, isCurrentPeriod, periodLabel,
    cloudEnabled: isCloudEnabled(),
    syncStatus, syncToCloud,
    members: DEFAULT_MEMBERS,
    addGoal, deleteGoal,
    toggleCompletion, isGoalCompleted,
    addReward, updateReward, deleteReward,
    missions, addMission, updateMission, deleteMission, contributeMission, undoContribution,
    addNote, deleteNote,
    getStats, getMemberGoals,
  };
}
