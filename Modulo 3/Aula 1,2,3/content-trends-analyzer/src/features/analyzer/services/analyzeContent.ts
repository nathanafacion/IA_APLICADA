import { searchApiClient } from "@/lib/searchapi";
import { ollamaClient, ollamaModel } from "@/lib/ollama";
import type { AnalysisResult, Suggestion } from "@/store/useAppStore";

export function extractKeywords(title: string, description: string): string[] {
  const stopwords = new Set([
    "o", "a", "os", "as", "um", "uma", "de", "do", "da", "dos", "das",
    "em", "no", "na", "nos", "nas", "por", "para", "com", "como", "que",
    "se", "e", "ou", "the", "a", "an", "is", "of", "to", "in", "for",
    "and", "or", "on", "at", "by", "with", "how", "what", "why",
  ]);
  const combined = `${title} ${description}`;
  return [...new Set(
    combined
      .toLowerCase()
      .replace(/[^\w\sáéíóúâêîôûãõç]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopwords.has(w))
  )];
}

export function calculateScore(interestValues: number[]): number {
  if (!interestValues.length) return 0;
  const avg = interestValues.reduce((s, v) => s + v, 0) / interestValues.length;
  const recent = interestValues.slice(-4);
  const recentAvg = recent.reduce((s, v) => s + v, 0) / recent.length;
  const trendBonus = recentAvg > avg ? 15 : 0;
  const peakBonus = Math.max(...interestValues) >= 80 ? 10 : 0;
  return Math.min(100, Math.round(avg + trendBonus + peakBonus));
}

export function generateFeedback(score: number, keywords: string[]): string {
  if (score >= 80) {
    return `Excelente potencial! As palavras-chave "${keywords.slice(0, 3).join(", ")}" estão em alta demanda. Publique o mais rápido possível para aproveitar a tendência.`;
  }
  if (score >= 60) {
    return `Bom potencial. O conteúdo tem interesse consistente. Considere otimizar o título com variações das palavras-chave para maximizar o alcance.`;
  }
  if (score >= 40) {
    return `Potencial moderado. Tente combinar suas palavras-chave com termos mais populares ou abordar um ângulo diferente do tema.`;
  }
  return `Potencial baixo no momento. Considere reformular o título e a descrição com termos mais buscados ou aguardar um momento mais oportuno.`;
}

export function extractTopic(title: string): string {
  const trimPrefixes = /^(o|a|os|as|um|uma|the|an)\b\s*/i;
  let result = title.trim();
  result = result.replace(trimPrefixes, "");
  result = result.replace(/[.!?:]+$/, "").trim();
  return result || title.trim();
}

export function capitalize(str: string): string {
  return str
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ---------- Related queries fetcher ----------

interface RelatedQueryItem {
  query: string;
  extracted_value: number;
}

async function fetchRelatedQueries(
  query: string,
): Promise<{ rising: RelatedQueryItem[]; top: RelatedQueryItem[] }> {
  try {
    const { data } = await searchApiClient.get("/search", {
      params: {
        engine: "google_trends",
        q: query,
        data_type: "RELATED_QUERIES",
      },
    });
    const rising: RelatedQueryItem[] = (data.related_queries?.rising ?? [])
      .slice(0, 10)
      .map((q: { query: string; extracted_value: number }) => ({
        query: q.query,
        extracted_value: q.extracted_value ?? 0,
      }));
    const top: RelatedQueryItem[] = (data.related_queries?.top ?? [])
      .slice(0, 10)
      .map((q: { query: string; extracted_value: number }) => ({
        query: q.query,
        extracted_value: q.extracted_value ?? 0,
      }));
    return { rising, top };
  } catch {
    return { rising: [], top: [] };
  }
}

// ---------- Score fetcher for a single query ----------

async function fetchScoreForQuery(query: string): Promise<number> {
  try {
    const { data } = await searchApiClient.get("/search", {
      params: {
        engine: "google_trends",
        q: query,
        data_type: "TIMESERIES",
      },
    });
    const values: number[] = (data.interest_over_time?.timeline_data ?? [])
      .map((item: { values: { extracted_value: number }[] }) =>
        item.values?.[0]?.extracted_value ?? 0,
      );
    return calculateScore(values);
  } catch {
    return 0;
  }
}

// ---------- Suggestion generation via Ollama LLM ----------

function parseOllamaResponse(content: string): { title: string; description: string }[] {
  const parsed = JSON.parse(content);

  // Case 1: direct array of objects [{title, description}, ...]
  if (Array.isArray(parsed)) {
    const valid = parsed.filter(
      (it: unknown) =>
        typeof it === "object" && it !== null &&
        typeof (it as Record<string, unknown>).title === "string" &&
        typeof (it as Record<string, unknown>).description === "string",
    );
    if (valid.length > 0) return valid;
  }

  // Case 2: object wrapping an array { suggestions: [...], results: [...], etc }
  if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
    for (const val of Object.values(parsed)) {
      if (Array.isArray(val) && val.length > 0) {
        // Sub-case 2a: array of objects with title+description
        const asObjects = val.filter(
          (it: unknown) =>
            typeof it === "object" && it !== null &&
            typeof (it as Record<string, unknown>).title === "string" &&
            typeof (it as Record<string, unknown>).description === "string",
        );
        if (asObjects.length > 0) return asObjects;

        // Sub-case 2b: array of plain strings (title only) → build items
        const asStrings = val.filter((it: unknown) => typeof it === "string" && (it as string).length > 0);
        if (asStrings.length > 0) {
          return asStrings.map((t: string) => ({
            title: t,
            description: "",
          }));
        }
      }
    }
  }

  return [];
}

