import { CurrentDetectionsProps } from './CurrentDetections.types';

export function CurrentDetections({ currentDetections }: CurrentDetectionsProps) {
  return (
    <div className="mt-6 bg-gray-800 rounded-lg p-6 shadow-2xl">
      <h3 className="text-xl font-bold mb-4">🎯 Detecções Atuais</h3>
      <div className="space-y-1 text-sm max-h-60 overflow-y-auto">
        {currentDetections.map((det, idx) => (
          <div key={idx} className="text-gray-300">
            <span className="capitalize font-semibold">{det.class}</span>
            <span className="text-green-400"> {(det.score * 100).toFixed(1)}%</span>
          </div>
        ))}
        {currentDetections.length === 0 && (
          <div className="text-gray-500 text-center py-4">
            Nenhuma detecção no frame atual
          </div>
        )}
      </div>
    </div>
  );
}
