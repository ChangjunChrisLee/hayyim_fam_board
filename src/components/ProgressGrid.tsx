'use client';

import type { Member, Goal, GoalCompletion } from '@/types';
import { getPeriodKey, getKSTNow } from '@/lib/constants';

interface Props {
  mode: 'weekly' | 'monthly';
  selectedDate: Date;
  goals: Goal[];
  completions: GoalCompletion[];
  members: Member[];
}

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];

function getWeekDays(date: Date): Date[] {
  const mon = new Date(date);
  mon.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon);
    d.setDate(mon.getDate() + i);
    return d;
  });
}

function getMonthWeeks(date: Date): Date[] {
  // Return one representative Monday per week that overlaps with this month
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const weeks: Date[] = [];
  const cursor = new Date(firstDay);
  // go back to the Monday of the first day's week
  cursor.setDate(cursor.getDate() - ((cursor.getDay() + 6) % 7));

  while (cursor <= lastDay) {
    weeks.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 7);
  }
  return weeks;
}

function CompletionCell({
  completed, total, color, bgColor, isToday,
}: {
  completed: number; total: number; color: string; bgColor: string; isToday?: boolean;
}) {
  if (total === 0) {
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center">
        <div className="w-4 h-4 rounded-full border border-gray-200" />
      </div>
    );
  }
  const pct = completed / total;
  const full = pct === 1;
  const none = pct === 0;

  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
      ${isToday ? 'ring-2 ring-offset-1' : ''}`}
      style={{
        backgroundColor: full ? color : none ? 'transparent' : bgColor,
        color: full ? 'white' : color,
        border: none ? `2px solid ${color}20` : undefined,
      }}>
      {full ? '✓' : none ? '' : `${completed}`}
    </div>
  );
}

export default function ProgressGrid({ mode, selectedDate, goals, completions, members }: Props) {
  const today = getKSTNow();

  if (mode === 'weekly') {
    const days = getWeekDays(selectedDate);
    const dailyGoals = goals.filter((g) => g.isActive && g.repeatType === 'daily');

    if (dailyGoals.length === 0) return null;

    return (
      <div className="rounded-3xl overflow-hidden shadow-soft bg-white">
        <div className="p-5">
          <h2 className="font-bold text-gray-800 text-base mb-4">📅 이번 주 매일 달성 현황</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left pb-3 pr-2 w-20" />
                  {days.map((d, i) => {
                    const isToday = d.toDateString() === today.toDateString();
                    const isFuture = d > today;
                    return (
                      <th key={i} className="pb-3 text-center w-10">
                        <div className="flex flex-col items-center gap-0.5">
                          <span className={`text-xs font-semibold ${isToday ? 'text-blue-600' : isFuture ? 'text-gray-300' : 'text-gray-500'}`}>
                            {DAY_LABELS[i]}
                          </span>
                          <span className={`text-xs ${isToday ? 'font-bold text-blue-600' : isFuture ? 'text-gray-300' : 'text-gray-400'}`}>
                            {d.getDate()}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="space-y-1">
                {members.map((m) => {
                  const memberGoals = dailyGoals.filter((g) => g.memberId === m.id);
                  if (memberGoals.length === 0) return null;
                  return (
                    <tr key={m.id}>
                      <td className="pr-2 pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg">{m.icon}</span>
                          <span className="text-xs font-medium text-gray-600 truncate max-w-[48px]">
                            {m.name.slice(-2)}
                          </span>
                        </div>
                      </td>
                      {days.map((d, i) => {
                        const periodKey = getPeriodKey(d, 'daily');
                        const completed = memberGoals.filter((g) =>
                          completions.some((c) => c.goalId === g.id && c.period === periodKey)
                        ).length;
                        const isFuture = d > today;
                        const isToday = d.toDateString() === today.toDateString();
                        return (
                          <td key={i} className="pb-2 text-center">
                            {isFuture ? (
                              <div className="w-8 h-8 flex items-center justify-center mx-auto">
                                <div className="w-3 h-3 rounded-full bg-gray-100" />
                              </div>
                            ) : (
                              <div className="mx-auto w-fit">
                                <CompletionCell
                                  completed={completed}
                                  total={memberGoals.length}
                                  color={m.color}
                                  bgColor={m.bgColor}
                                  isToday={isToday}
                                />
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold">✓</div>
              <span>전부 완료</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">N</div>
              <span>일부 완료</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full border border-gray-200" />
              <span>미완료</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Monthly mode — weekly goal completion by week
  const weeks = getMonthWeeks(selectedDate);
  const weeklyGoals = goals.filter((g) => g.isActive && g.repeatType === 'weekly');

  if (weeklyGoals.length === 0) return null;

  const month = selectedDate.getMonth();

  return (
    <div className="rounded-3xl overflow-hidden shadow-soft bg-white">
      <div className="p-5">
        <h2 className="font-bold text-gray-800 text-base mb-4">📆 이번 달 주차별 달성 현황</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left pb-3 pr-2 w-20" />
                {weeks.map((wMon, i) => {
                  const weekKey = getPeriodKey(wMon, 'weekly');
                  const currentWeekKey = getPeriodKey(today, 'weekly');
                  const isThisWeek = weekKey === currentWeekKey;
                  const isFuture = wMon > today && !isThisWeek;
                  // label: month/day of Monday
                  const wEnd = new Date(wMon); wEnd.setDate(wMon.getDate() + 6);
                  const label = `${wMon.getMonth() + 1}/${wMon.getDate()}`;
                  return (
                    <th key={i} className="pb-3 text-center min-w-[48px]">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={`text-xs font-semibold ${isThisWeek ? 'text-blue-600' : isFuture ? 'text-gray-300' : 'text-gray-500'}`}>
                          {i + 1}주
                        </span>
                        <span className={`text-xs ${isThisWeek ? 'text-blue-500' : isFuture ? 'text-gray-200' : 'text-gray-400'}`}>
                          {label}~
                        </span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const memberGoals = weeklyGoals.filter((g) => g.memberId === m.id);
                if (memberGoals.length === 0) return null;
                return (
                  <tr key={m.id}>
                    <td className="pr-2 pb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-lg">{m.icon}</span>
                        <span className="text-xs font-medium text-gray-600 truncate max-w-[48px]">
                          {m.name.slice(-2)}
                        </span>
                      </div>
                    </td>
                    {weeks.map((wMon, i) => {
                      const weekKey = getPeriodKey(wMon, 'weekly');
                      const currentWeekKey = getPeriodKey(today, 'weekly');
                      const isFutureWeek = weekKey > currentWeekKey;
                      const completed = memberGoals.filter((g) =>
                        completions.some((c) => c.goalId === g.id && c.period === weekKey)
                      ).length;
                      return (
                        <td key={i} className="pb-2 text-center">
                          {isFutureWeek ? (
                            <div className="w-8 h-8 flex items-center justify-center mx-auto">
                              <div className="w-3 h-3 rounded-full bg-gray-100" />
                            </div>
                          ) : (
                            <div className="mx-auto w-fit">
                              <CompletionCell
                                completed={completed}
                                total={memberGoals.length}
                                color={m.color}
                                bgColor={m.bgColor}
                                isToday={weekKey === currentWeekKey}
                              />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
