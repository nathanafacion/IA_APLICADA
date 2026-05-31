import type { SearchFormProps } from "./SearchForm.types";

export function SearchForm({ query, status, inputRef, onChange, onSubmit }: SearchFormProps) {
  const isLoading = status === "loading";

  return (
    <form onSubmit={onSubmit} className="relative max-w-2xl mx-auto">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Descreva o carro que você procura..."
            className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-green-400 focus:bg-white/15 transition-all"
            disabled={isLoading}
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={!query.trim() || isLoading}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-4 rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-green-900/50 whitespace-nowrap"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Buscando...
            </span>
          ) : (
            "Buscar 🔍"
          )}
        </button>
      </div>
    </form>
  );
}
