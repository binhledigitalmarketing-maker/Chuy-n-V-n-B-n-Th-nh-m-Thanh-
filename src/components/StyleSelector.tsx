import React, { useState } from 'react';
import { VOICE_STYLE_PRESETS } from '../data/voices';
import { Sliders, Edit3 } from 'lucide-react';

interface StyleSelectorProps {
  currentStyle: string;
  onSelectStyle: (stylePrompt: string) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  currentStyle,
  onSelectStyle,
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customStyleText, setCustomStyleText] = useState('');

  const handlePresetClick = (presetDesc: string) => {
    setIsCustomMode(false);
    onSelectStyle(presetDesc);
  };

  const handleCustomApply = () => {
    if (customStyleText.trim()) {
      onSelectStyle(customStyleText.trim());
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-neutral-800" />
          Phong Cách Biểu Cảm (Tone & Emotion)
        </label>
        <button
          type="button"
          onClick={() => setIsCustomMode(!isCustomMode)}
          className="text-[11px] text-neutral-600 hover:text-neutral-950 flex items-center gap-1 font-medium"
        >
          <Edit3 className="w-3 h-3" />
          {isCustomMode ? 'Xem mẫu' : 'Tự nhập'}
        </button>
      </div>

      {!isCustomMode ? (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {VOICE_STYLE_PRESETS.map((preset) => {
            const isSelected = currentStyle === preset.promptDescription;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetClick(preset.promptDescription)}
                className={`p-2 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-neutral-900 border-neutral-900 text-white shadow-xs'
                    : 'bg-white border-neutral-200/90 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300'
                }`}
              >
                <div className="text-base mb-0.5">{preset.icon}</div>
                <div className="text-[11px] font-semibold truncate">
                  {preset.name}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-neutral-200/90 rounded-xl p-2.5 flex items-center gap-2 shadow-xs">
          <input
            type="text"
            value={customStyleText}
            onChange={(e) => setCustomStyleText(e.target.value)}
            placeholder="VD: Giọng kể chuyện kiếm hiệp, hoặc giọng mẹ hiền dặn dò..."
            className="flex-1 bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCustomApply();
            }}
          />
          <button
            type="button"
            onClick={handleCustomApply}
            className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-medium transition-colors shrink-0"
          >
            Áp dụng
          </button>
        </div>
      )}
    </div>
  );
};
