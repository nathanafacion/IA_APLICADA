import { useEffect, useRef, useState } from 'react';
import { Detection } from '@/types/detection';
import { UseObjectDetectorReturn } from './useObjectDetector.types';

export function useObjectDetector(): UseObjectDetectorReturn {
  const workerRef = useRef<Worker | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [detectedObjects, setDetectedObjects] = useState<Set<string>>(new Set());
  const [currentDetections, setCurrentDetections] = useState<Detection[]>([]);
  const [inferenceTime, setInferenceTime] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      workerRef.current = new Worker('/detector-cocossd.worker.js');

      workerRef.current.onmessage = (e: MessageEvent) => {
        const { type, data } = e.data;

        switch (type) {
          case 'ready':
            setIsModelLoaded(true);
            setError(null);
            console.log('Modelo carregado e pronto!');
            break;

          case 'result':
            setCurrentDetections(data.detections);
            setInferenceTime(data.inferenceTime);
            
            // Adiciona novos objetos ao inventário
            setDetectedObjects(prev => {
              const newSet = new Set(prev);
              data.detections.forEach((det: Detection) => {
                newSet.add(det.class);
              });
              return newSet;
            });
            break;

          case 'error':
            setError(data);
            break;
        }
      };

      workerRef.current.onerror = (error) => {
        console.error('Erro no Worker:', error);
        setError('Erro ao inicializar o Worker');
      };

      workerRef.current.postMessage({ type: 'init' });

    } catch (err) {
      console.error('Erro ao criar Worker:', err);
      setError('Erro ao criar Web Worker');
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const detectObjects = (imageBitmap: ImageBitmap) => {
    workerRef.current?.postMessage({
      type: 'detect',
      data: { imageBitmap }
    }, [imageBitmap]);
  };

  const resetDetections = () => {
    setDetectedObjects(new Set());
    setCurrentDetections([]);
  };

  return {
    isModelLoaded,
    detectedObjects,
    currentDetections,
    inferenceTime,
    error,
    detectObjects,
  };
}
