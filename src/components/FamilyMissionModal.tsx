'use client';

import { useState } from 'react';
import type { FamilyMission, MissionPeriod } from '@/types';

interface Props {
  existing?: FamilyMission;
  onClose: () => void;
  onSave: (data: Omit<FamilyMission, 'id' | 'createdAt' | 'isActive' | 'contributions'>) => void;
}

const PERIOD_OPTIONS: { value: MissionPeriod; label: string; desc: string }[] = [
  { value: 'daily',   label: '오늘',       desc: '오늘 하루' },
  { value: 'weekly',  label: '이번 주',    desc: '월~일' },
  { value: 'monthly', label: '이번 달',    desc: '이달 전체' },
  { value: 'alltime', label: '전체',       desc: '누적 기록' },
];

const QUICK_TARGETS = [10, 20, 30, 50, 100];

const QUICK_MISSIONS = [
  { title: '이번 주 가족 합계 30개 달성!', targetCount: 30, period: 'weekly' as MissionPeriod },
  { title: '오늘 다 같이 10개 완료하기!', targetCount: 10, period: 'daily' as MissionPeriod },
  { title: '이번 달 100개 돌파하기!',      targetCount: 100, period: 'monthly' as MissionPeriod },
];

export default function FamilyMissionModal({ existing, onClose, onSave }: Props) {
  const [title, setTitle]           = useState(existing?.title ?? '');
  const [targetCount, setTarget]    = useState(existing?.targetCount ?? 30);
  const [period, setPeriod]         = useState<MissionPeriod>(existing?.period ?? 'weekly');
  const [reward, setReward]         = useState(existing?.reward ?? '');
  const [saving, setSaving]         = useState(false);

  function applyQuick(q: typeof QUICK_MISSIONS[0]) {
    setTitle(q.title);
    setTarget(q.targetCount);
    setPeriod(q.period);
  }

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    onSave({ title: title.trim(), targetCount, period, reward: reward.trim() });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-soft-lg overflow-hidden">
        <div className="p-5 flex items-center gap-3 bg-orange-50">
          <span className="text-4xl">🎯</span>
          <div>
            <h2 className="text-lg font-bold text-gray-800">가족 합산 미션</h2>
            <p className="text-sm text-gray-600">온 가족이 함께 도전해요!</p>
          </div>
          <button onClick={onClose} className="ml-auto text-gray-500 hover:text-gray-800 text-2xl leading-none">✕</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Quick missions */}
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2">⚡ 추천 미션</p>
            <div className="flex flex-col gap-1.5">
              {QUICK_MISSIONS.map((q) => (
                <button key={q.title} onClick={() => applyQuick(q)}
                  className="text-left text-sm px-3 py-2 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors font-medium">
                  {q.title}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">✏️ 미션 이름</label>
            <input type="text" placeholder="예: 이번 주 가족 합계 50개 달성!"
              value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:outline-none focus:border-orange-300 text-gray-800 placeholder-gray-400" />
          </div>

          {/* Period */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📅 기간</label>
            <div className="grid grid-cols-4 gap-2">
              {PERIOD_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setPeriod(opt.value)}
                  className={`py-2.5 rounded-2xl border-2 text-sm font-medium transition-all flex flex-col items-center gap-0.5 ${
                    period === opt.value
                      ? 'border-orange-400 bg-orange-50 text-orange-700 scale-105'
                      : 'border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}>
                  <span>{opt.label}</span>
                  <span className="text-xs opacity-60">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Target count */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔢 목표 달성 횟수: <span className="text-orange-600">{targetCount}개</span>
            </label>
            <input type="range" min={5} max={200} step={5}
              value={targetCount} onChange={(e) => setTarget(Number(e.target.value))}
              className="w-full accent-orange-500" />
            <div className="flex gap-2 mt-2 flex-wrap">
              {QUICK_TARGETS.map((t) => (
                <button key={t} onClick={() => setTarget(t)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border-2 transition-all ${
                    targetCount === t
                      ? 'border-orange-400 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-500 hover:border-orange-300'
                  }`}>
                  {t}개
                </button>
              ))}
            </div>
          </div>

          {/* Reward */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">🎁 달성 보상 (선택)</label>
            <input type="text" placeholder="예: 치킨 파티! 🍗"
              value={reward} onChange={(e) => setReward(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:outline-none focus:border-orange-300 text-gray-800 placeholder-gray-400" />
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
            취소
          </button>
          <button onClick={handleSave} disabled={!title.trim() || saving}
            className="flex-1 py-3 rounded-2xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {saving ? '저장 중...' : '🎯 미션 시작!'}
          </button>
        </div>
      </div>
    </div>
  );
}
