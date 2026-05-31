import { AnalyzerForm } from "@/features/analyzer/components/AnalyzerForm";

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight gradient-text leading-tight">
          Analise o Potencial do Seu Conteúdo
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Use o poder do Google Trends para descobrir se seu título vai bombar.
          Receba score, feedback e sugestões em tempo real.
        </p>
      </div>
      <AnalyzerForm />
    </div>
  );
}
