import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Download,
  Volume2,
  VolumeX,
  Share2,
  Check,
  Radio,
} from 'lucide-react';
import { GeneratedAudioItem } from '../types';
import { AudioVisualizer } from './AudioVisualizer';
import {
  buildSafeAudioFilename,
  createBlobUrlFromBase64,
  estimateWavSizeFromBase64,
  formatFileSize,
  getServerDownloadHref,
  triggerAudioDownload,
} from '../utils/audioDownload';

interface AudioPlayerProps {
  item: GeneratedAudioItem | null;
  onDownloaded?: (filename: string) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ item, onDownloaded }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const playableSrc = useMemo(() => {
    if (!item) return '';
    if (item.audioBase64) {
      return createBlobUrlFromBase64(item.audioBase64, item.mimeType || 'audio/wav');
    }
    return item.audioUrl || '';
  }, [item?.id, item?.audioBase64, item?.audioUrl, item?.mimeType]);

  useEffect(() => {
    return () => {
      if (playableSrc && playableSrc.startsWith('blob:')) {
        URL.revokeObjectURL(playableSrc);
      }
    };
  }, [playableSrc]);

  useEffect(() => {
    if (audioRef.current && playableSrc) {
      audioRef.current.src = playableSrc;
      audioRef.current.playbackRate = playbackRate;
      setCurrentTime(0);
      setIsDownloaded(false);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      }
    }
  }, [playableSrc]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const skipTime = (seconds: number) => {
    if (audioRef.current) {
      const nextTime = Math.min(Math.max(0, audioRef.current.currentTime + seconds), duration);
      audioRef.current.currentTime = nextTime;
      setCurrentTime(nextTime);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = () => {
    if (!item) return;
    const result = triggerAudioDownload(item);
    if (result.ok) {
      setIsDownloaded(true);
      onDownloaded?.(result.filename);
      setTimeout(() => setIsDownloaded(false), 2500);
    }
  };

  const handleCopyText = () => {
    if (!item?.text) return;
    navigator.clipboard.writeText(item.text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!item) {
    return (
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 text-center text-neutral-500 flex flex-col items-center justify-center min-h-[160px] shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-700 mb-2.5">
          <Radio className="w-6 h-6 animate-pulse" />
        </div>
        <h4 className="text-sm font-semibold text-neutral-900">Sẵn Sàng Phát Âm Thanh</h4>
        <p className="text-xs text-neutral-500 mt-1 max-w-xs">
          Bấm <strong className="text-neutral-900 font-semibold">"Tạo Toàn Bộ Âm Thanh"</strong> để nghe và tải tệp WAV về máy.
        </p>
      </div>
    );
  }

  const fileSizeLabel = formatFileSize(item.fileSizeBytes ?? estimateWavSizeFromBase64(item.audioBase64));
  const serverDownloadHref = getServerDownloadHref(item);
  const safeFilename = buildSafeAudioFilename(item);

  return (
    <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-sm relative overflow-hidden">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Track info & download */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
            {item.voice[0]}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-neutral-900 truncate">{item.title}</h4>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-800 border border-neutral-200 font-medium shrink-0">
                {item.voice}
              </span>
              {item.chunksCount && item.chunksCount > 1 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-700 border border-neutral-200 font-medium shrink-0">
                  {item.chunksCount} đoạn
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-500 truncate mt-0.5">{item.style}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyText}
            title="Sao chép kịch bản"
            className="p-1.5 text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 border border-neutral-200 rounded-lg transition-colors text-xs flex items-center gap-1"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-neutral-900" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            title={`Tải tệp ${safeFilename}`}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            {isDownloaded ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
            <span>{isDownloaded ? 'Đã tải!' : 'Tải WAV'}</span>
            {fileSizeLabel && !isDownloaded && (
              <span className="text-[10px] font-medium text-neutral-300">({fileSizeLabel})</span>
            )}
          </button>
        </div>
      </div>

      {/* Visualizer Waveform */}
      <div className="mb-3">
        <AudioVisualizer isPlaying={isPlaying} barCount={42} />
      </div>

      {/* Progress Slider */}
      <div className="space-y-1 mb-3">
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-neutral-900 focus:outline-none"
        />
        <div className="flex justify-between text-[11px] text-neutral-500 font-mono">
          <span>{formatTime(currentTime)}</span>
          <div className="flex items-center gap-2">
            {serverDownloadHref && (
              <a
                href={serverDownloadHref}
                download={safeFilename}
                className="font-sans text-[10px] text-neutral-500 hover:text-neutral-900 underline underline-offset-2"
              >
                Tải trực tiếp (.wav)
              </a>
            )}
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {/* Playback Controls & Speed */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => skipTime(-5)}
            title="Tua lùi 5s"
            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={togglePlay}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm ${
              isPlaying
                ? 'bg-neutral-900 text-white ring-2 ring-neutral-300'
                : 'bg-neutral-900 text-white hover:bg-neutral-800'
            }`}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          <button
            onClick={() => skipTime(5)}
            title="Tua tới 5s"
            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 text-[11px]">
          {[0.8, 1.0, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => setPlaybackRate(rate)}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                playbackRate === rate
                  ? 'bg-white text-neutral-900 font-bold shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Volume */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1 text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-14 h-1 bg-neutral-200 rounded appearance-none cursor-pointer accent-neutral-900"
          />
        </div>
      </div>
    </div>
  );
};
