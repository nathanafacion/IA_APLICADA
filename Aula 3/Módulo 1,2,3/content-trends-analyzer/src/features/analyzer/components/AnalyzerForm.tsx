"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { ScoreDisplay } from "./ScoreDisplay";
import { SuggestionsDisplay } from "./SuggestionsDisplay";
import { TrendChart } from "@/features/shared/TrendChart";

export function AnalyzerForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { analysisResult, isAnalyzing, setAnalysisResult, setIsAnalyzing } =
    useAppStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      const data = await res.json();
      setAnalysisResult(data);
    } catch {
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-lg glow-sm overflow-hidden">
        <div className="h-1 w-full gradient-bg" />
        <CardHeader>
          <CardTitle className="text-2xl gradient-text">
            Analisador de Sucesso de Conteúdo
          </CardTitle>
          <CardDescription className="text-base">
            Informe o título e a descrição do seu vídeo ou post. Analisaremos o
            potencial de sucesso usando dados do Google Trends.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-semibold text-foreground">
                Título
              </label>
              <Input
                id="title"
                placeholder="Ex: Como usar IA para criar conteúdo viral"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="h-11 border-primary/20 focus:border-primary focus:ring-primary/30 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-semibold text-foreground">
                Descrição (opcional)
              </label>
              <Textarea
                id="description"
                placeholder="Descreva brevemente o conteúdo do seu vídeo ou post..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="border-primary/20 focus:border-primary focus:ring-primary/30 transition-all"
              />
            </div>
            <Button
              type="submit"
              disabled={isAnalyzing || !title.trim()}
              className="w-full h-12 text-base font-semibold gradient-bg hover:opacity-90 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Analisando...
                </span>
              ) : (
                "🚀 Analisar Conteúdo"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {analysisResult && (
        <>
          <ScoreDisplay result={analysisResult} />
          {analysisResult.suggestions.length > 0 && (
            <SuggestionsDisplay
              suggestions={analysisResult.suggestions}
              originalScore={analysisResult.score}
            />
          )}
          {analysisResult.trendData.length > 0 && (
            <Card className="border-primary/20 shadow-lg overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-[oklch(0.7_0.2_195)] to-[oklch(0.6_0.24_275)]" />
              <CardHeader>
                <CardTitle className="text-xl">📈 Interesse ao Longo do Tempo</CardTitle>
              </CardHeader>
              <CardContent>
                <TrendChart data={analysisResult.trendData} />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
