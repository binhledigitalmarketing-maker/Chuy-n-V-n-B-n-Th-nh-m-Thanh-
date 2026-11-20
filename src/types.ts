export type VoiceName = 'Kore' | 'Puck' | 'Zephyr' | 'Charon' | 'Fenrir';

export interface TrendingVoicePersona {
  id: string;
  name: string;
  tag: string;
  category: 'trending' | 'story' | 'news' | 'business' | 'lifestyle';
  gender: 'female' | 'male';
  baseVoice: VoiceName;
  icon: string;
  stylePrompt: string;
  description: string;
  accent: 'Bắc' | 'Nam' | 'Trung' | 'Toàn quốc';
  sampleText: string;
  badge?: string;
}

export interface VoiceProfile {
  id: VoiceName;
  name: string;
  vietnameseTitle: string;
  gender: 'female' | 'male' | 'unspecified';
  tone: string;
  bestFor: string;
  description: string;
  avatarBg: string;
  accentColor: string;
  previewPrompt?: string;
}

export interface VoiceStylePreset {
  id: string;
  name: string;
  icon: string;
  promptDescription: string;
  tags: string[];
}

export interface GeneratedAudioItem {
  id: string;
  title: string;
  text: string;
  voice: VoiceName;
  style: string;
  audioUrl: string;
  audioBase64: string;
  mimeType: string;
  fileId?: string;
  downloadUrl?: string;
  fileSizeBytes?: number;
  createdAt: number;
  duration?: number;
  wordCount: number;
  charCount: number;
  chunksCount?: number;
  isDialogue?: boolean;
}

export interface DialogueTurn {
  id: string;
  speaker: string;
  text: string;
  style?: string;
}
