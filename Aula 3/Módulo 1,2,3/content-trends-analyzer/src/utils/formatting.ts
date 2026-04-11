export function formatScore(score: number): string {
  if (score >= 80) return "Excelente";
  if (score >= 60) return "Bom";
  if (score >= 40) return "Moderado";
  if (score >= 20) return "Fraco";
  return "Muito Fraco";
}

export function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-cyan-500";
  if (score >= 40) return "text-amber-500";
  if (score >= 20) return "text-orange-500";
  return "text-rose-500";
}

export function scoreBg(score: number): string {
  if (score >= 80) return "bg-gradient-to-r from-emerald-500 to-green-400";
  if (score >= 60) return "bg-gradient-to-r from-cyan-500 to-blue-400";
  if (score >= 40) return "bg-gradient-to-r from-amber-500 to-yellow-400";
  if (score >= 20) return "bg-gradient-to-r from-orange-500 to-amber-400";
  return "bg-gradient-to-r from-rose-500 to-red-400";
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
