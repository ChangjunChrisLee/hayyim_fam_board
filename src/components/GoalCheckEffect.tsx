'use client';

import { useEffect, useState } from 'react';

interface Props {
  memberIcon: string;
  memberColor: string;
  memberName: string;
  onDone: () => void;
}

const CHEER_MESSAGES = [
  '잘했어요! 🌟', '멋져요! ✨', '대단해! 🎯',
  '최고야! 👏', '완료! 🎊', '굿잡! 💪',
];

export default function GoalCheckEffect({ memberIcon, memberColor, memberName, onDone }: Props) {
  const [particles, setParticles] = useState<{ id: number; x: number; emoji: string; delay: number }[]>([]);
  const msg = CHEER_MESSAGES[Math.floor(Math.random() * CHEER_MESSAGES.length)];

  useEffect(() => {
    const emojis = ['⭐', '✨', '🌟', '💫', '🎉', '🎊', memberIcon];
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 60, // 20~80% horizontal
      emoji: emojis[Math.floor(Math.random() * emojis.length)],
      delay: Math.random() * 0.3,
    }));
    setParticles(newParticles);

    const timer = setTimeout(onDone, 1600);
    return () => clearTimeout(timer);
  }, [memberIcon, onDone]);

  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {/* Floating particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute text-2xl"
          style={{
            left: `${p.x}%`,
            bottom: '30%',
            animation: `floatUp 1.4s ease-out ${p.delay}s forwards`,
            opacity: 0,
          }}
        >
          {p.emoji}
        </div>
      ))}

      {/* Center toast */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-none"
        style={{ animation: 'popIn 0.3s ease-out forwards' }}
      >
        <div
          className="px-5 py-3 rounded-3xl shadow-lg flex items-center gap-2"
          style={{ backgroundColor: memberColor + '22', border: `2px solid ${memberColor}44` }}
        >
          <span className="text-3xl" style={{ animation: 'bounce 0.6s ease-in-out' }}>{memberIcon}</span>
          <div>
            <p className="text-sm font-bold" style={{ color: memberColor }}>{memberName}</p>
            <p className="text-base font-extrabold text-gray-800">{msg}</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-200px) scale(0.5); opacity: 0; }
        }
        @keyframes popIn {
          0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
          60% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
