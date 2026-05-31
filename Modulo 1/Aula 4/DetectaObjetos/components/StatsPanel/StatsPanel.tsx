import { StatsPanelProps } from './StatsPanel.types';

export function StatsPanel({ isModelLoaded, fps, inferenceTime }: StatsPanelProps) {
  return (
    <div className="mb-6 flex justify-center gap-4">
      <div className={`px-4 py-2 rounded-lg ${isModelLoaded ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
        <span className="font-semibold">Modelo: </span>
        {isModelLoaded ? '✓ Carregado' : '⏳ Carregando...'}
      </div>
      <div className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400">
        <span className="font-semibold">FPS: </span>{fps}
      </div>
      <div className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400">
        <span className="font-semibold">Inferência: </span>{inferenceTime.toFixed(1)}ms
      </div>
    </div>
  );
}
