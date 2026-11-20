import React, { useState } from 'react';
import { GeneratedAudioItem } from '../types';
import { Download, Trash2, Clock, Volume2, X, Check } from 'lucide-react';
import { estimateWavSizeFromBase64, formatFileSize, triggerAudioDownload } from '../utils/audioDownload';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: GeneratedAudioItem[];
  onSelectItem: (item: GeneratedAudioItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  activeItemId?: string;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onSelectItem,
  onDeleteItem,
  onClearAll,
  activeItemId,
}) => {
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white border-l border-neutral-200 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-900" />
            <h3 className="text-sm font-bold text-neutral-900">
              Lịch Sử Giọng Đọc Đã Tạo ({items.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        {items.length > 0 && (
          <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
            <span>Bấm vào để nghe lại hoặc tải file</span>
            <button
              onClick={onClearAll}
              className="text-neutral-700 hover:text-neutral-950 font-medium transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Xóa tất cả
            </button>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-neutral-400 p-6">
              <Volume2 className="w-10 h-10 stroke-1 mb-2.5 text-neutral-300" />
              <p className="text-sm font-medium text-neutral-700">Chưa có bản ghi nào.</p>
              <p className="text-xs text-neutral-400 mt-1">Các đoạn đọc âm thanh bạn tạo sẽ xuất hiện tại đây.</p>
            </div>
          ) : (
            items.map((item) => {
              const isActive = activeItemId === item.id;
              const sizeLabel = formatFileSize(item.fileSizeBytes ?? estimateWavSizeFromBase64(item.audioBase64));
              const timeString = new Date(item.createdAt).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? 'bg-neutral-50 border-neutral-900 ring-1 ring-neutral-900 shadow-xs'
                      : 'bg-white border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50/50 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-neutral-900 flex items-center justify-center text-white text-[11px] font-bold">
                        {item.voice[0]}
                      </div>
                      <span className="text-xs font-bold text-neutral-900">
                        {item.voice} {item.isDialogue && '• Song Thoại'}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400">{timeString}</span>
                  </div>

                  <p className="text-xs text-neutral-700 line-clamp-2 mb-2 font-normal">
                    {item.text}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                    <span className="text-[11px] text-neutral-400">
                      {item.wordCount} từ • {item.charCount} ký tự{sizeLabel ? ` • ${sizeLabel}` : ''}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const res = triggerAudioDownload(item);
                          if (res.ok) {
                            setDownloadedId(item.id);
                            setTimeout(() => setDownloadedId(null), 2000);
                          }
                        }}
                        title="Tải WAV về máy"
                        className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-neutral-700 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200/70 rounded-md transition-colors"
                      >
                        {downloadedId === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-neutral-900" />
                            <span>Đã tải</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-3 h-3" />
                            <span>Tải</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item.id);
                        }}
                        title="Xóa"
                        className="p-1 text-neutral-400 hover:text-neutral-900 rounded hover:bg-neutral-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
