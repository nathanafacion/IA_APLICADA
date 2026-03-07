import CarCard from "@/features/cars/components/CarCard";
import { TechExplanation } from "../TechExplanation";
import type { SearchResultsProps } from "./SearchResults.types";

export function SearchResults({ results, query }: SearchResultsProps) {
  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <h2 className="text-white font-bold text-xl">
          {results.length} resultado{results.length !== 1 ? "s" : ""} mais similares
        </h2>
        <span className="text-slate-500 text-sm">para &quot;{query}&quot;</span>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-5xl mb-4">🔍</p>
          <p>Nenhum resultado encontrado. Verifique se o banco foi populado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map((car, i) => (
            <CarCard key={car.id} car={car} rank={i + 1} />
          ))}
        </div>
      )}

      <TechExplanation query={query} />
    </>
  );
}
