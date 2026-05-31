"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Suggestion } from "@/store/useAppStore";
import { scoreColor, scoreBg, formatScore } from "@/utils/formatting";

export function SuggestionsDisplay({
  suggestions,
  originalScore,
}: {
  suggestions: Suggestion[];
  originalScore: number;
}) {
  return (
    <Card className="border-primary/20 shadow-lg overflow-hidden">
      <div className="h-1.5 w-full bg-gradient-to-r from-[oklch(0.7_0.24_310)] to-[oklch(0.65_0.2_275)]" />
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          ✨ Sugestões de Títulos Otimizados
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Baseado nas tendências atuais, estas alternativas podem ter melhor desempenho.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion, i) => {
          const diff = suggestion.estimatedScore - originalScore;
          return (
            <div
              key={i}
              className="group rounded-xl border border-border/60 p-4 space-y-3 hover:border-primary/40 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground bg-muted rounded-full w-6 h-6 flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <h4 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors">
                      {suggestion.title}
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground pl-8 leading-relaxed">
                    {suggestion.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-2xl font-bold ${scoreColor(suggestion.estimatedScore)}`}>
                    {suggestion.estimatedScore}
                  </span>
                  {diff > 0 && (
                    <div className="text-xs font-medium text-emerald-500">
                      +{diff} pts
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={suggestion.estimatedScore} className="h-2 bg-muted flex-1" />
                <Badge className={`${scoreBg(suggestion.estimatedScore)} text-white border-0 text-[10px] font-semibold`}>
                  {formatScore(suggestion.estimatedScore)}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
