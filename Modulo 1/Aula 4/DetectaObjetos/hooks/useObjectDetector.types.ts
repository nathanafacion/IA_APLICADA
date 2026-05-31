import { Detection } from '@/types/detection';

export interface UseObjectDetectorReturn {
  isModelLoaded: boolean;
  detectedObjects: Set<string>;
  currentDetections: Detection[];
  inferenceTime: number;
  error: string | null;
  detectObjects: (imageBitmap: ImageBitmap) => void;
}
