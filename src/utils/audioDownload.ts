import { GeneratedAudioItem } from '../types';

export function base64ToBlob(base64: string, mimeType = 'audio/wav'): Blob {
  const clean = base64.includes(',') ? base64.split(',')[1] : base64;
  const binary = atob(clean);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType || 'audio/wav' });
}

export function createBlobUrlFromBase64(base64: string, mimeType = 'audio/wav'): string {
  if (!base64) return '';
  const blob = base64ToBlob(base64, mimeType);
  return URL.createObjectURL(blob);
}

export function estimateWavSizeFromBase64(base64?: string): number | undefined {
  if (!base64) return undefined;
  const clean = base64.includes(',') ? base64.split(',')[1] : base64;
  if (!clean) return undefined;
  const padding = clean.endsWith('==') ? 2 : clean.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((clean.length * 3) / 4) - padding);
}

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function buildSafeAudioFilename(
  item: Pick<GeneratedAudioItem, 'voice' | 'createdAt' | 'isDialogue'>
): string {
  const prefix = item.isDialogue ? 'song-thoai' : `voice-${(item.voice || 'ai').toLowerCase()}`;
  const cleanPrefix = prefix.replace(/[^a-z0-9_-]/g, '-');
  const stamp = item.createdAt || Date.now();
  return `${cleanPrefix}-${stamp}.wav`;
}

export function getServerDownloadHref(item: GeneratedAudioItem): string | null {
  if (!item.downloadUrl) return null;
  const filename = buildSafeAudioFilename(item);
  const sep = item.downloadUrl.includes('?') ? '&' : '?';
  return `${item.downloadUrl}${sep}filename=${encodeURIComponent(filename)}`;
}

/**
 * Triggers a reliable file download synchronously inside a user click gesture.
 * Uses a same-origin Blob URL (avoiding Chromium's data: URI download limits in iframes),
 * falling back to server download endpoint or base64 form POST if needed.
 */
export function triggerAudioDownload(item: GeneratedAudioItem): { ok: boolean; filename: string } {
  const filename = buildSafeAudioFilename(item);

  try {
    if (item.audioBase64) {
      const blob = base64ToBlob(item.audioBase64, item.mimeType || 'audio/wav');
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
      return { ok: true, filename };
    }

    const serverHref = getServerDownloadHref(item);
    if (serverHref) {
      const a = document.createElement('a');
      a.href = serverHref;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return { ok: true, filename };
    }

    if (item.audioUrl && item.audioUrl.startsWith('blob:')) {
      const a = document.createElement('a');
      a.href = item.audioUrl;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return { ok: true, filename };
    }

    return { ok: false, filename };
  } catch (err) {
    console.warn('Blob download failed, falling back to server POST download:', err);
    if (item.audioBase64) {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/api/tts/download-base64';
      form.style.display = 'none';

      const base64Input = document.createElement('input');
      base64Input.type = 'hidden';
      base64Input.name = 'audioBase64';
      base64Input.value = item.audioBase64;
      form.appendChild(base64Input);

      const nameInput = document.createElement('input');
      nameInput.type = 'hidden';
      nameInput.name = 'filename';
      nameInput.value = filename;
      form.appendChild(nameInput);

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      return { ok: true, filename };
    }
    return { ok: false, filename };
  }
}
