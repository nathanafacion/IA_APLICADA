'use client';

import { useRef, useEffect, useState } from 'react';
import { useObjectDetector } from '@/hooks/useObjectDetector';
import { useVideoProcessor } from '@/hooks/useVideoProcessor';
import { Header } from '@/components/Header';
import { StatsPanel } from '@/components/StatsPanel';
import { ErrorMessage } from '@/components/ErrorMessage';
import { ControlPanel } from '@/components/ControlPanel';
import { VideoPlayerWithCanvas } from '@/components/VideoPlayerWithCanvas';
import { ObjectInventory } from '@/components/ObjectInventory';
import { CurrentDetections } from '@/components/CurrentDetections';
import { Instructions } from '@/components/Instructions';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoBlobUrlRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Hook de detecção de objetos
  const {
    isModelLoaded,
    detectedObjects,
    currentDetections,
    inferenceTime,
    error: detectorError,
    detectObjects,
  } = useObjectDetector();

  // Hook de processamento de vídeo
  const {
    isProcessing,
    isProcessingFrame,
    fps,
    processFrame,
    setIsProcessing,
    setIsProcessingFrame,
  } = useVideoProcessor({
    videoRef,
    canvasRef,
    isModelLoaded,
    currentDetections,
    onDetect: detectObjects,
  });

  // Atualiza setIsProcessingFrame quando o detector retorna resultado
  useEffect(() => {
    if (currentDetections) {
      setIsProcessingFrame(false);
    }
  }, [currentDetections, setIsProcessingFrame]);

  // Combina erros do detector com erros locais
  useEffect(() => {
    if (detectorError) {
      setError(detectorError);
    }
  }, [detectorError]);

  // Cleanup: revoga blob URL ao desmontar
  useEffect(() => {
    return () => {
      if (videoBlobUrlRef.current) {
        URL.revokeObjectURL(videoBlobUrlRef.current);
      }
    };
  }, []);

  // Manipula upload de vídeo
  const handleVideoUpload = (file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Por favor, selecione um arquivo de vídeo válido');
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    // Revoga a URL anterior se existir
    if (videoBlobUrlRef.current) {
      URL.revokeObjectURL(videoBlobUrlRef.current);
    }

    // Carrega o vídeo
    const url = URL.createObjectURL(file);
    videoBlobUrlRef.current = url;
    video.src = url;
    
    video.onloadeddata = () => {
      setError(null);
    };

    video.onerror = () => {
      setError('Erro ao carregar o vídeo');
      if (videoBlobUrlRef.current) {
        URL.revokeObjectURL(videoBlobUrlRef.current);
        videoBlobUrlRef.current = null;
      }
    };
  };

  // Inicia/pausa o processamento
  const handleToggleProcessing = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isProcessing) {
      video.pause();
    } else {
      video.play();
      processFrame();
    }
    
    setIsProcessing(!isProcessing);
  };

  // Event handlers do vídeo
  const handlePlay = () => {
    setIsProcessing(true);
    processFrame();
  };

  const handlePause = () => {
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <Header />

        <StatsPanel 
          isModelLoaded={isModelLoaded}
          fps={fps}
          inferenceTime={inferenceTime}
        />

        <ErrorMessage error={error} />

        <ControlPanel
          isModelLoaded={isModelLoaded}
          isProcessing={isProcessing}
          hasVideo={!!videoRef.current?.src}
          onVideoUpload={handleVideoUpload}
          onToggleProcessing={handleToggleProcessing}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          <VideoPlayerWithCanvas
            videoRef={videoRef}
            canvasRef={canvasRef}
            onPlay={handlePlay}
            onPause={handlePause}
          />

          <div className="lg:w-80">
            <ObjectInventory detectedObjects={detectedObjects} />
            <CurrentDetections currentDetections={currentDetections} />
          </div>
        </div>

        <Instructions />
      </div>
    </div>
  );
}
