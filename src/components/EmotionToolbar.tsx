import React, { useState } from 'react';
import { Wand2, Loader2, Feather } from 'lucide-react';

interface EmotionToolbarProps {
  onInsertTag: (tag: string) => void;
  onEnhanceScript: (tone: string) => Promise<void>;
  isEnhancing: boolean;
}

export const EmotionToolbar: React.FC<EmotionToolbarProps> = ({
  onInsertTag,
  onEnhanceScript,
  isEnhancing,
}) => {
  const [showEnhanceMenu, setShowEnhanceMenu] = useState(false);

  const tags = [
    { label: 'Thở nhẹ', tag: '<breath>', icon: '💨', tip: 'Nhịp thở lấy hơi tự nhiên' },
    { label: 'Cười mỉm', tag: '<laugh>', icon: '😄', tip: 'Tiếng cười tự nhiên' },
    { label: 'Thở gấp', tag: '<gasp>', icon: '😮', tip: 'Thở hắt ngạc nhiên' },
    { label: 'Đồng ý', tag: '|yeah|', icon: '👍', tip: 'Âm cảm thán tự nhiên' },
    { label: 'Gật gù', tag: '|mhm|', icon: '👌', tip: 'Âm đệm lắng nghe' },
    { label: 'Nghỉ nhịp', tag: '... ', icon: '⏱️', tip: 'Nghỉ 0.5s tạo chiều sâu' },
  ];

  const handleEnhanceClick = async (tone: string) => {
    setShowEnhanceMenu(false);
    await onEnhanceScript(tone);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-neutral-50 border border-neutral-200 rounded-xl">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-bold text-neutral-700 mr-1 flex items-center gap-1">
          <Feather className="w-3 h-3 text-neutral-800" />
          Chèn biểu cảm tự nhiên:
        </span>
        {tags.map((item) => (
          <button
            key={item.tag}
            type="button"
            onClick={() => onInsertTag(item.tag)}
            title={item.tip}
            className="flex items-center gap-1 px-2 py-1 bg-white hover:bg-neutral-100 border border-neutral-200/90 rounded-md text-xs text-neutral-800 transition-colors shadow-2xs active:scale-95"
          >
            <span className="text-xs">{item.icon}</span>
            <span className="font-mono text-[11px] font-medium text-neutral-900">{item.tag}</span>
          </button>
        ))}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowEnhanceMenu(!showEnhanceMenu)}
          disabled={isEnhancing}
          className="flex items-center gap-1.5 px-3 py-1 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
        >
          {isEnhancing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Đang tối ưu...
            </>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5" />
              Đạo diễn AI (Thêm nhịp thở)
            </>
          )}
        </button>

        {showEnhanceMenu && (
          <div className="absolute right-0 bottom-full mb-2 w-64 bg-white border border-neutral-200 rounded-xl shadow-xl p-2 z-30 space-y-1">
            <div className="px-2 py-1 text-[11px] font-bold text-neutral-500 border-b border-neutral-100">
              Chọn phong cách tối ưu kịch bản:
            </div>
            <button
              onClick={() => handleEnhanceClick('movie-review')}
              className="w-full text-left px-2.5 py-1.5 text-xs text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors flex items-center justify-between"
            >
              <span>🎬 Review Phim Kịch Tính</span>
              <span className="text-[10px] text-neutral-400">&lt;gasp&gt;</span>
            </button>
            <button
              onClick={() => handleEnhanceClick('podcast-calm')}
              className="w-full text-left px-2.5 py-1.5 text-xs text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors flex items-center justify-between"
            >
              <span>☕ Podcast Chữa Lành</span>
              <span className="text-[10px] text-neutral-400">&lt;breath&gt;</span>
            </button>
            <button
              onClick={() => handleEnhanceClick('tiktok-viral')}
              className="w-full text-left px-2.5 py-1.5 text-xs text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors flex items-center justify-between"
            >
              <span>⚡ TikTok Năng Lượng</span>
              <span className="text-[10px] text-neutral-400">&lt;laugh&gt;</span>
            </button>
            <button
              onClick={() => handleEnhanceClick('storytelling')}
              className="w-full text-left px-2.5 py-1.5 text-xs text-neutral-800 hover:bg-neutral-100 rounded-lg transition-colors flex items-center justify-between"
            >
              <span>📖 Kể Chuyện Tự Nhiên</span>
              <span className="text-[10px] text-neutral-400">Ngắt nghỉ</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
