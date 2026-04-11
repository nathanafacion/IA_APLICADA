import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { AnalysisResult } from "@/store/useAppStore";
import { formatScore, scoreColor, scoreBg } from "@/utils/formatting";

export function ScoreDisplay({ result }: { result: AnalysisResult }) {
  return (
    <Card className="border-primary/20 shadow-lg overflow-hidden">
      <div className={`h-1.5 w-full ${scoreBg(result.score)}`} />
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-xl">🎯 Resultado da Análise</span>
          <div className="flex items-center gap-2">
            <span className={`text-4xl font-bold ${scoreColor(result.score)} drop-shadow-sm`}>
              {result.score}
            </span>
            <span className="text-lg text-muted-foreground font-normal">/100</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Score</span>
            <Badge className={`${scoreBg(result.score)} text-white border-0 text-xs font-semibold`}>
              {formatScore(result.score)}
            </Badge>
          </div>
          <Progress value={result.score} className="h-3 bg-muted" />
        </div>

        <Separator className="bg-border/50" />

        <div className="rounded-lg bg-muted/50 p-4">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            💡 Feedback
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{result.feedback}</p>
        </div>

        <Separator className="bg-border/50" />

        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-1.5">
            🏷️ Palavras-chave Sugeridas
          </h4>
          <div className="flex flex-wrap gap-2">
            {result.suggestedKeywords.map((kw) => (
              <Badge
                key={kw}
                variant="secondary"
                className="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-default"
              >
                {kw}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
