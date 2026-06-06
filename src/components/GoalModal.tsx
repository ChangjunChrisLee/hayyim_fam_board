'use client';

import { useState } from 'react';
import type { Member, RepeatType } from '@/types';

interface Props {
  members: Member[];
  defaultMemberId?: string;
  onClose: () => void;
  onSave: (data: {
    memberId: string;
    category: string;
    content: string;
    repeatType: RepeatType;
  }) => Promise<void>;
}

const REPEAT_LABELS: Record<RepeatType, string> = {
  daily: '매일 📅',
  weekly: '매주 📆',
  monthly: '매달 🗓️',
};

export default function GoalModal({ members, defaultMemberId, onClose, onSave }: Props) {
  const [memberId, setMemberId] = useState(defaultMemberId ?? members[0]?.id ?? '');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [repeatType, setRepeatType] = useState<RepeatType>('daily');
  const [saving, setSaving] = useState(false);

  const selectedMember = members.find((m) => m.id === memberId);

  async function handleSave() {
    if (!content.trim() || !category.trim()) return;
    setSaving(true);
    await onSave({ memberId, category: category.trim(), content: content.trim(), repeatType });
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-soft-lg overflow-hidden animate-[celebration_0.3s_ease-out]">
        {/* Header */}
        <div
          className="p-5 flex items-center gap-3"
          style={{ backgroundColor: selectedMember?.bgColor ?? '#E8F1FF' }}
        >
          <span className="text-4xl">{selectedMember?.icon ?? '🎯'}</span>
          <div>
            <h2 className="text-lg font-bold text-gray-800">목표 추가하기</h2>
            <p className="text-sm text-gray-600">새로운 목표를 만들어요!</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto text-gray-500 hover:text-gray-800 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Member */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              👤 누구의 목표인가요?
            </label>
            <div className="grid grid-cols-5 gap-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMemberId(m.id)}
                  className={`flex flex-col items-center p-2 rounded-2xl border-2 transition-all text-xs font-medium ${
                    memberId === m.id
                      ? 'border-current scale-105 shadow-md'
                      : 'border-transparent bg-gray-50 hover:bg-gray-100'
                  }`}
                  style={
                    memberId === m.id
                      ? { borderColor: m.color, backgroundColor: m.bgColor }
                      : {}
                  }
                >
                  <span className="text-2xl">{m.icon}</span>
                  <span className="mt-1 text-gray-700">{m.name.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🏷️ 카테고리
            </label>
            <input
              type="text"
              placeholder="예: 독서, 운동, 공부, 집안일..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:outline-none focus:border-blue-300 text-gray-800 placeholder-gray-400"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ✏️ 목표 내용
            </label>
            <textarea
              placeholder="예: 책 30분 읽기, 영어 단어 20개 외우기..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:outline-none focus:border-blue-300 text-gray-800 placeholder-gray-400 resize-none"
            />
          </div>

          {/* Repeat */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔄 반복 기준
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(REPEAT_LABELS) as [RepeatType, string][]).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => setRepeatType(type)}
                  className={`py-3 rounded-2xl border-2 text-sm font-medium transition-all ${
                    repeatType === type
                      ? 'border-blue-400 bg-blue-50 text-blue-700 scale-105'
                      : 'border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!content.trim() || !category.trim() || saving}
            className="flex-2 flex-1 py-3 rounded-2xl font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: selectedMember?.color ?? '#5B9BD5' }}
          >
            {saving ? '저장 중...' : '🎯 목표 저장!'}
          </button>
        </div>
      </div>
    </div>
  );
}
