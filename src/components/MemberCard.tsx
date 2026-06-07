'use client';

import { useState } from 'react';
import type { Member, Goal, ViewMode } from '@/types';

interface Props {
  member: Member;
  goals: Goal[];
  percentage: number;
  completedCount: number;
  viewMode: ViewMode;
  readOnly?: boolean;
  isGoalCompleted: (goal: Goal) => boolean;
  onToggleGoal: (goal: Goal) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
  onEditIcon: () => void;
  onEditGoal: (goal: Goal) => void;
  onAddGoal: (memberId: string) => void;
}

const VIEW_LABEL: Record<ViewMode, string> = {
  daily: '매일 목표',
  weekly: '매주 목표',
  monthly: '매달 목표',
};

const EMPTY_MSG: Record<ViewMode, string> = {
  daily: '오늘 매일 목표가 없어요 ✨',
  weekly: '이번 주 매주 목표가 없어요 ✨',
  monthly: '이번 달 매달 목표가 없어요 ✨',
};

export default function MemberCard({
  member, goals, percentage, completedCount, viewMode, readOnly = false,
  isGoalCompleted, onToggleGoal, onDeleteGoal, onEditGoal, onAddGoal, onEditIcon,
}: Props) {
  const [toggling, setToggling] = useState<string | null>(null);

  async function handleToggle(goal: Goal) {
    if (readOnly) return;
    setToggling(goal.id);
    await onToggleGoal(goal);
    setToggling(null);
  }

  const allDone = goals.length > 0 && completedCount === goals.length;

  return (
    <div className="rounded-3xl overflow-hidden shadow-card hover:shadow-soft-lg transition-shadow"
      style={{ backgroundColor: member.bgLightColor }}>

      {/* Header */}
      <div className="p-4 flex items-center gap-3" style={{ backgroundColor: member.bgColor }}>
        <button onClick={onEditIcon} className="relative group flex-shrink-0" title="캐릭터 변경">
          <span className="text-4xl">{member.icon}</span>
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold">✎</span>
          {allDone && <span className="absolute -top-1 -right-1 text-lg animate-bounce-slow">🌟</span>}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-800 text-base">{member.name}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: member.bgLightColor, color: member.color }}>
              {member.role}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-0.5">
            {VIEW_LABEL[viewMode]} {completedCount}/{goals.length}개 완료
          </p>
        </div>
        <div className="text-2xl font-bold" style={{ color: member.color }}>{percentage}%</div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pt-3">
        <div className="w-full h-3 bg-white rounded-full overflow-hidden shadow-inner">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${percentage}%`, backgroundColor: member.color }} />
        </div>
      </div>

      {/* Goal list */}
      <div className="p-4 space-y-2">
        {goals.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-4">
            {EMPTY_MSG[viewMode]}<br />
            <span className="text-xs">아래 버튼으로 추가해봐요!</span>
          </p>
        ) : (
          goals.map((goal) => {
            const done = isGoalCompleted(goal);
            const isToggling = toggling === goal.id;
            return (
              <div key={goal.id}
                className={`flex items-start gap-3 p-3 rounded-2xl border-2 transition-all border-transparent ${done ? '' : 'bg-white'}`}
                style={done ? { backgroundColor: member.bgColor } : {}}>
                <button
                  onClick={() => handleToggle(goal)}
                  disabled={isToggling || readOnly}
                  className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 ${
                    done ? 'border-transparent text-white text-sm' : 'border-gray-300 bg-white hover:border-current'
                  } ${isToggling || readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={done ? { backgroundColor: member.color } : { color: member.color }}
                  aria-label={readOnly ? '과거 기록' : done ? '완료 취소' : '완료'}
                  title={readOnly ? '이 날짜는 수정할 수 없어요' : undefined}>
                  {done ? '✓' : ''}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium leading-tight ${done ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                    {goal.content}
                  </p>
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full mt-1"
                    style={{ backgroundColor: done ? 'rgba(255,255,255,0.5)' : member.bgColor, color: member.color }}>
                    {goal.category}
                  </span>
                </div>
                <div className="flex-shrink-0 flex flex-col gap-1 mt-0.5">
                  <button onClick={() => onEditGoal(goal)}
                    className="text-gray-300 hover:text-blue-400 transition-colors text-xs leading-none"
                    aria-label="목표 수정">✎</button>
                  <button onClick={() => onDeleteGoal(goal.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors text-sm leading-none"
                    aria-label="목표 삭제">✕</button>
                </div>
              </div>
            );
          })
        )}
        {allDone && goals.length > 0 && (
          <div className="text-center py-2">
            <p className="text-sm font-bold" style={{ color: member.color }}>🎉 모든 목표 완료! 최고예요!</p>
          </div>
        )}
      </div>

      {/* Add button */}
      <div className="px-4 pb-4">
        <button onClick={() => onAddGoal(member.id)}
          className="w-full py-2.5 rounded-2xl border-2 border-dashed text-sm font-medium transition-all hover:opacity-80"
          style={{ borderColor: member.color, color: member.color, backgroundColor: 'transparent' }}>
          + {VIEW_LABEL[viewMode]} 추가하기
        </button>
      </div>
    </div>
  );
}
