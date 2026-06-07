'use client';

import { useState } from 'react';
import type { FamilyMission, Member, MissionPeriod } from '@/types';

interface Props {
  mission: FamilyMission | null;
  members: Member[];
  onAdd: () => void;
  onEdit: (mission: FamilyMission) => void;
  onDelete: (id: string) => void;
  onContribute: (missionId: string, memberId: string) => void;
  onUndo: (missionId: string, memberId: string) => void;
}

const PERIOD_LABEL: Record<MissionPeriod, string> = {
  daily: '오늘',
  weekly: '이번 주',
  monthly: '이번 달',
  alltime: '전체 기간',
};

function getContributionsForPeriod(mission: FamilyMission): number {
  if (mission.period === 'alltime') return mission.contributions.length;
  const now = new Date();
  return mission.contributions.filter((c) => {
    const d = new Date(c.createdAt);
    if (mission.period === 'daily') return d.toDateString() === now.toDateString();
    if (mission.period === 'weekly') {
      const start = new Date(now);
      start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      start.setHours(0, 0, 0, 0);
      return d >= start;
    }
    if (mission.period === 'monthly') {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }
    return false;
  }).length;
}

function getMemberContributions(mission: FamilyMission, memberId: string): number {
  if (mission.period === 'alltime') {
    return mission.contributions.filter((c) => c.memberId === memberId).length;
  }
  const now = new Date();
  return mission.contributions.filter((c) => {
    if (c.memberId !== memberId) return false;
    const d = new Date(c.createdAt);
    if (mission.period === 'daily') return d.toDateString() === now.toDateString();
    if (mission.period === 'weekly') {
      const start = new Date(now);
      start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      start.setHours(0, 0, 0, 0);
      return d >= start;
    }
    if (mission.period === 'monthly') {
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }
    return false;
  }).length;
}

export default function FamilyMissionCard({ mission, members, onAdd, onEdit, onDelete, onContribute, onUndo }: Props) {
  const [pressing, setPressing] = useState<string | null>(null);
  const [floats, setFloats] = useState<{ id: number; memberId: string }[]>([]);
  let floatId = 0;

  if (!mission) {
    return (
      <div className="rounded-3xl overflow-hidden shadow-soft bg-white">
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800 text-base">🎯 가족 합산 미션</h2>
            <button onClick={onAdd}
              className="text-sm px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 font-medium hover:bg-orange-100 transition-colors">
              + 미션 만들기
            </button>
          </div>
          <p className="text-gray-400 text-sm text-center py-4">
            가족이 함께 달성하는 합산 미션을 만들어봐요! 🏆<br />
            <span className="text-xs">예: 이번 주 가족 합계 30개 달성!</span>
          </p>
        </div>
      </div>
    );
  }

  const total = getContributionsForPeriod(mission);
  const pct = Math.min(100, Math.round((total / mission.targetCount) * 100));
  const achieved = total >= mission.targetCount;

  function handleContribute(memberId: string) {
    if (!mission || achieved) return;
    setPressing(memberId);
    setTimeout(() => setPressing(null), 200);

    const fid = floatId++;
    setFloats((prev) => [...prev, { id: fid, memberId }]);
    setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== fid)), 800);

    onContribute(mission.id, memberId);
  }

  return (
    <div className="rounded-3xl overflow-hidden shadow-soft bg-white">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800 text-base">🎯 가족 합산 미션</h2>
          <button onClick={() => onEdit(mission)}
            className="text-sm px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 font-medium hover:bg-orange-100 transition-colors">
            ✏️ 수정
          </button>
        </div>

        {/* Mission title */}
        <div className="mb-4 p-3 rounded-2xl bg-orange-50">
          <p className="font-bold text-gray-800 text-base">{mission.title}</p>
          <p className="text-xs text-orange-600 mt-0.5">📅 {PERIOD_LABEL[mission.period]} 기준</p>
        </div>

        {/* Progress numbers */}
        <div className="flex items-end justify-between mb-2">
          <span className="text-sm text-gray-500">달성 현황</span>
          <div className="text-right">
            <span className="text-2xl font-extrabold" style={{ color: achieved ? '#22c55e' : '#f97316' }}>
              {total}
            </span>
            <span className="text-sm text-gray-400 font-medium"> / {mission.targetCount}개</span>
          </div>
        </div>

        {/* Stacked progress bar */}
        <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden flex mb-1">
          {members.map((m) => {
            const cnt = getMemberContributions(mission, m.id);
            if (cnt === 0) return null;
            const w = Math.min(100, (cnt / mission.targetCount) * 100);
            return (
              <div key={m.id} className="h-full transition-all duration-500"
                style={{ width: `${w}%`, backgroundColor: m.color }}
                title={`${m.name}: ${cnt}개`} />
            );
          })}
        </div>
        <div className="flex justify-between mb-4">
          <span className="text-xs text-gray-400">{pct}% 달성</span>
          <span className="text-xs text-gray-400">목표 {mission.targetCount}개</span>
        </div>

        {/* Member contribution buttons - crowdfunding style */}
        <div className="relative">
          {/* Float effects */}
          {floats.map((f) => {
            const member = members.find((m) => m.id === f.memberId);
            return (
              <div key={f.id}
                className="absolute pointer-events-none text-xl font-bold z-10 animate-[floatUp_0.8s_ease-out_forwards]"
                style={{ color: member?.color, left: '50%', bottom: '60px' }}>
                +1
              </div>
            );
          })}

          <div className="flex flex-col gap-2">
            {members.map((m) => {
              const cnt = getMemberContributions(mission, m.id);
              return (
                <div key={m.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-2xl"
                  style={{ backgroundColor: m.bgColor }}>
                  {/* Avatar + name */}
                  <span className="text-xl leading-none">{m.icon}</span>
                  <span className="text-sm font-bold flex-1" style={{ color: m.color }}>
                    {m.name}
                  </span>
                  {/* Count + buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUndo(mission.id, m.id)}
                      disabled={cnt === 0}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-lg font-bold transition-all active:scale-90 disabled:opacity-30"
                      style={{ backgroundColor: 'white', color: m.color }}>
                      −
                    </button>
                    <span className="w-6 text-center text-base font-extrabold" style={{ color: m.color }}>
                      {cnt}
                    </span>
                    <button
                      onClick={() => handleContribute(m.id)}
                      disabled={achieved}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-lg font-bold transition-all active:scale-90 disabled:opacity-30"
                      style={{ backgroundColor: m.color, color: 'white' }}>
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reward */}
        {mission.reward && (
          <div className="mt-3 p-3 bg-yellow-50 rounded-2xl">
            <p className="text-sm text-yellow-700 font-medium">🎁 달성 보상</p>
            <p className="text-gray-800 font-bold mt-0.5">{mission.reward}</p>
          </div>
        )}

        {/* Achievement banner */}
        {achieved && (
          <div className="mt-3 p-3 bg-green-50 rounded-2xl border-2 border-green-200 text-center">
            <p className="text-green-700 font-bold text-base">🎉 미션 달성! 온 가족이 최고예요!</p>
          </div>
        )}

        {/* Undo + delete */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={() => {
              if (!mission) return;
            const last = [...mission.contributions].reverse().find(() => true);
              if (last) onUndo(mission.id, last.memberId);
            }}
            disabled={!mission || mission.contributions.length === 0}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30">
            ↩ 취소
          </button>
          <button onClick={() => onDelete(mission.id)}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors">
            미션 삭제
          </button>
        </div>
      </div>
    </div>
  );
}
