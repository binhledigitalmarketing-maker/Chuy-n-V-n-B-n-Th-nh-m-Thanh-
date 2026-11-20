import React from 'react';
import { TrendingVoicePersona } from '../types';
import { TRENDING_VOICE_PERSONAS } from '../data/voices';
import { Sparkles, Play, Square, Loader2 } from 'lucide-react';

interface TrendingVoicesBarProps {
  selectedPersonaId: string | null;
  onSelectPersona: (persona: TrendingVoicePersona) => void;
  playingPersonaId: string | null;
  loadingPersonaId: string | null;
  onTogglePreview: (persona: TrendingVoicePersona, e: React.MouseEvent) => void;
}

export const TrendingVoicesBar: React.FC<TrendingVoicesBarProps> = ({
  selectedPersonaId,
  onSelectPersona,
  playingPersonaId,
  loadingPersonaId,
  onTogglePreview,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-neutral-800" />
          Giọng Đọc Đang Thịnh Hành (Hot Trend)
        </label>
        <span className="text-[11px] text-neutral-500 flex items-center gap-1">
          Bấm nút ▶ để nghe thử giọng mẫu
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {TRENDING_VOICE_PERSONAS.map((p) => {
          const isSelected = selectedPersonaId === p.id;
          const isPlaying = playingPersonaId === p.id;
          const isLoading = loadingPersonaId === p.id;

          return (
            <div
              key={p.id}
              onClick={() => onSelectPersona(p)}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all relative flex flex-col justify-between group ${
                isSelected
                  ? 'bg-neutral-50/90 border-neutral-900 ring-1 ring-neutral-900 shadow-sm'
                  : 'bg-white border-neutral-200/90 hover:bg-neutral-50/80 hover:border-neutral-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xl leading-none">{p.icon}</span>
                  {p.badge ? (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-neutral-900 text-white font-medium">
                      {p.badge}
                    </span>
                  ) : (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600 font-medium">
                      {p.accent}
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-neutral-900 line-clamp-1">{p.name}</div>
                <div className="text-[10px] text-neutral-500 line-clamp-1">{p.tag}</div>
              </div>

              {/* Instant Preview Button */}
              <div className="mt-2.5 pt-2 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400 truncate max-w-[75px]">
                  {p.baseVoice}
                </span>

                <button
                  type="button"
                  onClick={(e) => onTogglePreview(p, e)}
                  title={isPlaying ? 'Dừng' : 'Bấm nghe thử'}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold transition-all ${
                    isPlaying
                      ? 'bg-neutral-900 text-white animate-pulse'
                      : isLoading
                      ? 'bg-neutral-200 text-neutral-600 cursor-wait'
                      : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-900 hover:text-white border border-neutral-200'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      <span>...</span>
                    </>
                  ) : isPlaying ? (
                    <>
                      <Square className="w-2 h-2 fill-current" />
                      <span>Dừng</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-2 h-2 fill-current" />
                      <span>Thử</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
