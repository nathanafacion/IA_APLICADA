import { DetectionCanvas } from '../DetectionCanvas';
import { VideoPlayerWithCanvasProps } from './VideoPlayerWithCanvas.types';

export function VideoPlayerWithCanvas({
  videoRef,
  canvasRef,
  onPlay,
  onPause,
}: VideoPlayerWithCanvasProps) {
  return (
    <div className="flex-1">
      <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
        <video
          ref={videoRef}
          className="w-full"
          controls
          onPlay={onPlay}
          onPause={onPause}
        >
          <source src="" type="video/mp4" />
        </video>
        <DetectionCanvas ref={canvasRef} />
      </div>
    </div>
  );
}
