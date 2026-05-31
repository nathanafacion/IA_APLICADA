import { ObjectInventoryProps } from './ObjectInventory.types';

export function ObjectInventory({ detectedObjects }: ObjectInventoryProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-2xl">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        📦 Inventário de Objetos
      </h2>
      <p className="text-gray-400 text-sm mb-4">
        Objetos únicos detectados: <span className="text-green-400 font-bold">{detectedObjects.size}</span>
      </p>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {Array.from(detectedObjects).sort().map((obj, idx) => (
          <div
            key={idx}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <span className="capitalize">{obj}</span>
          </div>
        ))}
        {detectedObjects.size === 0 && (
          <div className="text-gray-500 text-center py-8">
            Nenhum objeto detectado ainda.
            <br />
            Carregue um vídeo para começar.
          </div>
        )}
      </div>
    </div>
  );
}
