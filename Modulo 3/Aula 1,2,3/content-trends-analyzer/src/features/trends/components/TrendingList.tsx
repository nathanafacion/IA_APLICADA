"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/useAppStore";

export function TrendingList() {
  const { trendingTerms, isLoadingTrends, setTrendingTerms, setIsLoadingTrends } =
    useAppStore();

  useEffect(() => {
    async function load() {
      setIsLoadingTrends(true);
      try {
        const res = await fetch("/api/trends");
        const data = await res.json();
        setTrendingTerms(data);
      } catch {
        setTrendingTerms([]);
      } finally {
        setIsLoadingTrends(false);
      }
    }
    load();
  }, [setTrendingTerms, setIsLoadingTrends]);

  if (isLoadingTrends) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <span className="h-8 w-8 rounded-full border-3 border-primary/30 border-t-primary animate-spin" />
        <span className="text-muted-foreground font-medium">Carregando tendências...</span>
      </div>
    );
  }

  if (!trendingTerms.length) {
    return (
      <div className="text-center py-16">
        <span className="text-4xl mb-3 block">🔍</span>
        <span className="text-muted-foreground font-medium">
          Nenhuma tendência encontrada.
        </span>
      </div>
    );
  }

  const cardColors = [
    "from-violet-500/10 to-purple-500/5 border-violet-200",
    "from-cyan-500/10 to-blue-500/5 border-cyan-200",
    "from-emerald-500/10 to-green-500/5 border-emerald-200",
    "from-amber-500/10 to-yellow-500/5 border-amber-200",
    "from-rose-500/10 to-pink-500/5 border-rose-200",
    "from-indigo-500/10 to-blue-500/5 border-indigo-200",
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {trendingTerms.map((term, i) => (
        <Card
          key={term.title}
          className={`card-hover border bg-gradient-to-br ${cardColors[i % cardColors.length]} overflow-hidden`}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">{term.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tráfego
              </span>
              <Badge className="gradient-bg text-white border-0 text-xs font-bold">
                {term.traffic}
              </Badge>
            </div>
            {term.relatedQueries.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {term.relatedQueries.map((q) => (
                  <Badge
                    key={q}
                    variant="outline"
                    className="text-xs bg-white/60 hover:bg-white/80 transition-colors"
                  >
                    {q}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
