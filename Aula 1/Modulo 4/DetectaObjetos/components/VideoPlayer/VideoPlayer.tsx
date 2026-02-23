import { forwardRef } from 'react';
import { VideoPlayerProps } from './VideoPlayer.types';

export const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ onPlay, onPause }, ref) => {
    return (
      <div className="flex-1">
        <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
          <video
            ref={ref}
            className="w-full"
            controls
            onPlay={onPlay}
            onPause={onPause}
          >
            <source src="" type="video/mp4" />
          </video>
        </div>
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';
