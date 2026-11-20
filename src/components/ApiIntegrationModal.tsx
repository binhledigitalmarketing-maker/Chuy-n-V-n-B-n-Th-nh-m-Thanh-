import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Code2, Bot, FileJson, Key, Globe, ExternalLink } from 'lucide-react';

interface ApiIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiIntegrationModal: React.FC<ApiIntegrationModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'claude' | 'curl' | 'python' | 'js' | 'openapi'>('claude');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://your-app-domain.com';
  const apiKey = 'vocalis_live_key_ai_2026';
  const endpointUrl = `${currentOrigin}/api/v1/tts`;
  const openApiUrl = `${currentOrigin}/api/v1/openapi.json`;

  const copyToClipboard = (text: string, isKey = false) => {
    navigator.clipboard.writeText(text);
    if (isKey) {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const claudePromptSnippet = `Bạn là trợ lý AI thông minh. Khi người dùng yêu cầu đọc văn bản hoặc chuyển kịch bản thành âm thanh, hãy gọi API sau:

- Endpoint: POST ${endpointUrl}
- Headers:
    Content-Type: application/json
    Authorization: Bearer ${apiKey}
- Request Body:
    {
      "text": "<Nội dung cần đọc>",
      "voice": "Kore",     // Tùy chọn: Kore (Nữ ấm), Puck (Nữ Gen Z), Zephyr (Nữ hiện đại), Charon (Nam trầm), Fenrir (Nam điện ảnh)
      "accent": "Bắc",     // Tùy chọn: Bắc, Nam, Trung, Toàn quốc
      "format": "json"     // Hoặc "audio" để nhận file WAV nhúng trực tiếp
    }

Phản hồi trả về audioBase64 (chuẩn WAV 24kHz), hãy nhúng thẻ phát âm thanh để người dùng nghe trực tiếp!`;

  const curlSnippet = `curl -X POST ${endpointUrl} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKey}" \\
  -d '{
    "text": "Xin chào! Đây là âm thanh được tạo qua API của Vocalis AI.",
    "voice": "Kore",
    "accent": "Bắc",
    "format": "json"
  }'`;

  const pythonSnippet = `import requests

url = "${endpointUrl}"
headers = {
    "Authorization": "Bearer ${apiKey}",
    "Content-Type": "application/json"
}
payload = {
    "text": "Xin chào thế giới! Đây là giọng đọc từ Python.",
    "voice": "Kore",
    "accent": "Nam",
    "format": "audio"  # Nhận file WAV nhị phân trực tiếp
}

response = requests.post(url, json=payload, headers=headers)

if response.status_code == 200:
    with open("output.wav", "wb") as f:
        f.write(response.content)
    print("✅ Đã lưu file output.wav thành công!")
else:
    print("❌ Lỗi:", response.text)`;

  const jsSnippet = `const response = await fetch("${endpointUrl}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer ${apiKey}"
  },
  body: JSON.stringify({
    text: "Xin chào từ ứng dụng của bạn!",
    voice: "Puck",
    accent: "Nam",
    format: "json"
  })
});

const data = await response.json();
if (data.success) {
  // Phát trực tiếp trong trình duyệt
  const audio = new Audio(\`data:\${data.mimeType};base64,\${data.audioBase64}\`);
  audio.play();
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl bg-white border border-neutral-200 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Kết Nối API & Claude AI</h3>
              <p className="text-[11px] text-neutral-500">
                Tích hợp tạo giọng đọc vào Claude AI, ứng dụng ngoài, cURL hoặc Python
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* API Credentials Box */}
        <div className="p-4 bg-neutral-50 border-b border-neutral-200 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {/* API Key */}
            <div className="p-2.5 bg-white border border-neutral-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                <Key className="w-3 h-3 text-neutral-800" /> API Key của bạn
              </span>
              <div className="flex items-center justify-between gap-2">
                <code className="font-mono text-neutral-900 font-bold truncate text-[11px]">
                  {apiKey}
                </code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(apiKey, true)}
                  className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors shrink-0"
                  title="Sao chép Key"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Endpoint */}
            <div className="p-2.5 bg-white border border-neutral-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                <Globe className="w-3 h-3 text-neutral-800" /> Endpoint URL
              </span>
              <div className="flex items-center justify-between gap-2">
                <code className="font-mono text-neutral-900 truncate text-[11px]">
                  {endpointUrl}
                </code>
                <button
                  type="button"
                  onClick={() => copyToClipboard(endpointUrl, true)}
                  className="p-1 rounded text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors shrink-0"
                  title="Sao chép URL"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 p-2 border-b border-neutral-200 bg-white overflow-x-auto">
          <button
            onClick={() => setActiveTab('claude')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'claude'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Claude AI</span>
          </button>
          <button
            onClick={() => setActiveTab('curl')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'curl'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>cURL</span>
          </button>
          <button
            onClick={() => setActiveTab('python')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'python'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <span>🐍 Python</span>
          </button>
          <button
            onClick={() => setActiveTab('js')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'js'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <span>⚡ JavaScript</span>
          </button>
          <button
            onClick={() => setActiveTab('openapi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'openapi'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>OpenAPI 3.0</span>
          </button>
        </div>

        {/* Tab contents */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-[#fafafa]">
          {activeTab === 'claude' && (
            <div className="space-y-2.5">
              <div className="p-3 bg-white border border-neutral-200 rounded-xl text-xs space-y-1.5 text-neutral-700">
                <p className="font-bold text-neutral-900">
                  🤖 Hướng dẫn tích hợp Claude AI (Claude Desktop / Artifacts / Custom Prompts):
                </p>
                <p className="text-[11px] text-neutral-600">
                  Dán đoạn chỉ dẫn (System Prompt) dưới đây vào cuộc hội thoại của bạn với Claude AI để yêu cầu Claude trực tiếp gọi phát âm thanh giọng đọc tiếng Việt qua API của ứng dụng:
                </p>
              </div>

              <div className="relative">
                <pre className="p-3 bg-neutral-900 text-neutral-100 rounded-xl text-[11px] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {claudePromptSnippet}
                </pre>
                <button
                  type="button"
                  onClick={() => copyToClipboard(claudePromptSnippet)}
                  className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md text-[10px] font-medium transition-colors"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedCode ? 'Đã sao chép' : 'Sao chép Prompt'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'curl' && (
            <div className="space-y-2.5">
              <p className="text-xs text-neutral-600">
                Gọi thử nghiệm trực tiếp từ dòng lệnh máy tính hoặc Postman:
              </p>
              <div className="relative">
                <pre className="p-3 bg-neutral-900 text-neutral-100 rounded-xl text-[11px] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {curlSnippet}
                </pre>
                <button
                  type="button"
                  onClick={() => copyToClipboard(curlSnippet)}
                  className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md text-[10px] font-medium transition-colors"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedCode ? 'Đã chép' : 'Sao chép cURL'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'python' && (
            <div className="space-y-2.5">
              <p className="text-xs text-neutral-600">
                Tạo và tải trực tiếp file <code>output.wav</code> bằng Python:
              </p>
              <div className="relative">
                <pre className="p-3 bg-neutral-900 text-neutral-100 rounded-xl text-[11px] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {pythonSnippet}
                </pre>
                <button
                  type="button"
                  onClick={() => copyToClipboard(pythonSnippet)}
                  className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md text-[10px] font-medium transition-colors"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedCode ? 'Đã chép' : 'Sao chép Code'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'js' && (
            <div className="space-y-2.5">
              <p className="text-xs text-neutral-600">
                Tích hợp vào ứng dụng React, Next.js, Vue hoặc Node.js bằng <code>fetch()</code>:
              </p>
              <div className="relative">
                <pre className="p-3 bg-neutral-900 text-neutral-100 rounded-xl text-[11px] font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {jsSnippet}
                </pre>
                <button
                  type="button"
                  onClick={() => copyToClipboard(jsSnippet)}
                  className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-md text-[10px] font-medium transition-colors"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedCode ? 'Đã chép' : 'Sao chép Code'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'openapi' && (
            <div className="space-y-3">
              <div className="p-3 bg-white border border-neutral-200 rounded-xl text-xs space-y-2 text-neutral-700">
                <p className="font-bold text-neutral-900">
                  Chuẩn OpenAPI 3.0 / Swagger Specification
                </p>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Bạn có thể nhập liên kết OpenAPI này vào Claude Custom Tools, GPT Actions, Make.com, Zapier hoặc Postman để tự động nhận diện tất cả tham số tạo giọng đọc:
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={openApiUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold"
                  >
                    <span>Xem file openapi.json</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(openApiUrl)}
                    className="px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 rounded-lg text-xs font-medium"
                  >
                    Sao chép đường dẫn
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-200 bg-white flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
