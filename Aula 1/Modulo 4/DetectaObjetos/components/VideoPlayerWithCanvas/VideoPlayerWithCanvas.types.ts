export interface VideoPlayerWithCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onPlay: () => void;
  onPause: () => void;
}
