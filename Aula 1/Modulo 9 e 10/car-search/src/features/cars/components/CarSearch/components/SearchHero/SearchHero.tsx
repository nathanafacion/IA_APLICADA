export function SearchHero() {
  return (
    <>
      <span className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        Powered by Neo4j Vector Search · OpenRouter Embeddings
      </span>

      <h1 className="text-5xl md:text-6xl font-black text-white mb-4 leading-tight">
        Busca por{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
          Similaridade
        </span>{" "}
        de Carros
      </h1>

      <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-2">
        Digite em linguagem natural o que você procura. A IA converte sua busca em um
        vetor de 1536 dimensões e encontra os carros semanticamente mais próximos — sem
        precisar de palavras exatas.
      </p>

      <p className="text-slate-500 text-sm mb-10">
        Exemplo:{" "}
        <span className="text-green-400 italic">&quot;Carro vermelho 1990-1991&quot;</span>{" "}
        →{" "}
        <span className="text-emerald-400 italic">&quot;SUV diesel para campo&quot;</span>{" "}
        →{" "}
        <span className="text-lime-400 italic">&quot;elétrico moderno barato&quot;</span>
      </p>
    </>
  );
}
