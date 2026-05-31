"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { TrendChart } from "@/features/shared/TrendChart";

export function TrendSearch() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const { searchTrendData, setSearchTrendData } = useAppStore();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(
        `/api/trends/search?q=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();
      setSearchTrendData(Array.isArray(data) ? data : []);
    } catch {
      setSearchTrendData([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-primary/20 shadow-lg overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-[oklch(0.7_0.2_195)] to-[oklch(0.6_0.24_275)]" />
      <CardHeader>
        <CardTitle className="text-xl">🔎 Buscar Termo Específico</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Ex: inteligência artificial"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 h-11 border-primary/20 focus:border-primary focus:ring-primary/30 transition-all"
          />
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="h-11 px-6 gradient-bg hover:opacity-90 transition-all duration-300 shadow-md"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Buscando...
              </span>
            ) : (
              "Buscar"
            )}
          </Button>
        </form>
        {searchTrendData.length > 0 && <TrendChart data={searchTrendData} />}
      </CardContent>
    </Card>
  );
}
