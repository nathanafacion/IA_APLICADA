"use client";
import { useRef } from "react";
import { useCarSearch } from "./useCarSearch";
import { SearchHero } from "./components/SearchHero";
import { SearchForm } from "./components/SearchForm";
import { ExampleQueries } from "./components/ExampleQueries";
import { SeedBanner } from "./components/SeedBanner";
import { SearchResults } from "./components/SearchResults";
import { EmptyState } from "./components/EmptyState";
import { AiResponse } from "./components/AiResponse";
import type { CarSearchProps } from "./CarSearch.types";

export default function CarSearch({ initialSeeded }: CarSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const search = useCarSearch(initialSeeded);

  function handleSelectExample(ex: string) {
    search.setQuery(ex);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-green-950 to-emerald-950">
      <div className="relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-6 py-16 text-center">
          <SearchHero />
          <SearchForm
            query={search.query}
            status={search.status}
            inputRef={inputRef}
            onChange={search.setQuery}
            onSubmit={search.handleSearch}
          />
          <ExampleQueries onSelect={handleSelectExample} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-20">
        <SeedBanner
          seeded={search.seeded}
          seeding={search.seeding}
          seedMsg={search.seedMsg}
          onSeed={search.handleSeed}
        />

        {search.status === "error" && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
            <p className="text-red-300 font-bold">❌ Erro na busca</p>
            <p className="text-red-400/80 text-sm mt-1">{search.errorMsg}</p>
          </div>
        )}

        {search.status === "done" && search.aiResponse && (
          <AiResponse content={search.aiResponse} />
        )}

        {search.status === "done" && (
          <SearchResults results={search.results} query={search.query} />
        )}

        {search.status === "idle" && <EmptyState />}
      </div>
    </main>
  );
}
