import { EXAMPLE_QUERIES } from "../../CarSearch.constants";
import type { ExampleQueriesProps } from "./ExampleQueries.types";

export function ExampleQueries({ onSelect }: ExampleQueriesProps) {
  return (
    <div className="mt-5 flex flex-wrap justify-center gap-2">
      {EXAMPLE_QUERIES.map((ex) => (
        <button
          key={ex}
          onClick={() => onSelect(ex)}
          className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 hover:border-green-400/40 text-slate-400 hover:text-white px-3 py-1.5 rounded-full transition-all duration-200"
        >
          {ex}
        </button>
      ))}
    </div>
  );
}
