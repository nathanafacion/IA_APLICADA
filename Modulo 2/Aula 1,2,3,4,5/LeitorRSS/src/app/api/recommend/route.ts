import { NextResponse } from "next/server";
import { getAllArticles, getChatHistory, getUserSummary } from "@/lib/db";

export const runtime = "nodejs";

// Stop words em português que não agregam valor na busca
const STOP_WORDS = new Set([
  "de", "da", "do", "das", "dos", "e", "em", "um", "uma", "o", "a", "os", "as",
  "para", "com", "por", "que", "no", "na", "nos", "nas", "se", "ou", "ao", "aos",
  "seu", "sua", "seus", "suas", "ele", "ela", "isso", "este", "esta", "esse", "essa",
  "como", "mais", "muito", "bem", "sobre", "gosta", "gosto", "interesses",
  "preferências", "usuário", "interesse", "preferência", "não", "sim", "ter",
  "ser", "está", "são", "foi", "tem", "pode", "vai",
]);

/**
 * Extrai palavras-chave relevantes de um texto.
 * Remove stop words e retorna termos significativos.
 */
function extractKeywords(text: string): string[] {
  if (!text.trim()) return [];

  const words = text
    .toLowerCase()
    .replace(/[;,.!?()\[\]{}"':\/\-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));

  return [...new Set(words)];
}

/**
 * Calcula score de relevância de um artigo baseado nas keywords de interesse.
 * Quanto mais keywords batem no título/descrição, maior o score.
 * Match no título vale mais que na descrição.
 */
function scoreArticle(
  article: { title: string; description: string },
  keywords: string[]
): number {
  const titleLower = article.title.toLowerCase();
  const descLower = article.description.toLowerCase();
  let score = 0;

  for (const kw of keywords) {
    if (titleLower.includes(kw)) score += 3; // título vale mais
    if (descLower.includes(kw)) score += 1;
  }

  return score;
}

export async function GET() {
  try {
    const articles = getAllArticles().filter((a) => !a.read);
    if (articles.length === 0) {
      return NextResponse.json({ recommendedIds: [], recommendedArticles: [] });
    }

    // Busca summary de interesses do usuário
    const userSummary = getUserSummary();
    const summaryText = userSummary?.summary || "";

    // Também pega keywords do histórico recente do chat
    const history = getChatHistory(20);
    const userMessages = history
      .filter((h) => h.role === "user")
      .map((h) => h.content)
      .join(" ");

    // Combina keywords do summary + mensagens recentes do usuário
    const keywords = extractKeywords(summaryText + " " + userMessages);
    console.log("[Recommend] Keywords para matching:", keywords);

    let recommended: typeof articles;

    if (keywords.length > 0) {
      // Calcula score de cada artigo e ordena por relevância
      const scored = articles.map((a) => ({
        article: a,
        score: scoreArticle(a, keywords),
      }));

      scored.sort((a, b) => b.score - a.score);

      // Pega os top 5 que tiveram score > 0
      const topMatches = scored.filter((s) => s.score > 0).slice(0, 5);

      if (topMatches.length >= 3) {
        // Se encontrou pelo menos 3 matches bons, usa eles
        recommended = topMatches.map((s) => s.article);
      } else {
        // Se poucos matches, pega os mais recentes
        recommended = articles.slice(0, 5);
      }
    } else {
      // Sem keywords (sem histórico), retorna os 5 mais recentes
      recommended = articles.slice(0, 5);
    }

    const recommendedIds = recommended.map((a) => a.id);
    const recommendedArticles = recommended.map((a) => ({
      id: a.id,
      title: a.title,
    }));

    console.log("[Recommend] IDs recomendados:", recommendedIds);

    return NextResponse.json({ recommendedIds, recommendedArticles });
  } catch (error) {
    console.error("Recommend API error:", error);
    // Fallback: retorna 5 artigos mais recentes não lidos
    try {
      const articles = getAllArticles().filter((a) => !a.read);
      const fallbackIds = articles.slice(0, 5).map((a) => a.id);
      const fallbackArticles = fallbackIds.map((id) => {
        const art = articles.find((a) => a.id === id);
        return { id, title: art?.title ?? "" };
      });
      return NextResponse.json({ recommendedIds: fallbackIds, recommendedArticles: fallbackArticles });
    } catch {
      return NextResponse.json({ recommendedIds: [], recommendedArticles: [] });
    }
  }
}
