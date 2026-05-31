import type { TechExplanationProps } from "./TechExplanation.types";

export function TechExplanation({ query }: TechExplanationProps) {
  return (
    <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6">
      <h3 className="text-white font-bold mb-3 flex items-center gap-2">
        <span>🧠</span> Como funciona a busca por similaridade?
      </h3>
      <div className="grid sm:grid-cols-3 gap-4 text-sm text-slate-400">
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-green-400 font-semibold mb-1">1. Embedding da busca</p>
          <p>
            Sua query <span className="text-slate-300">&quot;{query}&quot;</span> é
            convertida em um vetor de 1536 números pelo modelo{" "}
            <code className="text-emerald-400">text-embedding-3-small</code> via OpenRouter.
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-emerald-400 font-semibold mb-1">2. Similaridade Coseno</p>
          <p>
            O Neo4j calcula a distância coseno entre o vetor da sua busca e os vetores
            de todos os 60 carros armazenados no índice vetorial.
          </p>
        </div>
        <div className="bg-white/5 rounded-xl p-4">
          <p className="text-lime-400 font-semibold mb-1">3. Top-K resultados</p>
          <p>
            Os 6 carros com maior similaridade semântica são retornados — sem precisar
            de palavras exatas, apenas de significado próximo.
          </p>
        </div>
      </div>
    </div>
  );
}
