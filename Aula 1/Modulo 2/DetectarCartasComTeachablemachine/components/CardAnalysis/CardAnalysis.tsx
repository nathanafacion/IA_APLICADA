import { Carta, obterCartasQueGanha, obterCartasQuePerde, obterCartasQueEmpata } from "@/lib/trucoLogic";

interface CardAnalysisProps {
  carta: Carta;
}

/**
 * Componente puro para exibir a análise detalhada de uma carta
 */
export function CardAnalysis({ carta }: CardAnalysisProps) {
  const cartasQueGanha = obterCartasQueGanha(carta);
  const cartasQuePerde = obterCartasQuePerde(carta);
  const cartasQueEmpata = obterCartasQueEmpata(carta);

  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-green-900/50 rounded-lg p-4">
        <h4 className="text-green-400 font-bold mb-2">
          Ganha de ({cartasQueGanha.length} cartas):
        </h4>
        <div className="text-white text-sm max-h-40 overflow-y-auto">
          {cartasQueGanha.slice(0, 10).map((c, i) => (
            <div key={i}>• {c.nomeCompleto}</div>
          ))}
          {cartasQueGanha.length > 10 && (
            <div className="text-green-300 mt-1">
              ... e mais {cartasQueGanha.length - 10}
            </div>
          )}
        </div>
      </div>

      <div className="bg-red-900/50 rounded-lg p-4">
        <h4 className="text-red-400 font-bold mb-2">
          Perde para ({cartasQuePerde.length} cartas):
        </h4>
        <div className="text-white text-sm max-h-40 overflow-y-auto">
          {cartasQuePerde.slice(0, 10).map((c, i) => (
            <div key={i}>• {c.nomeCompleto}</div>
          ))}
          {cartasQuePerde.length > 10 && (
            <div className="text-red-300 mt-1">
              ... e mais {cartasQuePerde.length - 10}
            </div>
          )}
        </div>
      </div>

      <div className="bg-yellow-900/50 rounded-lg p-4">
        <h4 className="text-yellow-400 font-bold mb-2">
          Empata com ({cartasQueEmpata.length} cartas):
        </h4>
        <div className="text-white text-sm max-h-40 overflow-y-auto">
          {cartasQueEmpata.map((c, i) => (
            <div key={i}>• {c.nomeCompleto}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
