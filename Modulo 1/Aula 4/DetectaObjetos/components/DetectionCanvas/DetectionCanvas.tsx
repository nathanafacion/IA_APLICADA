import { forwardRef } from 'react';

export const DetectionCanvas = forwardRef<HTMLCanvasElement>(
  (props, ref) => {
    return (
      <canvas
        ref={ref}
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
      />
    );
  }
);

DetectionCanvas.displayName = 'DetectionCanvas';
