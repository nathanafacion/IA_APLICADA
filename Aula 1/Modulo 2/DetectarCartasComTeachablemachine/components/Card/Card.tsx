import { Carta, getForcaCarta, getSimboloNaipe, getCorNaipe, isManilha } from "@/lib/trucoLogic";

interface CardProps {
  carta: Carta | null;
  titulo: string;
}

/**
 * Componente puro para renderizar uma carta de Truco
 */
export function Card({ carta, titulo }: CardProps) {
  if (!carta) {
    return (
      <div className="text-center">
        <h3 className="text-white font-bold mb-4">{titulo}</h3>
        <div className="w-32 h-44 bg-gray-700 rounded-lg border-2 border-gray-600 flex items-center justify-center">
          <span className="text-gray-500">?</span>
        </div>
      </div>
    );
  }

  const ehManilha = isManilha(carta);
  const forcaReal = getForcaCarta(carta);

  return (
    <div className="text-center">
      <h3 className="text-white font-bold mb-4">{titulo}</h3>
      <div
        className={`w-32 h-44 rounded-lg shadow-xl flex flex-col items-center justify-center p-3 ${
          ehManilha
            ? "bg-gradient-to-br from-yellow-200 via-white to-yellow-200 border-4 border-yellow-500"
            : "bg-white border-2 border-gray-700"
        }`}
      >
        <div
          className="text-6xl font-bold"
          style={{ color: getCorNaipe(carta.naipe) }}
        >
          {carta.valor}
        </div>
        <div
          className="text-5xl"
          style={{ color: getCorNaipe(carta.naipe) }}
        >
          {getSimboloNaipe(carta.naipe)}
        </div>
        <div className="text-xs mt-2 text-gray-600">Força: {forcaReal}</div>
        {ehManilha && (
          <div className="text-xs font-bold text-yellow-700 bg-yellow-300 px-2 py-1 rounded mt-1">
            ⭐ MANILHA
          </div>
        )}
      </div>
    </div>
  );
}
