'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useAppData } from '@/hooks/useAppData';
import MemberCard from '@/components/MemberCard';
import GoalModal from '@/components/GoalModal';
import RewardModal from '@/components/RewardModal';
import NoteBoard from '@/components/NoteBoard';
import FamilyTree from '@/components/FamilyTree';
import ProgressGrid from '@/components/ProgressGrid';
import FamilyMissionCard from '@/components/FamilyMissionCard';
import CharacterPicker from '@/components/CharacterPicker';
import FamilyMissionModal from '@/components/FamilyMissionModal';
import GoalCheckEffect from '@/components/GoalCheckEffect';
import type { ViewMode, Goal, Reward, Member, FamilyMission } from '@/types';
import { getEncouragementMessage } from '@/lib/constants';

const CelebrationEffect = dynamic(() => import('@/components/CelebrationEffect'), { ssr: false });

const VIEW_TABS: { key: ViewMode; label: string }[] = [
  { key: 'daily', label: '오늘 📅' },
  { key: 'weekly', label: '이번 주 📆' },
  { key: 'monthly', label: '이번 달 🗓️' },
];

const SYNC_LABEL: Record<string, string> = {
  idle: '☁️ 저장', saving: '저장 중...', saved: '✅ 저장됨!', error: '❌ 오류', loading: '불러오는 중...',
};

