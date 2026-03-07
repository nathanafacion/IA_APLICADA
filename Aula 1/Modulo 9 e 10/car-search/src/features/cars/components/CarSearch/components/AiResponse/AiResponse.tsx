import type { AiResponseProps } from "./AiResponse.types";

export function AiResponse({ content }: AiResponseProps) {
  return (
    <div className="mb-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/25 rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center text-xl shadow-lg shadow-green-900/40">
          🤖
        </div>
        <div className="flex-1">
          <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Análise RAG — gpt-4o-mini via OpenRouter
          </p>
          <p className="text-slate-200 text-sm leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
}
