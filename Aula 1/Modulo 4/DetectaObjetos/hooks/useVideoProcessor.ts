import { useCallback, useRef, useState } from 'react';
import { Detection } from '@/types/detection';
import { UseVideoProcessorProps, UseVideoProcessorReturn } from './useVideoProcessor.types';

const PROCESS_INTERVAL = 500; // Processa a cada 500ms

export function useVideoProcessor({
  videoRef,
  canvasRef,
  isModelLoaded,
  currentDetections,
  onDetect,
}: UseVideoProcessorProps): UseVideoProcessorReturn {
  const animationFrameRef = useRef<number>();
  const lastProcessTimeRef = useRef<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessingFrame, setIsProcessingFrame] = useState(false);
  const [fps, setFps] = useState(0);

  const drawDetections = useCallback((ctx: CanvasRenderingContext2D, detections: Detection[], video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    // Calcula a escala entre o tamanho do vídeo original e o tamanho de exibição
    const scaleX = canvas.width / video.videoWidth;
    const scaleY = canvas.height / video.videoHeight;
    
    detections.forEach(det => {
      const [x, y, w, h] = det.bbox;
      
      // Escala as coordenadas para o tamanho de exibição
      const scaledX = x * scaleX;
      const scaledY = y * scaleY;
      const scaledW = w * scaleX;
      const scaledH = h * scaleY;
      
      // Desenha o label
      const label = `${det.class} ${(det.score * 100).toFixed(1)}%`;
      ctx.font = '16px Arial';
      ctx.fillStyle = '#00ff00';
      
      const textMetrics = ctx.measureText(label);
      const textHeight = 20;
      
      // Fundo do texto
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(scaledX, scaledY - textHeight, textMetrics.width + 10, textHeight);
      
      // Texto
      ctx.fillStyle = '#00ff00';
      ctx.fillText(label, scaledX + 5, scaledY - 5);
    });
  }, []);

  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.paused || video.ended || !isModelLoaded) {
      return;
    }

    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ajusta o tamanho do canvas para corresponder ao tamanho de exibição do vídeo
    const displayWidth = video.clientWidth;
    const displayHeight = video.clientHeight;
    
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    // Desenha o frame atual
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawDetections(ctx, currentDetections, video, canvas);

    // Throttling: só processa a cada PROCESS_INTERVAL ms
    const now = performance.now();
    const timeSinceLastProcess = now - lastProcessTimeRef.current;

    if (timeSinceLastProcess >= PROCESS_INTERVAL && !isProcessingFrame) {
      lastProcessTimeRef.current = now;
      
      try {
        setIsProcessingFrame(true);
        createImageBitmap(video).then(bitmap => {
          onDetect(bitmap);
        }).catch(err => {
          console.warn('Erro ao criar ImageBitmap:', err);
          setIsProcessingFrame(false);
        });
      } catch (error) {
        console.warn('Erro ao processar frame:', error);
        setIsProcessingFrame(false);
      }
    }

    // Calcula FPS de renderização
    if ((performance as any).lastTime) {
      const delta = now - (performance as any).lastTime;
      setFps(Math.round(1000 / delta));
    }
    (performance as any).lastTime = now;

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [videoRef, canvasRef, isModelLoaded, currentDetections, isProcessingFrame, onDetect, drawDetections]);

  return {
    isProcessing,
    isProcessingFrame,
    fps,
    processFrame,
    setIsProcessing,
    setIsProcessingFrame,
  };
}