export default function Home() {
  const {
    members, goals, completions, rewards, notes,
    selectedDate,
    viewMode, setViewMode, isLoaded,
    navigatePeriod, goToToday, isCurrentPeriod, periodLabel,
    cloudEnabled, syncStatus, syncToCloud, refreshFromCloud,
    addGoal, updateGoal, deleteGoal,
    toggleCompletion, isGoalCompleted,
    addReward, updateReward, deleteReward,
    missions, addMission, updateMission, deleteMission, contributeMission, undoContribution,
    updateMemberIcon,
    addNote, deleteNote,
    getStats, getMemberGoals,
  } = useAppData();

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [defaultMemberId, setDefaultMemberId] = useState<string | undefined>();
  const [defaultRepeatType, setDefaultRepeatType] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const [pickingMember, setPickingMember] = useState<Member | null>(null);
  const [editingReward, setEditingReward] = useState<Reward | undefined>();
  const [showMissionModal, setShowMissionModal] = useState(false);
  const [editingMission, setEditingMission] = useState<FamilyMission | undefined>();
  const [showCelebration, setShowCelebration] = useState(false);
  const [checkEffectMember, setCheckEffectMember] = useState<Member | null>(null);
  const [encouragement, setEncouragement] = useState('');
  const [prevPercentage, setPrevPercentage] = useState<number | null>(null);

  const stats = getStats(viewMode);
  const currentReward = rewards.find((r) => r.period === viewMode);
  const activeMission = missions.find((m) => m.isActive);

  useEffect(() => {
    setEncouragement(getEncouragementMessage(stats.percentage));
  }, [stats.percentage]);

  useEffect(() => {
    if (!isLoaded) return;
    if (stats.totalGoals > 0 && stats.percentage === 100 && prevPercentage !== 100) {
      setShowCelebration(true);
    }
    setPrevPercentage(stats.percentage);
  }, [stats.percentage, stats.totalGoals, isLoaded, prevPercentage]);

  function openAddGoal(memberId?: string) {
    setEditingGoal(undefined);
    setDefaultMemberId(memberId);
    setDefaultRepeatType(viewMode);
    setShowGoalModal(true);
  }

  function openEditGoal(goal: Goal) {
    setEditingGoal(goal);
    setDefaultRepeatType(goal.repeatType);
    setShowGoalModal(true);
  }

  const handleSaveGoal = useCallback(
    async (data: Omit<Goal, 'id' | 'createdAt' | 'isActive'>) => {
      if (editingGoal) updateGoal(editingGoal.id, data);
      else addGoal(data);
      setEditingGoal(undefined);
    },
    [addGoal, updateGoal, editingGoal]
  );

  const handleSaveReward = useCallback(
    async (data: Omit<Reward, 'id' | 'createdAt'>) => {
      if (editingReward) updateReward(editingReward.id, data);
      else addReward(data);
      setEditingReward(undefined);
    },
    [addReward, updateReward, editingReward]
  );

  const progressColor =
    stats.percentage === 100 ? '#22c55e'
    : stats.percentage >= 70 ? '#3b82f6'
    : stats.percentage >= 40 ? '#f59e0b'
    : '#f87171';

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-bounce-slow mb-4">🌟</div>
          <p className="text-gray-500 font-medium">하임이네 보드 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md shadow-card">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2">
          <span className="text-3xl">🌟</span>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-extrabold text-gray-800 truncate leading-tight">하임이네 목표 달성 보드</h1>
            <p className="text-xs text-gray-500 truncate">{encouragement}</p>
          </div>
          {cloudEnabled && (
            <button onClick={refreshFromCloud} disabled={syncStatus === 'saving' || syncStatus === 'loading'}
              className="flex-shrink-0 px-3 py-2 rounded-2xl text-sm font-bold transition-all disabled:opacity-60 bg-gray-100 text-gray-600 hover:bg-gray-200"
              title="최신 데이터 불러오기">
              {syncStatus === 'loading' ? '⏳' : '🔄'}
            </button>
          )}
          {cloudEnabled && (
            <button onClick={syncToCloud} disabled={syncStatus === 'saving' || syncStatus === 'loading'}
              className={`flex-shrink-0 px-3 py-2 rounded-2xl text-sm font-bold transition-all disabled:opacity-60 ${
                syncStatus === 'saved' ? 'bg-green-100 text-green-700'
                : syncStatus === 'error' ? 'bg-red-100 text-red-700'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}>
              {SYNC_LABEL[syncStatus] ?? '☁️ 저장'}
            </button>
          )}

        </div>

        {cloudEnabled && syncStatus === 'idle' && (
          <p className="text-center text-xs text-gray-400 pb-1">변경 후 ☁️ 저장을 눌러야 구글 시트에 반영돼요</p>
        )}

        <div className="max-w-4xl mx-auto px-4 pb-2">
          <div className="grid grid-cols-3 gap-1.5 bg-gray-100 rounded-2xl p-1">
            {VIEW_TABS.map((tab) => (
              <button key={tab.key} onClick={() => setViewMode(tab.key)}
                className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                  viewMode === tab.key ? 'bg-white shadow-card text-gray-800' : 'text-gray-500 hover:text-gray-700'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 pb-3 flex items-center justify-between gap-2">
          <button onClick={() => navigatePeriod('prev')}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors text-lg">
            ‹
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">{periodLabel}</span>
            {!isCurrentPeriod && (
              <button onClick={goToToday}
                className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium hover:bg-blue-200 transition-colors">
                오늘
              </button>
            )}
          </div>
          <button onClick={() => navigatePeriod('next')}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors text-lg">
            ›
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-5 space-y-5">
        <NoteBoard members={members} notes={notes} onAdd={addNote} onDelete={deleteNote} />
        <div className="rounded-3xl overflow-hidden shadow-soft bg-white">
          <div className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="font-bold text-gray-800 text-base">🏠 우리 가족 달성률</h2>
                <p className="text-sm text-gray-500 mt-0.5">전체 {stats.completedGoals}/{stats.totalGoals}개 완료</p>
              </div>
              <div className="text-3xl font-extrabold" style={{ color: progressColor }}>{stats.percentage}%</div>
            </div>
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${stats.percentage}%`, backgroundColor: progressColor }} />
            </div>
            <div className="grid grid-cols-5 gap-2 mt-4">
              {members.map((m) => {
                const mStat = stats.memberStats.find((s) => s.memberId === m.id);
                const pct = mStat?.percentage ?? 0;
                return (
                  <div key={m.id} className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: m.bgColor }}>{m.icon}</div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: m.color }} />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-soft bg-white">
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-800 text-base">🏆 보상</h2>
              <button onClick={() => { setEditingReward(currentReward); setShowRewardModal(true); }}
                className="text-sm px-3 py-1.5 rounded-xl bg-yellow-50 text-yellow-700 font-medium hover:bg-yellow-100 transition-colors">
                {currentReward ? '✏️ 수정' : '+ 보상 설정'}
              </button>
            </div>
            {currentReward ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">목표 달성률</span>
                  <span className="font-bold" style={{ color: stats.percentage >= currentReward.targetPercentage ? '#22c55e' : '#f59e0b' }}>
                    {stats.percentage}% / {currentReward.targetPercentage}%
                  </span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700 bg-yellow-400"
                    style={{ width: `${Math.min(100, (stats.percentage / currentReward.targetPercentage) * 100)}%` }} />
                </div>
                <div className="mt-2 p-3 bg-yellow-50 rounded-2xl">
                  <p className="text-sm text-yellow-700 font-medium">🎁 달성 보상</p>
                  <p className="text-gray-800 font-bold mt-1">{currentReward.description}</p>
                </div>
                {stats.percentage >= currentReward.targetPercentage && (
                  <div className="p-3 bg-green-50 rounded-2xl border-2 border-green-200 text-center">
                    <p className="text-green-700 font-bold">🎉 보상 달성! 축하해요!</p>
                  </div>
                )}
                <button onClick={() => deleteReward(currentReward.id)}
                  className="text-xs text-gray-400 hover:text-red-400 transition-colors">
                  보상 삭제
                </button>
              </div>
            ) : (
              <p className="text-gray-400 text-sm text-center py-4">보상을 설정하면 가족이 더 신나게 목표를 달성해요! 🎯</p>
            )}
          </div>
        </div>

        <FamilyTree completions={completions} members={members} />

        {(viewMode === 'weekly' || viewMode === 'monthly') && (
          <ProgressGrid
            mode={viewMode}
            selectedDate={selectedDate}
            goals={goals}
            completions={completions}
            members={members}
          />
        )}

        <FamilyMissionCard
          mission={activeMission ?? null}
          members={members}
          onAdd={() => { setEditingMission(undefined); setShowMissionModal(true); }}
          onEdit={(m) => { setEditingMission(m); setShowMissionModal(true); }}
          onDelete={(id) => deleteMission(id)}
          onContribute={(missionId, memberId) => contributeMission(missionId, memberId)}
          onUndo={(missionId, memberId) => undoContribution(missionId, memberId)}
        />

        <div>
          <h2 className="font-bold text-gray-700 text-sm mb-3 px-1">👨‍👩‍👧‍👦 가족별 목표</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {members.map((member) => {
              const memberGoals = getMemberGoals(member.id, viewMode);
              const mStat = stats.memberStats.find((s) => s.memberId === member.id);
              return (
                <MemberCard
                  key={member.id}
                  member={member}
                  goals={memberGoals}
                  percentage={mStat?.percentage ?? 0}
                  completedCount={mStat?.completedGoals ?? 0}
                  viewMode={viewMode}
                  readOnly={false}
                  isGoalCompleted={isGoalCompleted}
                  onToggleGoal={async (g) => {
                    const wasDone = isGoalCompleted(g);
                    toggleCompletion(g);
                    if (!wasDone) setCheckEffectMember(member);
                  }}
                  onEditIcon={() => setPickingMember(member)}
                  onEditGoal={(g) => openEditGoal(g)}
                  onDeleteGoal={async (id) => deleteGoal(id)}
                  onAddGoal={(id) => openAddGoal(id)}
                />
              );
            })}
          </div>
        </div>

      </main>

      {showGoalModal && (
        <GoalModal members={members} defaultMemberId={defaultMemberId} defaultRepeatType={defaultRepeatType}
          existingGoal={editingGoal}
          onClose={() => { setShowGoalModal(false); setEditingGoal(undefined); }} onSave={handleSaveGoal} />
      )}
      {showRewardModal && (
        <RewardModal existing={editingReward}
          onClose={() => { setShowRewardModal(false); setEditingReward(undefined); }}
          onSave={handleSaveReward} />
      )}
      {showMissionModal && (
        <FamilyMissionModal
          existing={editingMission}
          onClose={() => { setShowMissionModal(false); setEditingMission(undefined); }}
          onSave={(data) => {
            if (editingMission) updateMission(editingMission.id, data);
            else addMission(data);
            setEditingMission(undefined);
          }}
        />
      )}
      {pickingMember && (
        <CharacterPicker
          member={pickingMember}
          onClose={() => setPickingMember(null)}
          onSelect={(icon) => updateMemberIcon(pickingMember.id, icon)}
        />
      )}
      {showCelebration && <CelebrationEffect onClose={() => setShowCelebration(false)} />}
      {checkEffectMember && (
        <GoalCheckEffect
          memberIcon={checkEffectMember.icon}
          memberColor={checkEffectMember.color}
          memberName={checkEffectMember.name}
          onDone={() => setCheckEffectMember(null)}
        />
      )}
    </div>
  );
}
