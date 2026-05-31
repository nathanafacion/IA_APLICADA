import { useRef } from 'react';
import { ControlPanelProps } from './ControlPanel.types';

export function ControlPanel({
  isModelLoaded,
  isProcessing,
  hasVideo,
  onVideoUpload,
  onToggleProcessing,
}: ControlPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onVideoUpload(file);
    }
  };

  return (
    <div className="mb-6 flex justify-center gap-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!isModelLoaded}
      >
        📁 Carregar Vídeo
      </button>
      <button
        onClick={onToggleProcessing}
        disabled={!hasVideo || !isModelLoaded}
        className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? '⏸ Pausar' : '▶️ Processar'}
      </button>
    </div>
  );
}
