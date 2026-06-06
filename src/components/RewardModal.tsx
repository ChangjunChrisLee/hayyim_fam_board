'use client';

import { useState } from 'react';
import type { Reward, RewardPeriod } from '@/types';

interface Props {
  existing?: Reward;
  onClose: () => void;
  onSave: (data: Omit<Reward, 'id' | 'createdAt'>) => Promise<void>;
}

const PERIOD_LABELS: Record<RewardPeriod, string> = {
  daily: '오늘 하루 📅',
  weekly: '이번 주 📆',
  monthly: '이번 달 🗓️',
};

export default function RewardModal({ existing, onClose, onSave }: Props) {
  const [period, setPeriod] = useState<RewardPeriod>(existing?.period ?? 'monthly');
  const [targetPercentage, setTargetPercentage] = useState(
    existing?.targetPercentage ?? 90
  );
  const [description, setDescription] = useState(existing?.description ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!description.trim()) return;
    setSaving(true);
    await onSave({ period, targetPercentage, description: description.trim() });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-soft-lg overflow-hidden animate-[celebration_0.3s_ease-out]">
        {/* Header */}
        <div className="p-5 bg-yellow-50 flex items-center gap-3">
          <span className="text-4xl">🏆</span>
          <div>
            <h2 className="text-lg font-bold text-gray-800">보상 설정</h2>
            <p className="text-sm text-gray-600">목표 달성 보상을 정해요!</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-gray-800 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Period */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📅 보상 기간
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(PERIOD_LABELS) as [RewardPeriod, string][]).map(([p, label]) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`py-3 rounded-2xl border-2 text-sm font-medium transition-all ${
                    period === p
                      ? 'border-yellow-400 bg-yellow-50 text-yellow-700 scale-105'
                      : 'border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Target % */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🎯 기준 달성률: <span className="text-yellow-600">{targetPercentage}%</span>
            </label>
            <input
              type="range"
              min={50}
              max={100}
              step={5}
              value={targetPercentage}
              onChange={(e) => setTargetPercentage(Number(e.target.value))}
              className="w-full h-3 rounded-full accent-yellow-400"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🎁 보상 내용
            </label>
            <textarea
              placeholder="예: 가족 영화의 밤, 치킨 파티, 놀이공원 가기..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:outline-none focus:border-yellow-300 text-gray-800 placeholder-gray-400 resize-none"
            />
          </div>

          {/* Preview */}
          {description.trim() && (
            <div className="p-4 bg-yellow-50 rounded-2xl border-2 border-yellow-100">
              <p className="text-sm text-yellow-700 font-medium">✨ 보상 미리보기</p>
              <p className="mt-1 text-gray-700">
                <strong>{PERIOD_LABELS[period].split(' ')[0]}</strong> 가족 달성률{' '}
                <strong className="text-yellow-600">{targetPercentage}%</strong> 이상이면
              </p>
              <p className="text-base font-bold text-gray-800 mt-1">🎉 {description.trim()}</p>
            </div>
          )}
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!description.trim() || saving}
            className="flex-1 py-3 rounded-2xl bg-yellow-400 text-white font-bold hover:bg-yellow-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? '저장 중...' : '🏆 보상 저장!'}
          </button>
        </div>
      </div>
    </div>
  );
}