async function generateSuggestions(
  originalTitle: string,
  originalDescription: string,
  originalScore: number,
  relatedRising: RelatedQueryItem[],
  relatedTop: RelatedQueryItem[],
): Promise<Suggestion[]> {
  const risingTerms = relatedRising.map((q) => q.query).slice(0, 8);
  const topTerms = relatedTop.filter((q) => q.extracted_value >= 50).map((q) => q.query).slice(0, 8);
  const trendingTerms = [...new Set([...risingTerms, ...topTerms])];

  const userMessage = `Você é um copywriter brasileiro especialista em SEO e marketing de conteúdo.

Gere exatamente 5 títulos alternativos otimizados para o conteúdo abaixo, cada um com uma descrição curta.

TÍTULO ORIGINAL: "${originalTitle}"
${originalDescription ? `DESCRIÇÃO: "${originalDescription}"` : ""}
${trendingTerms.length > 0 ? `TERMOS EM ALTA: ${trendingTerms.join(", ")}` : ""}

Regras:
1. Títulos curtos (máx 80 caracteres), chamativos, gramaticalmente perfeitos em pt-BR
2. Incorpore termos em alta quando fizer sentido natural
3. Descrição de 1 frase complementando o título
4. Mantenha o tema original

Responda com este JSON exato:
{"suggestions":[{"title":"titulo aqui","description":"descricao aqui"},{"title":"titulo aqui","description":"descricao aqui"},{"title":"titulo aqui","description":"descricao aqui"},{"title":"titulo aqui","description":"descricao aqui"},{"title":"titulo aqui","description":"descricao aqui"}]}`;

  try {
    const response = await ollamaClient.chat({
      model: ollamaModel,
      messages: [{ role: "user", content: userMessage }],
      format: "json",
      options: { temperature: 0.7, num_predict: 1500 },
    });

    const content = response.message.content.trim();
    let items = parseOllamaResponse(content);

    if (items.length === 0) {
      console.error("[Ollama] JSON sem sugestões válidas:", content.slice(0, 300));
      throw new Error("No valid suggestions in LLM response");
    }

    // Fill missing descriptions
    items = items.slice(0, 5).map((it) => ({
      title: it.title.replace(/^["']|["']$/g, "").trim(),
      description: it.description
        ? it.description.replace(/^["']|["']$/g, "").trim()
        : `Saiba mais sobre ${extractTopic(it.title)}.`,
    }));

    console.log(`[Ollama] ${items.length} sugestões geradas:`, items.map((i) => i.title));

    // Fetch REAL scores for each suggestion in parallel
    const scorePromises = items.map(async (item) => {
      const kws = extractKeywords(item.title, item.description);
      const q = kws.slice(0, 5).join(",");
      const realScore = await fetchScoreForQuery(q);
      return {
        title: item.title,
        description: item.description,
        estimatedScore: realScore || Math.min(100, originalScore + 5),
      };
    });

    const results = await Promise.all(scorePromises);
    return results.sort((a, b) => b.estimatedScore - a.estimatedScore);
  } catch (err) {
    console.error("[Ollama] Falha ao gerar sugestões, usando fallback:", err instanceof Error ? err.message : err);
    return generateFallbackSuggestions(originalTitle, originalScore, trendingTerms);
  }
}

function generateFallbackSuggestions(
  originalTitle: string,
  originalScore: number,
  trendingTerms: string[],
): Suggestion[] {
  const topic = extractTopic(originalTitle);
  // Pega só as primeiras palavras para não ficar gigante
  const shortTopic = topic.split(/\s+/).slice(0, 4).join(" ");
  const year = new Date().getFullYear();

  const withTrend = (trend: string) => [
    `${shortTopic} e ${capitalize(trend)}: Guia ${year}`,
    `Como Usar ${capitalize(trend)} em ${shortTopic}`,
    `${capitalize(trend)}: O Impacto em ${shortTopic}`,
    `${shortTopic} + ${capitalize(trend)} — Tendências`,
    `Por Que ${capitalize(trend)} Muda ${shortTopic}`,
  ];

  const withoutTrend = [
    `Guia Completo: ${shortTopic} em ${year}`,
    `${shortTopic} — O Que Você Precisa Saber`,
    `Como Aproveitar ${shortTopic} Agora`,
    `${shortTopic}: Estratégias Que Funcionam`,
    `O Futuro de ${shortTopic}: Tendências ${year}`,
  ];

  const titles = trendingTerms.length > 0
    ? withTrend(trendingTerms[0])
    : withoutTrend;

  return titles.map((title, i) => ({
    title,
    description: `Explore tudo sobre ${shortTopic}${trendingTerms[i] ? ` e ${trendingTerms[i]}` : ""} com dicas práticas.`,
    estimatedScore: Math.min(100, originalScore + 5 + i * 2),
  }));
}

// ---------- Main analysis ----------

export async function analyzeContent(
  title: string,
  description: string
): Promise<AnalysisResult> {
  const keywords = extractKeywords(title, description);
  const query = keywords.slice(0, 5).join(",");

  try {
    // Fetch timeseries + related queries in parallel
    const [timeseriesRes, related] = await Promise.all([
      searchApiClient.get("/search", {
        params: {
          engine: "google_trends",
          q: query,
          data_type: "TIMESERIES",
        },
      }),
      fetchRelatedQueries(query),
    ]);

    const data = timeseriesRes.data;

    const timelineData: { date: string; value: number }[] = (
      data.interest_over_time?.timeline_data ?? []
    ).map((item: { date: string; values: { extracted_value: number }[] }) => ({
      date: item.date,
      value: item.values?.[0]?.extracted_value ?? 0,
    }));

    const interestValues = timelineData.map((d) => d.value);
    const score = calculateScore(interestValues);
    const feedback = generateFeedback(score, keywords);

    const allRelatedNames = [
      ...related.rising.map((q) => q.query),
      ...related.top.map((q) => q.query),
    ];
    const suggestedKeywords = allRelatedNames.length > 0
      ? [...new Set(allRelatedNames)].slice(0, 8)
      : keywords.slice(0, 5);

    const suggestions = await generateSuggestions(
      title,
      description,
      score,
      related.rising,
      related.top,
    );

    return {
      score,
      feedback,
      suggestedKeywords,
      trendData: timelineData,
      suggestions,
    };
  } catch {
    // Fallback – generate simulated data when API is unavailable
    const fakeTimeline = Array.from({ length: 12 }, (_, i) => ({
      date: new Date(2025, i, 1).toISOString().split("T")[0],
      value: Math.floor(Math.random() * 60) + 20,
    }));
    const values = fakeTimeline.map((d) => d.value);
    const score = calculateScore(values);
    const suggestions = generateFallbackSuggestions(extractTopic(title), score, []);
    return {
      score,
      feedback: generateFeedback(score, keywords) + " (dados simulados — configure SEARCH_API_KEY para dados reais)",
      suggestedKeywords: keywords.slice(0, 5),
      trendData: fakeTimeline,
      suggestions,
    };
  }
}
