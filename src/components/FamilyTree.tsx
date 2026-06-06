'use client';

import type { Member, GoalCompletion } from '@/types';

interface Props {
  completions: GoalCompletion[];
  members: Member[];
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const STAGES = [
  { min: 0,   label: '씨앗을 심었어요',    next: 1  },
  { min: 1,   label: '새싹이 돋아났어요!', next: 10 },
  { min: 10,  label: '나무가 자라요!',      next: 30 },
  { min: 30,  label: '울창한 나무예요!',   next: 60 },
  { min: 60,  label: '✨ 마법의 나무!',    next: null },
];

function getStage(total: number) {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (total >= STAGES[i].min) return i;
  }
  return 0;
}

export default function FamilyTree({ completions, members }: Props) {
  const total = completions.length;
  const stageIdx = getStage(total);
  const stage = STAGES[stageIdx];

  const CX = 150, CY = 105;
  const canopyR = [0, 30, 52, 72, 80][stageIdx];
  const trunkH = [0, 45, 65, 80, 88][stageIdx];
  const trunkY = CY + canopyR * 0.55;

  const visible = completions.slice(0, 70);
  const leaves = visible.map((c, i) => {
    const r = (0.2 + seededRandom(i * 3) * 0.8) * canopyR * 0.92;
    const theta = seededRandom(i * 3 + 1) * Math.PI * 2;
    const x = CX + r * Math.cos(theta);
    const y = CY + r * Math.sin(theta) * 0.75;
    const size = 5 + seededRandom(i * 3 + 2) * 5;
    const member = members.find((m) => m.id === c.memberId);
    return { x, y, size, color: member?.color ?? '#86efac', id: c.id };
  });

  const fruitCount = stageIdx >= 3 ? Math.min(10, Math.floor((total - 30) / 4)) : 0;
  const fruits = Array.from({ length: fruitCount }).map((_, i) => {
    const r = (0.3 + seededRandom(i * 7 + 200) * 0.65) * canopyR;
    const theta = seededRandom(i * 7 + 201) * Math.PI * 2;
    return {
      x: CX + r * Math.cos(theta),
      y: CY + r * Math.sin(theta) * 0.75,
    };
  });

  return (
    <div className="rounded-3xl overflow-hidden shadow-soft bg-white">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-gray-800 text-base">🌳 우리 가족 나무</h2>
            <p className="text-sm text-gray-500 mt-0.5">목표를 달성할수록 나무가 자라요!</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold text-emerald-600">{total}</div>
            <div className="text-xs text-gray-400">총 달성</div>
          </div>
        </div>

        <svg viewBox="0 0 300 210" className="w-full max-w-xs mx-auto block">
          {/* Sky */}
          <rect x="0" y="0" width="300" height="210" fill="#f0fdf4" rx="16" />

          {/* Clouds (stage 2+) */}
          {stageIdx >= 2 && (
            <>
              <ellipse cx="60" cy="35" rx="22" ry="12" fill="white" opacity="0.8" />
              <ellipse cx="75" cy="30" rx="18" ry="11" fill="white" opacity="0.8" />
              <ellipse cx="240" cy="45" rx="18" ry="10" fill="white" opacity="0.7" />
              <ellipse cx="253" cy="40" rx="15" ry="9" fill="white" opacity="0.7" />
            </>
          )}

          {/* Ground */}
          <rect x="0" y="190" width="300" height="20" fill="#86efac" />
          <ellipse cx="150" cy="192" rx="110" ry="10" fill="#4ade80" opacity="0.4" />

          {/* Small flowers on ground (stage 2+) */}
          {stageIdx >= 2 && (
            <>
              {[40, 70, 220, 255].map((fx, fi) => (
                <g key={fi}>
                  <circle cx={fx} cy="193" r="4" fill={['#f9a8d4','#fde68a','#a5f3fc','#c4b5fd'][fi]} />
                  <line x1={fx} y1="193" x2={fx} y2="200" stroke="#16a34a" strokeWidth="1.5" />
                </g>
              ))}
            </>
          )}

          {/* Seedling (stage 0 only) */}
          {stageIdx === 0 && (
            <>
              <line x1="150" y1="190" x2="150" y2="158" stroke="#84cc16" strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="150" cy="150" rx="10" ry="13" fill="#86efac" />
              <ellipse cx="140" cy="162" rx="9" ry="7" fill="#bbf7d0" transform="rotate(-35 140 162)" />
              <ellipse cx="160" cy="162" rx="9" ry="7" fill="#bbf7d0" transform="rotate(35 160 162)" />
            </>
          )}

          {/* Trunk (stage 1+) */}
          {stageIdx >= 1 && (
            <>
              <rect x="138" y={trunkY} width="24" height={190 - trunkY}
                fill="#92400e" rx="6" />
              <line x1="145" y1={trunkY + 8} x2="142" y2={trunkY + 35}
                stroke="#78350f" strokeWidth="2" opacity="0.4" strokeLinecap="round" />
              <line x1="155" y1={trunkY + 15} x2="158" y2={trunkY + 45}
                stroke="#78350f" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
            </>
          )}

          {/* Canopy base (stage 1+) */}
          {stageIdx >= 1 && (
            <>
              <ellipse cx={CX} cy={CY} rx={canopyR + 8} ry={(canopyR + 8) * 0.78}
                fill="#bbf7d0" opacity="0.55" />
              <ellipse cx={CX} cy={CY} rx={canopyR + 2} ry={(canopyR + 2) * 0.78}
                fill="#86efac" opacity="0.35" />
            </>
          )}

          {/* Leaves */}
          {leaves.map((leaf) => (
            <circle key={leaf.id} cx={leaf.x} cy={leaf.y} r={leaf.size}
              fill={leaf.color} opacity="0.82" />
          ))}

          {/* Fruits (stage 3+) */}
          {fruits.map((f, i) => (
            <g key={i}>
              <circle cx={f.x} cy={f.y} r="7" fill="#fb923c" />
              <circle cx={f.x - 2} cy={f.y - 2} r="2.5" fill="#fed7aa" opacity="0.6" />
              <line x1={f.x} y1={f.y - 7} x2={f.x + 3} y2={f.y - 13}
                stroke="#16a34a" strokeWidth="1.5" strokeLinecap="round" />
            </g>
          ))}

          {/* Magic sparkles (stage 4) */}
          {stageIdx >= 4 && (
            <>
              <text x="72" y="72" fontSize="18">⭐</text>
              <text x="200" y="62" fontSize="14">✨</text>
              <text x="48" y="125" fontSize="12">🌟</text>
              <text x="222" y="120" fontSize="13">💫</text>
            </>
          )}
        </svg>

        {/* Stage label */}
        <div className="text-center mt-1">
          <span className="text-sm font-bold text-emerald-700">{stage.label}</span>
          {stage.next !== null && (
            <p className="text-xs text-gray-400 mt-0.5">
              다음 단계까지 <span className="font-semibold text-emerald-500">{stage.next - total}번</span> 더!
            </p>
          )}
        </div>

        {/* Per-member contribution */}
        <div className="flex justify-center gap-4 mt-3 flex-wrap">
          {members.map((m) => {
            const count = completions.filter((c) => c.memberId === m.id).length;
            return (
              <div key={m.id} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: m.color }} />
                <span className="text-xs text-gray-600">
                  {m.icon} <span className="font-semibold">{count}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
