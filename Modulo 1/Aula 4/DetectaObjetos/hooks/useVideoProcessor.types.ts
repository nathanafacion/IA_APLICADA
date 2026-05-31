import { Detection } from '@/types/detection';

export interface UseVideoProcessorProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isModelLoaded: boolean;
  currentDetections: Detection[];
  onDetect: (imageBitmap: ImageBitmap) => void;
}

export interface UseVideoProcessorReturn {
  isProcessing: boolean;
  isProcessingFrame: boolean;
  fps: number;
  processFrame: () => void;
  setIsProcessing: (value: boolean) => void;
  setIsProcessingFrame: (value: boolean) => void;
}
