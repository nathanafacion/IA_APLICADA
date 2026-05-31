"use client";
import { useState } from "react";
import type { CarResult } from "@/features/cars/types";
import type { SearchStatus, UseCarSearchReturn } from "./CarSearch.types";

export function useCarSearch(initialSeeded: boolean): UseCarSearchReturn {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [results, setResults] = useState<CarResult[]>([]);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [seeded, setSeeded] = useState(initialSeeded);
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

  async function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (!query.trim()) return;
    setStatus("loading");
    setResults([]);
    setAiResponse(null);
    setErrorMsg("");
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, topK: 6 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro na busca");
      setResults(data.results);
      setAiResponse(data.aiResponse ?? null);
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Erro desconhecido");
      setStatus("error");
    }
  }

  async function handleSeed() {
    setSeeding(true);
    setSeedMsg("Gerando embeddings e populando Neo4j... isso pode levar alguns minutos.");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSeedMsg(data.message);
      setSeeded(true);
    } catch (err) {
      setSeedMsg("Erro: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSeeding(false);
    }
  }

  return {
    query,
    setQuery,
    status,
    results,
    aiResponse,
    errorMsg,
    seeded,
    seeding,
    seedMsg,
    handleSearch,
    handleSeed,
  };
}
