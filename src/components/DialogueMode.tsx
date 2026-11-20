import React, { useState } from 'react';
import { DialogueTurn, VoiceName } from '../types';
import { AI_VOICES } from '../data/voices';
import { Plus, Trash2, Users, Sparkles, Loader2 } from 'lucide-react';

interface DialogueModeProps {
  onGenerateDialogue: (turns: DialogueTurn[], speaker1: any, speaker2: any) => Promise<void>;
  isLoading: boolean;
}

export const DialogueMode: React.FC<DialogueModeProps> = ({
  onGenerateDialogue,
  isLoading,
}) => {
  const [speaker1, setSpeaker1] = useState({
    name: 'Alex',
    voice: 'Puck' as VoiceName,
    style: 'Sôi nổi, trẻ trung, tò mò',
  });

  const [speaker2, setSpeaker2] = useState({
    name: 'Sam',
    voice: 'Kore' as VoiceName,
    style: 'Dịu dàng, sâu sắc, giải thích điềm tĩnh',
  });

  const [turns, setTurns] = useState<DialogueTurn[]>([
    {
      id: '1',
      speaker: 'Alex',
      text: 'Chào Sam! <breath> Cậu có nghe nói gì về công nghệ giọng đọc AI mới đang cực hot dạo gần đây không?',
    },
    {
      id: '2',
      speaker: 'Sam',
      text: 'Có chứ Alex, |yeah| mình vừa thử xong, giọng đọc tự nhiên đến mức có cả nhịp thở và tiếng cười cơ đấy! <laugh>',
    },
    {
      id: '3',
      speaker: 'Alex',
      text: 'Thật á? <gasp> Thế này thì làm podcast hay review phim chỉ mất vài giây thôi nhỉ!',
    },
    {
      id: '4',
      speaker: 'Sam',
      text: 'Đúng vậy! |mhm| Nó mở ra cơ hội sáng tạo không giới hạn cho tất cả mọi người.',
    },
  ]);

  const addTurn = (speaker: string) => {
    setTurns([
      ...turns,
      {
        id: String(Date.now()),
        speaker,
        text: '',
      },
    ]);
  };

  const updateTurnText = (id: string, text: string) => {
    setTurns(turns.map((t) => (t.id === id ? { ...t, text } : t)));
  };

  const removeTurn = (id: string) => {
    if (turns.length <= 1) return;
    setTurns(turns.filter((t) => t.id !== id));
  };

  const loadSampleDialogue = (type: string) => {
    if (type === 'interview') {
      setSpeaker1({ name: 'Nhà tuyển dụng', voice: 'Charon', style: 'Trầm ấm, lịch thiệp' });
      setSpeaker2({ name: 'Ứng viên', voice: 'Puck', style: 'Năng động, tự tin' });
      setTurns([
        {
          id: '1',
          speaker: 'Nhà tuyển dụng',
          text: 'Chào bạn, điểm mạnh lớn nhất của bạn trong công việc là gì?',
        },
        {
          id: '2',
          speaker: 'Ứng viên',
          text: 'Dạ, <breath> em có thể tạo ra các kịch bản video viral và chuyển giọng đọc AI siêu thực chỉ trong 1 phút ạ! <laugh>',
        },
        {
          id: '3',
          speaker: 'Nhà tuyển dụng',
          text: 'Ấn tượng đấy! |yeah| Bạn có thể bắt đầu đi làm ngay từ ngày mai được không?',
        },
      ]);
    } else {
      setSpeaker1({ name: 'Alex', voice: 'Fenrir', style: 'Kịch tính, hồi hộp' });
      setSpeaker2({ name: 'Sam', voice: 'Zephyr', style: 'Sợ hãi, ngạc nhiên' });
      setTurns([
        {
          id: '1',
          speaker: 'Alex',
          text: 'Cậu có nghe thấy tiếng bước chân ở trên tầng gác mái không?',
        },
        {
          id: '2',
          speaker: 'Sam',
          text: '<gasp> Cậu đừng dọa mình chứ, ngôi nhà này đã bỏ hoang 10 năm rồi mà!',
        },
        {
          id: '3',
          speaker: 'Alex',
          text: 'Suỵt... <breath> Cửa phòng đang tự mở ra kìa!',
        },
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validTurns = turns.filter((t) => t.text.trim().length > 0);
    if (validTurns.length === 0) return;
    onGenerateDialogue(validTurns, speaker1, speaker2);
  };

  return (
    <div className="space-y-4">
      {/* Speaker Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Speaker 1 Card */}
        <div className="p-3.5 rounded-xl bg-white border border-neutral-200 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-neutral-900 text-white">
              Nhân vật 1
            </span>
            <input
              type="text"
              value={speaker1.name}
              onChange={(e) => setSpeaker1({ ...speaker1, name: e.target.value })}
              className="bg-neutral-50 border border-neutral-200 rounded-md px-2 py-0.5 text-xs text-neutral-900 font-semibold w-28 text-center focus:outline-none focus:border-neutral-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-neutral-500 block mb-1">Giọng nói</label>
              <select
                value={speaker1.voice}
                onChange={(e) => setSpeaker1({ ...speaker1, voice: e.target.value as VoiceName })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
              >
                {AI_VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-neutral-500 block mb-1">Tính cách/Ngữ điệu</label>
              <input
                type="text"
                value={speaker1.style}
                onChange={(e) => setSpeaker1({ ...speaker1, style: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>
        </div>

        {/* Speaker 2 Card */}
        <div className="p-3.5 rounded-xl bg-white border border-neutral-200 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-900 border border-neutral-300">
              Nhân vật 2
            </span>
            <input
              type="text"
              value={speaker2.name}
              onChange={(e) => setSpeaker2({ ...speaker2, name: e.target.value })}
              className="bg-neutral-50 border border-neutral-200 rounded-md px-2 py-0.5 text-xs text-neutral-900 font-semibold w-28 text-center focus:outline-none focus:border-neutral-900"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-neutral-500 block mb-1">Giọng nói</label>
              <select
                value={speaker2.voice}
                onChange={(e) => setSpeaker2({ ...speaker2, voice: e.target.value as VoiceName })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
              >
                {AI_VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] text-neutral-500 block mb-1">Tính cách/Ngữ điệu</label>
              <input
                type="text"
                value={speaker2.style}
                onChange={(e) => setSpeaker2({ ...speaker2, style: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-2 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick samples bar */}
      <div className="flex items-center justify-between text-xs text-neutral-600">
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-neutral-800" />
          Mẫu kịch bản nhanh:
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => loadSampleDialogue('podcast')}
            className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded transition-colors"
          >
            🎙️ Podcast Công nghệ
          </button>
          <button
            type="button"
            onClick={() => loadSampleDialogue('interview')}
            className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded transition-colors"
          >
            💼 Phỏng vấn xin việc
          </button>
          <button
            type="button"
            onClick={() => loadSampleDialogue('mystery')}
            className="px-2 py-0.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded transition-colors"
          >
            👻 Kịch bản trinh thám
          </button>
        </div>
      </div>

      {/* Turns list */}
      <div className="space-y-2.5">
        {turns.map((turn) => {
          const isSpk1 = turn.speaker === speaker1.name;
          return (
            <div
              key={turn.id}
              className={`p-3 rounded-xl border flex gap-3 transition-colors ${
                isSpk1 ? 'bg-white border-neutral-300' : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="w-24 shrink-0 flex flex-col justify-between">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded text-center truncate ${
                    isSpk1 ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-800'
                  }`}
                >
                  {turn.speaker}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setTurns(
                      turns.map((t) =>
                        t.id === turn.id
                          ? { ...t, speaker: isSpk1 ? speaker2.name : speaker1.name }
                          : t
                      )
                    )
                  }
                  className="text-[10px] text-neutral-500 hover:text-neutral-900 mt-2 text-center"
                >
                  Đổi vai ⇄
                </button>
              </div>

              <div className="flex-1">
                <textarea
                  rows={2}
                  value={turn.text}
                  onChange={(e) => updateTurnText(turn.id, e.target.value)}
                  placeholder={`Lời thoại của ${turn.speaker}... Có thể dùng <breath>, <laugh>, <gasp>`}
                  className="w-full bg-white border border-neutral-200 rounded-lg p-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={() => removeTurn(turn.id)}
                title="Xóa lượt thoại"
                className="self-center p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add turn buttons & Submit */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => addTurn(speaker1.name)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-200 rounded-lg text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm thoại {speaker1.name}
          </button>
          <button
            type="button"
            onClick={() => addTurn(speaker2.name)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 border border-neutral-200 rounded-lg text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm thoại {speaker2.name}
          </button>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-xs transition-all active:scale-95"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang tổng hợp song thoại...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Tạo Âm Thanh Song Thoại 2 Người
            </>
          )}
        </button>
      </div>
    </div>
  );
};
