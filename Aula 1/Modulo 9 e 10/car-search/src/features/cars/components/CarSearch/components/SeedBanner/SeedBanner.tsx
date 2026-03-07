import type { SeedBannerProps } from "./SeedBanner.types";

export function SeedBanner({ seeded, seeding, seedMsg, onSeed }: SeedBannerProps) {
  if (seeded) {
    return (
      <div className="mb-8 flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-xl px-5 py-3">
        <span className="text-green-400 text-sm font-medium">
          ✅ Neo4j pronto com 60 carros e índice vetorial ativo
        </span>
        <button
          onClick={onSeed}
          className="text-green-400/60 hover:text-green-300 text-xs underline transition-colors"
        >
          Re-popular
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <h3 className="text-amber-300 font-bold text-lg mb-1">
            ⚠️ Banco de dados não populado
          </h3>
          <p className="text-amber-200/70 text-sm">
            O Neo4j está vazio. Clique em &quot;Popular Banco&quot; para inserir 60 carros
            com embeddings vetoriais. Certifique-se de que o Neo4j está rodando (
            <code className="bg-amber-900/40 px-1 rounded">docker-compose up -d</code>
            ) e que a chave do OpenRouter está no{" "}
            <code className="bg-amber-900/40 px-1 rounded">.env.local</code>.
          </p>
          {seedMsg && (
            <p className="mt-2 text-amber-100 text-sm font-medium">{seedMsg}</p>
          )}
        </div>
        <button
          onClick={onSeed}
          disabled={seeding}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-amber-950 font-bold px-6 py-3 rounded-xl transition-all whitespace-nowrap flex items-center gap-2"
        >
          {seeding ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Populando...
            </>
          ) : (
            "🗄️ Popular Banco"
          )}
        </button>
      </div>
    </div>
  );
}
