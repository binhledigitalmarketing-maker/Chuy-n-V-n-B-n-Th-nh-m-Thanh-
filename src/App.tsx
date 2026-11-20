import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Sparkles,
  History,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Users,
  Zap,
  Globe2,
  Trash2,
  Headphones,
  Square,
  Code2,
  Download,
} from 'lucide-react';
import { VoiceName, VoiceProfile, GeneratedAudioItem, DialogueTurn, TrendingVoicePersona } from './types';
import { AI_VOICES, VOICE_STYLE_PRESETS, TRENDING_VOICE_PERSONAS } from './data/voices';
import { TrendingVoicesBar } from './components/TrendingVoicesBar';
import { VoiceSelector } from './components/VoiceSelector';
import { StyleSelector } from './components/StyleSelector';
import { EmotionToolbar } from './components/EmotionToolbar';
import { AudioPlayer } from './components/AudioPlayer';
import { DialogueMode } from './components/DialogueMode';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ApiIntegrationModal } from './components/ApiIntegrationModal';
import {
  buildSafeAudioFilename,
  createBlobUrlFromBase64,
  estimateWavSizeFromBase64,
  formatFileSize,
  getServerDownloadHref,
  triggerAudioDownload,
} from './utils/audioDownload';

export default function App() {
  const [activeTab, setActiveTab] = useState<'single' | 'dialogue'>('single');

  // Single speaker state
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(TRENDING_VOICE_PERSONAS[0].id);
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>(TRENDING_VOICE_PERSONAS[0].baseVoice);
  const [selectedStyle, setSelectedStyle] = useState<string>(TRENDING_VOICE_PERSONAS[0].stylePrompt);
  const [accent, setAccent] = useState<'Toàn quốc' | 'Bắc' | 'Nam' | 'Trung'>('Bắc');
  const [text, setText] = useState<string>(TRENDING_VOICE_PERSONAS[0].sampleText);
  const [speed, setSpeed] = useState<number>(1.0);
  const [chosenModel, setChosenModel] = useState<'gemini-3.8-flash-lite-tts' | 'gemini-3.8-flash-tts'>(
    'gemini-3.8-flash-tts'
  );

  // Status & loading
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Instant Quick Audition state
  const [playingPersonaId, setPlayingPersonaId] = useState<string | null>(null);
  const [loadingPersonaId, setLoadingPersonaId] = useState<string | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [loadingVoiceId, setLoadingVoiceId] = useState<string | null>(null);
  const [isSentenceAuditioning, setIsSentenceAuditioning] = useState(false);

  // Preview Audio element ref & downloadable audition item
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const previewBlobUrlRef = useRef<string | null>(null);
  const [previewAudioItem, setPreviewAudioItem] = useState<GeneratedAudioItem | null>(null);

  // Audio history & active player
  const [historyItems, setHistoryItems] = useState<GeneratedAudioItem[]>(() => {
    try {
      const saved = localStorage.getItem('vocalis_history');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((item: GeneratedAudioItem) => ({
        ...item,
        audioUrl: '',
        fileId: undefined,
        downloadUrl: undefined,
        fileSizeBytes: item.fileSizeBytes ?? estimateWavSizeFromBase64(item.audioBase64),
      }));
    } catch {
      return [];
    }
  });
  const [activeAudioItem, setActiveAudioItem] = useState<GeneratedAudioItem | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const playPreviewBase64 = async (base64: string, mimeType = 'audio/wav') => {
    if (!previewAudioRef.current) return;
    if (previewBlobUrlRef.current) {
      URL.revokeObjectURL(previewBlobUrlRef.current);
      previewBlobUrlRef.current = null;
    }
    const blobUrl = createBlobUrlFromBase64(base64, mimeType);
    previewBlobUrlRef.current = blobUrl;
    previewAudioRef.current.src = blobUrl;
    await previewAudioRef.current.play();
  };

  // Initialize preview audio element
  useEffect(() => {
    const audio = new Audio();
    audio.onended = () => {
      setPlayingPersonaId(null);
      setPlayingVoiceId(null);
      setIsSentenceAuditioning(false);
    };
    audio.onerror = () => {
      setPlayingPersonaId(null);
      setPlayingVoiceId(null);
      setIsSentenceAuditioning(false);
    };
    previewAudioRef.current = audio;

    return () => {
      audio.pause();
      if (previewBlobUrlRef.current) {
        URL.revokeObjectURL(previewBlobUrlRef.current);
        previewBlobUrlRef.current = null;
      }
    };
  }, []);

  // Save history to localStorage without redundant data URLs or stale session fileIds
  useEffect(() => {
    try {
      const serializable = historyItems.map(({ audioUrl: _url, fileId: _fid, downloadUrl: _dl, ...rest }) => ({
        ...rest,
        audioUrl: '',
      }));
      let sliceCount = serializable.length;
      while (sliceCount > 0) {
        const json = JSON.stringify(serializable.slice(0, sliceCount));
        if (json.length <= 3_500_000) {
          localStorage.setItem('vocalis_history', json);
          return;
        }
        sliceCount -= 1;
      }
      localStorage.removeItem('vocalis_history');
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }, [historyItems]);

  // Handle selecting a trending persona
  const handleSelectPersona = (persona: TrendingVoicePersona) => {
    setSelectedPersonaId(persona.id);
    setSelectedVoice(persona.baseVoice);
    setSelectedStyle(persona.stylePrompt);
    setAccent(persona.accent);
    if (!text.trim() || TRENDING_VOICE_PERSONAS.some((p) => p.sampleText === text)) {
      setText(persona.sampleText);
    }
    setSuccessNotice(`Đã chọn: "${persona.name}"`);
    setTimeout(() => setSuccessNotice(null), 2500);
  };

  // Client-side Web Speech fallback engine (zero quota, 100% reliable)
  const speakWithFallbackWebVoice = (
    textToSpeak: string,
    voiceName: VoiceName,
    rate = 1.0,
    onFinish?: () => void
  ): boolean => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }

    try {
      window.speechSynthesis.cancel();
      const clean = textToSpeak
        .replace(/<[^>]+>/g, ' ')
        .replace(/\|[^|]+\|/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const utter = new SpeechSynthesisUtterance(clean);
      utter.lang = 'vi-VN';
      utter.rate = rate;

      const voices = window.speechSynthesis.getVoices();
      const viVoices = voices.filter((v) => v.lang.startsWith('vi') || v.lang.includes('VIE'));
      if (viVoices.length > 0) {
        if (voiceName === 'Kore' || voiceName === 'Puck' || voiceName === 'Zephyr') {
          const female = viVoices.find(
            (v) =>
              v.name.toLowerCase().includes('female') ||
              v.name.toLowerCase().includes('hoai my') ||
              v.name.toLowerCase().includes('linh') ||
              v.name.toLowerCase().includes('nu')
          );
          utter.voice = female || viVoices[0];
        } else {
          const male = viVoices.find(
            (v) => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('nam')
          );
          utter.voice = male || viVoices[0];
        }
      }

      utter.onend = () => {
        if (onFinish) onFinish();
      };
      utter.onerror = () => {
        if (onFinish) onFinish();
      };

      window.speechSynthesis.speak(utter);
      return true;
    } catch {
      return false;
    }
  };

  // Instant Audition for Trending Persona
  const handleTogglePersonaPreview = async (persona: TrendingVoicePersona, e: React.MouseEvent) => {
    e.stopPropagation();

    if (playingPersonaId === persona.id) {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setPlayingPersonaId(null);
      return;
    }

    if (previewAudioRef.current) previewAudioRef.current.pause();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setPlayingPersonaId(null);
    setPlayingVoiceId(null);
    setIsSentenceAuditioning(false);

    setLoadingPersonaId(persona.id);

    try {
      const res = await fetch('/api/tts/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceName: persona.baseVoice,
          text: persona.sampleText,
          style: persona.stylePrompt,
          accent: persona.accent,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error || data.quotaExceeded) {
        throw new Error(data.error || 'Lỗi nghe thử');
      }

      await playPreviewBase64(data.audioBase64, data.mimeType || 'audio/wav');
      setPlayingPersonaId(persona.id);
    } catch (err: any) {
      console.warn('Fallback preview:', err);
      speakWithFallbackWebVoice(persona.sampleText, persona.baseVoice, 1.0, () => {
        setPlayingPersonaId(null);
      });
      setPlayingPersonaId(persona.id);
    } finally {
      setLoadingPersonaId(null);
    }
  };

  // Instant Audition for Core Voice
  const handleToggleVoicePreview = async (voice: VoiceProfile, e: React.MouseEvent) => {
    e.stopPropagation();

    if (playingVoiceId === voice.id) {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setPlayingVoiceId(null);
      return;
    }

    if (previewAudioRef.current) previewAudioRef.current.pause();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setPlayingPersonaId(null);
    setPlayingVoiceId(null);
    setIsSentenceAuditioning(false);

    setLoadingVoiceId(voice.id);

    try {
      const res = await fetch('/api/tts/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceName: voice.id,
          text: voice.previewPrompt || 'Xin chào, tôi là giọng đọc AI của bạn.',
          style: 'Tự nhiên, ấm áp, truyền cảm',
          accent,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error || data.quotaExceeded) {
        throw new Error(data.error || 'Lỗi nghe thử');
      }

      await playPreviewBase64(data.audioBase64, data.mimeType || 'audio/wav');
      setPlayingVoiceId(voice.id);
    } catch (err: any) {
      console.warn('Fallback preview:', err);
      speakWithFallbackWebVoice(voice.previewPrompt || 'Xin chào.', voice.id, 1.0, () => {
        setPlayingVoiceId(null);
      });
      setPlayingVoiceId(voice.id);
    } finally {
      setLoadingVoiceId(null);
    }
  };

  // Audition First Sentence of User's Current Script
  const handleAuditionSentence = async () => {
    if (!text.trim()) {
      setErrorMessage('Vui lòng nhập văn bản để nghe thử.');
      return;
    }

    if (isSentenceAuditioning) {
      if (previewAudioRef.current) previewAudioRef.current.pause();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      setIsSentenceAuditioning(false);
      return;
    }

    const firstSentenceMatch = text.trim().match(/[^.!?…\n]+[.!?…]*/);
    const sentenceToPreview = firstSentenceMatch ? firstSentenceMatch[0].trim() : text.trim().slice(0, 100);

    if (previewAudioRef.current) previewAudioRef.current.pause();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setPlayingPersonaId(null);
    setPlayingVoiceId(null);
    setIsSentenceAuditioning(true);

    try {
      const res = await fetch('/api/tts/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voiceName: selectedVoice,
          text: sentenceToPreview,
          style: selectedStyle,
          accent,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error || data.quotaExceeded) {
        throw new Error(data.error || 'Lỗi nghe thử');
      }

      const auditionItem: GeneratedAudioItem = {
        id: `preview-${Date.now()}`,
        title: `Nghe thử (${selectedVoice})`,
        text: sentenceToPreview,
        voice: selectedVoice,
        style: selectedStyle,
        audioUrl: '',
        audioBase64: data.audioBase64,
        mimeType: data.mimeType || 'audio/wav',
        fileId: data.fileId,
        downloadUrl: data.downloadUrl,
        fileSizeBytes: data.fileSizeBytes ?? estimateWavSizeFromBase64(data.audioBase64),
        createdAt: Date.now(),
        wordCount: sentenceToPreview.split(/\s+/).filter(Boolean).length,
        charCount: sentenceToPreview.length,
        isDialogue: false,
      };
      setPreviewAudioItem(auditionItem);
      await playPreviewBase64(data.audioBase64, data.mimeType || 'audio/wav');
    } catch (err: any) {
      console.warn('Audition fallback to web speech:', err);
      const spoke = speakWithFallbackWebVoice(sentenceToPreview, selectedVoice, speed, () => {
        setIsSentenceAuditioning(false);
      });
      if (!spoke) {
        setIsSentenceAuditioning(false);
        setErrorMessage('Không thể nghe thử câu này.');
      } else {
        setSuccessNotice('💡 Đang phát qua giọng đọc dự phòng Web Voice.');
        setTimeout(() => setSuccessNotice(null), 3000);
      }
    }
  };

  // Insert emotional tag at cursor
  const handleInsertTag = (tag: string) => {
    if (!textareaRef.current) {
      setText((prev) => prev + ' ' + tag);
      return;
    }
    const elem = textareaRef.current;
    const start = elem.selectionStart;
    const end = elem.selectionEnd;
    const current = text;
    const newText = current.substring(0, start) + ' ' + tag + ' ' + current.substring(end);
    setText(newText);
    setTimeout(() => {
      elem.focus();
      elem.setSelectionRange(start + tag.length + 2, start + tag.length + 2);
    }, 50);
  };

  // AI Script Director
  const handleEnhanceScript = async (targetTone: string) => {
    if (!text.trim()) {
      setErrorMessage('Vui lòng nhập văn bản trước khi tối ưu kịch bản.');
      return;
    }
    setIsEnhancing(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/tts/enhance-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetTone }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Không thể tối ưu kịch bản.');
      }

      if (data.enhancedScript) {
        setText(data.enhancedScript);
        setSuccessNotice('✨ Đã thêm nhịp thở và ngắt nghỉ tự nhiên!');
        setTimeout(() => setSuccessNotice(null), 3000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi kết nối với AI Studio.');
    } finally {
      setIsEnhancing(false);
    }
  };

  // High-speed Single Speaker Synthesis
  const handleGenerateSingle = async () => {
    if (!text.trim()) {
      setErrorMessage('Vui lòng nhập nội dung văn bản cần chuyển thành âm thanh.');
      return;
    }

    if (previewAudioRef.current) previewAudioRef.current.pause();
    setPlayingPersonaId(null);
    setPlayingVoiceId(null);
    setIsSentenceAuditioning(false);

    setIsGenerating(true);
    setErrorMessage(null);
    const estChunks = Math.ceil(text.length / 450);
    if (estChunks > 1) {
      setGenerationProgress(`Đang xử lý ${estChunks} đoạn song song...`);
    } else {
      setGenerationProgress('Đang tổng hợp âm thanh...');
    }

    try {
      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voiceName: selectedVoice,
          style: selectedStyle,
          accent,
          model: chosenModel,
          speed,
          language: 'vi',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error || data.quotaExceeded) {
        if (data.quotaExceeded || (data.error && (data.error.includes('chịu tải') || data.error.includes('quota')))) {
          speakWithFallbackWebVoice(text.trim(), selectedVoice, speed);
          setSuccessNotice('💡 Đang phát trực tiếp qua giọng đọc dự phòng Web Voice (do hạn ngạch Gemini hôm nay đã đạt giới hạn).');
          setTimeout(() => setSuccessNotice(null), 5000);
          return;
        }
        throw new Error(data.error || 'Lỗi tạo âm thanh.');
      }

      const mimeType = data.mimeType || 'audio/wav';
      const persona = TRENDING_VOICE_PERSONAS.find((p) => p.id === selectedPersonaId);
      const titleName = persona ? persona.name : `Giọng ${selectedVoice}`;

      const newItem: GeneratedAudioItem = {
        id: String(Date.now()),
        title: `${titleName} (${data.wordCount} từ)`,
        text: text.trim(),
        voice: selectedVoice,
        style: selectedStyle,
        audioUrl: '',
        audioBase64: data.audioBase64,
        mimeType,
        fileId: data.fileId,
        downloadUrl: data.downloadUrl,
        fileSizeBytes: data.fileSizeBytes ?? estimateWavSizeFromBase64(data.audioBase64),
        createdAt: Date.now(),
        wordCount: data.wordCount || text.split(/\s+/).length,
        charCount: data.charCount || text.length,
        chunksCount: data.chunksCount,
        isDialogue: false,
      };

      setPreviewAudioItem(null);
      setActiveAudioItem(newItem);
      setHistoryItems((prev) => [newItem, ...prev.slice(0, 24)]);
      setSuccessNotice(
        data.chunksCount && data.chunksCount > 1
          ? `🎉 Đã tạo ${data.chunksCount} đoạn (${data.wordCount} từ) thành công! Bấm "Tải WAV" để lưu về máy.`
          : '🎉 Đã tạo giọng đọc thành công! Bấm "Tải WAV" để lưu về máy.'
      );
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Đã xảy ra lỗi khi tạo âm thanh.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  // Dual-Speaker Dialogue Synthesis
  const handleGenerateDialogue = async (turns: DialogueTurn[], spk1: any, spk2: any) => {
    setIsGenerating(true);
    setErrorMessage(null);
    setGenerationProgress('Đang tổng hợp song thoại...');

    try {
      const res = await fetch('/api/tts/dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turns,
          speaker1: spk1,
          speaker2: spk2,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Lỗi tạo âm thanh đối thoại.');
      }

      const mimeType = data.mimeType || 'audio/wav';
      const combinedText = turns.map((t) => `${t.speaker}: ${t.text}`).join('\n');
      const newItem: GeneratedAudioItem = {
        id: String(Date.now()),
        title: `Song thoại: ${spk1.name} & ${spk2.name} (${turns.length} câu)`,
        text: combinedText,
        voice: spk1.voice,
        style: `Đối thoại ${spk1.name} & ${spk2.name}`,
        audioUrl: '',
        audioBase64: data.audioBase64,
        mimeType,
        fileId: data.fileId,
        downloadUrl: data.downloadUrl,
        fileSizeBytes: data.fileSizeBytes ?? estimateWavSizeFromBase64(data.audioBase64),
        createdAt: Date.now(),
        wordCount: combinedText.split(/\s+/).length,
        charCount: combinedText.length,
        isDialogue: true,
      };

      setActiveAudioItem(newItem);
      setHistoryItems((prev) => [newItem, ...prev.slice(0, 24)]);
      setSuccessNotice('🎙️ Đã tạo âm thanh đối thoại thành công! Bấm "Tải WAV" để lưu về máy.');
      setTimeout(() => setSuccessNotice(null), 4000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Lỗi khi tạo âm thanh đối thoại.');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  // Text metrics
  const wordCount = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = text.length;
  const estimatedSeconds = Math.round(wordCount / 2.6);
  const estMins = Math.floor(estimatedSeconds / 60);
  const estSecs = estimatedSeconds % 60;
  const estimatedChunks = Math.ceil(charCount / 450);

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-neutral-200/90 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center text-white shadow-xs">
              <Mic className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight">
                  Chuyển Văn Bản Thành Âm Thanh
                </h1>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-300 font-semibold flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-neutral-900" /> Nghe Thử Nhanh
                </span>
              </div>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-0.5 bg-neutral-100 border border-neutral-200 rounded-lg">
            <button
              onClick={() => setActiveTab('single')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'single'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Mic className="w-3 h-3" />
              <span>Đơn Thoại</span>
            </button>
            <button
              onClick={() => setActiveTab('dialogue')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'dialogue'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Song Thoại 2 Người</span>
            </button>
          </div>

          {/* Actions: API & Claude + History */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsApiModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-300 transition-colors shadow-2xs"
            >
              <Code2 className="w-3.5 h-3.5 text-neutral-900" />
              <span>API & Claude AI</span>
            </button>

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-700 bg-white hover:bg-neutral-100 border border-neutral-200 transition-colors shadow-2xs"
            >
              <History className="w-3.5 h-3.5 text-neutral-700" />
              <span className="hidden sm:inline">Lịch sử</span>
              <span className="px-1.5 py-0.2 rounded-full bg-neutral-900 text-[10px] text-white font-bold">
                {historyItems.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Notifications */}
      {errorMessage && (
        <div className="max-w-5xl mx-auto px-4 mt-3 w-full">
          <div className="p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-neutral-700 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-neutral-500 hover:text-neutral-900 px-2 font-medium">
              Đóng
            </button>
          </div>
        </div>
      )}

      {successNotice && (
        <div className="max-w-5xl mx-auto px-4 mt-3 w-full">
          <div className="p-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-xs flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-neutral-900 shrink-0" />
            <span>{successNotice}</span>
          </div>
        </div>
      )}

      {/* Main Studio Body - Clean White Minimalist Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 w-full flex-1">
        {activeTab === 'single' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column (7 cols): Trending voices + Editor + Action */}
            <div className="lg:col-span-7 space-y-4">
              {/* 1. Trending Personas Section */}
              <div className="p-3.5 bg-white border border-neutral-200/90 rounded-2xl shadow-xs">
                <TrendingVoicesBar
                  selectedPersonaId={selectedPersonaId}
                  onSelectPersona={handleSelectPersona}
                  playingPersonaId={playingPersonaId}
                  loadingPersonaId={loadingPersonaId}
                  onTogglePreview={handleTogglePersonaPreview}
                />
              </div>

              {/* 2. Text Editor Section */}
              <div className="p-4 bg-white border border-neutral-200/90 rounded-2xl shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-neutral-800" />
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                      Nội Dung Văn Bản (Không Giới Hạn)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {text.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setText('')}
                        className="text-neutral-400 hover:text-neutral-900 flex items-center gap-1 text-[11px] px-2 py-0.5 rounded hover:bg-neutral-100 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Xóa
                      </button>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    rows={7}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Nhập hoặc dán văn bản cần đọc..."
                    className="w-full bg-neutral-50/70 border border-neutral-200 rounded-xl p-3.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:bg-white leading-relaxed font-sans transition-colors"
                  />
                </div>

                {/* Vocal Bursts Toolbar */}
                <EmotionToolbar
                  onInsertTag={handleInsertTag}
                  onEnhanceScript={handleEnhanceScript}
                  isEnhancing={isEnhancing}
                />

                {/* Metrics bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500 pt-1">
                  <div className="flex items-center gap-2.5">
                    <span>
                      Từ: <strong className="text-neutral-800">{wordCount}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Ký tự: <strong className="text-neutral-800">{charCount}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Thời lượng ước tính: <strong className="text-neutral-900 font-mono">{estMins}:{estSecs.toString().padStart(2, '0')}</strong>
                    </span>
                  </div>

                  {estimatedChunks > 1 && (
                    <span className="text-neutral-900 font-medium">
                      ⚡ Xử lý {estimatedChunks} đoạn song song
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
                  {/* Quick Audition Button */}
                  <button
                    type="button"
                    onClick={handleAuditionSentence}
                    disabled={isGenerating || !text.trim()}
                    className={`sm:col-span-5 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] border ${
                      isSentenceAuditioning
                        ? 'bg-neutral-900 text-white border-neutral-900 animate-pulse'
                        : 'bg-white text-neutral-900 hover:bg-neutral-100 border-neutral-300 shadow-2xs'
                    }`}
                  >
                    {isSentenceAuditioning ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Dừng Nghe Thử</span>
                      </>
                    ) : (
                      <>
                        <Headphones className="w-3.5 h-3.5 text-neutral-800" />
                        <span>Nghe Thử Câu Đầu (0.5s)</span>
                      </>
                    )}
                  </button>

                  {/* Primary Generate Button */}
                  <button
                    type="button"
                    onClick={handleGenerateSingle}
                    disabled={isGenerating || !text.trim()}
                    className="sm:col-span-7 py-3 px-5 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white rounded-xl font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{generationProgress || 'Đang tổng hợp...'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>Tạo Toàn Bộ Âm Thanh (WAV)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Quick Download Bar immediately visible after generation or audition */}
                {activeAudioItem && !activeAudioItem.isDialogue ? (
                  <div className="mt-2 p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-neutral-900 truncate">
                        File âm thanh sẵn sàng: {activeAudioItem.title}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        Định dạng WAV 24kHz
                        {formatFileSize(activeAudioItem.fileSizeBytes)
                          ? ` • ${formatFileSize(activeAudioItem.fileSizeBytes)}`
                          : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {getServerDownloadHref(activeAudioItem) && (
                        <a
                          href={getServerDownloadHref(activeAudioItem) || '#'}
                          download={buildSafeAudioFilename(activeAudioItem)}
                          className="text-[11px] font-medium text-neutral-600 hover:text-neutral-900 underline underline-offset-2"
                        >
                          Link trực tiếp
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          const res = triggerAudioDownload(activeAudioItem);
                          if (res.ok) {
                            setSuccessNotice(`Đã bắt đầu tải xuống: ${res.filename}`);
                            setTimeout(() => setSuccessNotice(null), 3000);
                          }
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải File WAV Về Máy</span>
                      </button>
                    </div>
                  </div>
                ) : previewAudioItem ? (
                  <div className="mt-2 p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-neutral-600 truncate">
                      Bản nghe thử câu đầu ({formatFileSize(previewAudioItem.fileSizeBytes) || 'WAV'})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const res = triggerAudioDownload(previewAudioItem);
                        if (res.ok) {
                          setSuccessNotice(`Đã tải bản nghe thử: ${res.filename}`);
                          setTimeout(() => setSuccessNotice(null), 2500);
                        }
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      <Download className="w-3 h-3" />
                      <span>Tải bản thử (.WAV)</span>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Right Column (5 cols): Player & Studio Tuning */}
            <div className="lg:col-span-5 space-y-4">
              {/* Studio Player */}
              <AudioPlayer
                item={activeAudioItem}
                onDownloaded={(filename) => {
                  setSuccessNotice(`Đã tải xuống tệp: ${filename}`);
                  setTimeout(() => setSuccessNotice(null), 3000);
                }}
              />

              {/* Tuning Box */}
              <div className="p-4 bg-white border border-neutral-200/90 rounded-2xl shadow-xs space-y-4">
                {/* Accent & Speed Bar */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                      <Globe2 className="w-3 h-3 text-neutral-800" />
                      Ngữ Điệu Vùng Miền
                    </label>
                    <div className="grid grid-cols-2 gap-1 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 text-xs">
                      {(['Bắc', 'Nam', 'Trung', 'Toàn quốc'] as const).map((acc) => (
                        <button
                          key={acc}
                          type="button"
                          onClick={() => setAccent(acc)}
                          className={`py-1 px-1.5 rounded text-[11px] font-medium transition-colors ${
                            accent === acc
                              ? 'bg-white text-neutral-900 font-bold shadow-xs'
                              : 'text-neutral-600 hover:text-neutral-900'
                          }`}
                        >
                          {acc}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-neutral-800" />
                      Tốc Độ Nói
                    </label>
                    <div className="grid grid-cols-3 gap-1 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 text-xs">
                      {[0.8, 1.0, 1.2].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSpeed(s)}
                          className={`py-1 px-1.5 rounded text-[11px] font-medium transition-colors ${
                            speed === s
                              ? 'bg-white text-neutral-900 font-bold shadow-xs'
                              : 'text-neutral-600 hover:text-neutral-900'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Base Voice Selector */}
                <VoiceSelector
                  selectedVoice={selectedVoice}
                  onSelect={(v) => {
                    setSelectedVoice(v);
                    setSelectedPersonaId(null);
                  }}
                  playingVoiceId={playingVoiceId}
                  loadingVoiceId={loadingVoiceId}
                  onTogglePreview={handleToggleVoicePreview}
                />

                {/* Emotion / Tone Selector */}
                <StyleSelector
                  currentStyle={selectedStyle}
                  onSelectStyle={(s) => setSelectedStyle(s)}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Dual-Speaker Mode */
          <div className="max-w-4xl mx-auto space-y-4">
            {activeAudioItem && (
              <AudioPlayer
                item={activeAudioItem}
                onDownloaded={(filename) => {
                  setSuccessNotice(`Đã tải xuống tệp: ${filename}`);
                  setTimeout(() => setSuccessNotice(null), 3000);
                }}
              />
            )}
            <div className="p-5 bg-white border border-neutral-200/90 rounded-2xl shadow-xs">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-neutral-900" />
                  Song Thoại Đối Thoại 2 Người (Podcast & Skit)
                </h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Tạo cuộc trò chuyện tự nhiên giữa 2 nhân vật với giọng đọc riêng biệt, hỗ trợ nhịp thở và câu đệm tự nhiên.
                </p>
              </div>
              <DialogueMode
                onGenerateDialogue={handleGenerateDialogue}
                isLoading={isGenerating}
              />
            </div>
          </div>
        )}
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={historyItems}
        activeItemId={activeAudioItem?.id}
        onSelectItem={(item) => {
          setActiveAudioItem(item);
          setIsHistoryOpen(false);
        }}
        onDeleteItem={(id) => {
          setHistoryItems((prev) => prev.filter((it) => it.id !== id));
          if (activeAudioItem?.id === id) {
            setActiveAudioItem(null);
          }
        }}
        onClearAll={() => {
          setHistoryItems([]);
          setActiveAudioItem(null);
        }}
      />

      {/* Developer API & Claude AI Integration Modal */}
      <ApiIntegrationModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
      />
    </div>
  );
}
