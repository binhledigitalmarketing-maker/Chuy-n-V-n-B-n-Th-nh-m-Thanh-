import React from 'react';
import { VoiceName, VoiceProfile } from '../types';
import { AI_VOICES } from '../data/voices';
import { Check, Mic2, Play, Square, Loader2 } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoice: VoiceName;
  onSelect: (voice: VoiceName) => void;
  playingVoiceId: string | null;
  loadingVoiceId: string | null;
  onTogglePreview: (voice: VoiceProfile, e: React.MouseEvent) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelect,
  playingVoiceId,
  loadingVoiceId,
  onTogglePreview,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
          <Mic2 className="w-3.5 h-3.5 text-neutral-800" />
          Giọng Đọc Cốt Lõi (5 Âm Sắc)
        </label>
        <span className="text-[11px] text-neutral-500">Chuẩn Studio</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {AI_VOICES.map((voice) => {
          const isSelected = selectedVoice === voice.id;
          const isPlaying = playingVoiceId === voice.id;
          const isLoading = loadingVoiceId === voice.id;

          return (
            <div
              key={voice.id}
              onClick={() => onSelect(voice.id)}
              className={`group relative p-2.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-neutral-50/90 border-neutral-900 ring-1 ring-neutral-900 shadow-xs'
                  : 'bg-white border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50/60 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div
                    className={`w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-bold text-xs shadow-xs`}
                  >
                    {voice.id[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900 truncate">{voice.id}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-neutral-950 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-neutral-500 block truncate">
                      {voice.gender === 'female' ? 'Nữ' : 'Nam'}
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-neutral-600 line-clamp-1">{voice.tone}</p>
              </div>

              {/* Instant audition button */}
              <div className="mt-2 pt-1.5 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[9px] text-neutral-400 truncate max-w-[50px]">
                  {voice.bestFor.split(',')[0]}
                </span>

                <button
                  type="button"
                  onClick={(e) => onTogglePreview(voice, e)}
                  title={isPlaying ? 'Dừng' : 'Bấm nghe thử'}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                    isPlaying
                      ? 'bg-neutral-900 text-white'
                      : isLoading
                      ? 'bg-neutral-200 text-neutral-600'
                      : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  ) : isPlaying ? (
                    <Square className="w-2 h-2 fill-current" />
                  ) : (
                    <Play className="w-2 h-2 fill-current" />
                  )}
                  <span>{isPlaying ? 'Dừng' : 'Thử'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
