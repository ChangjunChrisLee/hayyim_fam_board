'use client';

import { useState } from 'react';
import type { Member, Note } from '@/types';

interface Props {
  members: Member[];
  notes: Note[];
  onAdd: (memberId: string, content: string) => void;
  onDelete: (id: string) => void;
}

// 포스트잇 배경색 (멤버 bgColor보다 살짝 채도 낮은 느낌)
const NOTE_ROTATIONS = [-2, 1.5, -1, 2.5, -1.5, 1, -2.5, 2];

export default function NoteBoard({ members, notes, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [memberId, setMemberId] = useState(members[0]?.id ?? '');
  const [content, setContent] = useState('');

  const selectedMember = members.find((m) => m.id === memberId);

  function handleAdd() {
    if (!content.trim()) return;
    onAdd(memberId, content.trim());
    setContent('');
    setShowForm(false);
  }

  return (
    <div className="rounded-3xl overflow-hidden shadow-soft bg-white">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-800 text-base">📝 우리 가족 메모판</h2>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-sm px-3 py-1.5 rounded-xl bg-yellow-50 text-yellow-700 font-medium hover:bg-yellow-100 transition-colors"
          >
            {showForm ? '닫기' : '+ 메모 추가'}
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="mb-4 p-4 rounded-2xl bg-yellow-50 border-2 border-yellow-100 space-y-3">
            {/* Member selector */}
            <div className="flex gap-2 flex-wrap">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMemberId(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                    memberId === m.id ? 'scale-105 shadow-sm' : 'border-transparent bg-white'
                  }`}
                  style={
                    memberId === m.id
                      ? { borderColor: m.color, backgroundColor: m.bgColor, color: m.color }
                      : {}
                  }
                >
                  <span>{m.icon}</span>
                  <span>{m.name}</span>
                </button>
              ))}
            </div>

            {/* Text input */}
            <textarea
              placeholder={`${selectedMember?.name ?? ''}의 메모를 남겨요 ✏️`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-2xl border-2 border-yellow-200 bg-white focus:outline-none focus:border-yellow-400 text-gray-800 placeholder-gray-400 resize-none text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAdd();
              }}
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 rounded-xl border-2 border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleAdd}
                disabled={!content.trim()}
                className="flex-1 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                style={{ backgroundColor: selectedMember?.color ?? '#D4A017' }}
              >
                📌 붙이기
              </button>
            </div>
          </div>
        )}

        {/* Notes grid */}
        {notes.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-6">
            아직 메모가 없어요 📝<br />
            <span className="text-xs">가족에게 하고 싶은 말을 남겨봐요!</span>
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {notes.map((note, i) => {
              const member = members.find((m) => m.id === note.memberId);
              const rotation = NOTE_ROTATIONS[i % NOTE_ROTATIONS.length];
              const date = new Date(note.createdAt);
              const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

              return (
                <div
                  key={note.id}
                  className="relative group p-3 rounded-sm shadow-md hover:shadow-lg transition-all hover:scale-105 hover:z-10 cursor-default"
                  style={{
                    backgroundColor: member?.bgColor ?? '#FFF9C4',
                    transform: `rotate(${rotation}deg)`,
                    minHeight: '100px',
                  }}
                >
                  {/* Delete button */}
                  <button
                    onClick={() => onDelete(note.id)}
                    className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded-full bg-black/10 hover:bg-red-100 text-gray-500 hover:text-red-500 text-xs"
                    aria-label="메모 삭제"
                  >
                    ✕
                  </button>

                  {/* Member icon */}
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-lg">{member?.icon ?? '📝'}</span>
                    <span className="text-xs font-bold" style={{ color: member?.color }}>
                      {member?.name}
                    </span>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-gray-800 leading-relaxed break-words whitespace-pre-wrap">
                    {note.content}
                  </p>

                  {/* Date */}
                  <p className="text-xs text-gray-400 mt-2">{dateStr}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
