'use client';

import { useState } from 'react';
import type { Member } from '@/types';

interface Props {
  member: Member;
  onClose: () => void;
  onSelect: (icon: string) => void;
}

const CATEGORIES: { label: string; emoji: string; icons: string[] }[] = [
  {
    label: '동물',
    emoji: '🐾',
    icons: [
      '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮',
      '🐷','🐸','🐵','🐔','🐧','🦆','🦉','🦅','🐺','🐴','🦄','🦝',
      '🦔','🐿️','🦥','🦦','🐗','🦛','🦏','🐘','🦒','🦓','🦬','🐃',
    ],
  },
  {
    label: '곤충·바다',
    emoji: '🦋',
    icons: [
      '🦋','🐝','🐛','🐞','🐜','🦟','🦗','🕷️','🦂',
      '🐢','🐍','🦎','🦖','🦕',
      '🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🦈','🦭',
    ],
  },
  {
    label: '사람',
    emoji: '👧',
    icons: [
      '👶','🧒','👦','👧','🧑','👨','👩','🧔','👴','👵',
      '🧙','🧝','🧚','🧜','🧛','🧟','👸','🤴','🎅','🤶',
      '👮','👷','🕵️','🦸','🦹','🧑‍🚀','🧑‍🍳','🧑‍🎨','🧑‍🏫','🧑‍⚕️',
    ],
  },
  {
    label: '기타',
    emoji: '⭐',
    icons: [
      '⭐','🌟','💫','✨','🌈','☀️','🌙','❄️','🔥','💧',
      '🌺','🌸','🌼','🌻','🍀','🎄','🎃','🎯','🏆','👑',
      '🦄','🐲','🌊','🏔️','🌋','🎠','🎡','🎪','🚀','🛸',
    ],
  },
];

export default function CharacterPicker({ member, onClose, onSelect }: Props) {
  const [tab, setTab] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}>
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-soft-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="p-4 flex items-center gap-3" style={{ backgroundColor: member.bgColor }}>
          <span className="text-4xl">{member.icon}</span>
          <div>
            <h2 className="text-base font-bold text-gray-800">{member.name} 캐릭터 변경</h2>
            <p className="text-sm text-gray-600">원하는 캐릭터를 골라요!</p>
          </div>
          <button onClick={onClose} className="ml-auto text-gray-500 hover:text-gray-800 text-2xl leading-none">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {CATEGORIES.map((cat, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                tab === i
                  ? 'text-gray-800 border-b-2'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              style={tab === i ? { borderColor: member.color } : {}}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Emoji grid */}
        <div className="p-4 grid grid-cols-8 gap-1.5 max-h-52 overflow-y-auto">
          {CATEGORIES[tab].icons.map((icon) => (
            <button key={icon} onClick={() => { onSelect(icon); onClose(); }}
              className={`text-2xl p-1.5 rounded-xl transition-all hover:scale-110 active:scale-95 ${
                member.icon === icon ? 'ring-2 scale-110' : 'hover:bg-gray-100'
              }`}
              style={member.icon === icon ? { backgroundColor: member.bgColor, outline: `2px solid ${member.color}` } : {}}>
              {icon}
            </button>
          ))}
        </div>

        <div className="pb-6" />
      </div>
    </div>
  );
}
