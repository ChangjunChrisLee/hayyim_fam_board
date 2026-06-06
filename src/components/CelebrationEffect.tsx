'use client';

import { useEffect } from 'react';

interface Props {
  onClose: () => void;
}

export default function CelebrationEffect({ onClose }: Props) {
  useEffect(() => {
    // Dynamically import canvas-confetti to avoid SSR issues
    import('canvas-confetti').then((confettiModule) => {
      const confetti = confettiModule.default;
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ['#FFD6E0', '#BFD7FF', '#E0D7FF', '#C7F2E8', '#FFF3C4'];

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });
        if (Date.now() < end) requestAnimationFrame(frame);
      };

      frame();
    });

    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="text-center animate-[celebration_0.5s_ease-out] px-8 py-10 bg-white rounded-4xl shadow-soft-lg max-w-sm mx-4">
        <div className="text-7xl animate-float mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">완벽해요!</h2>
        <p className="text-gray-600 mb-1">우리 가족 모든 목표 완료!</p>
        <p className="text-3xl mt-4 animate-bounce-slow">🦁🐰🐥🐻🐣</p>
        <p className="text-sm text-gray-400 mt-4">화면을 탭하면 닫혀요</p>
      </div>
    </div>
  );
}
