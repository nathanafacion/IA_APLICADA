export interface ControlPanelProps {
  isModelLoaded: boolean;
  isProcessing: boolean;
  hasVideo: boolean;
  onVideoUpload: (file: File) => void;
  onToggleProcessing: () => void;
}
