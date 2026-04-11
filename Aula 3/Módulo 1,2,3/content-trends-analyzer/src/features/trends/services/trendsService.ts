import { searchApiClient } from "@/lib/searchapi";
import type { TrendingTerm } from "@/store/useAppStore";

export async function fetchTrendingNow(): Promise<TrendingTerm[]> {
  try {
    const { data } = await searchApiClient.get("/search", {
      params: {
        engine: "google_trends_trending",
        geo: "BR",
      },
    });

    return (data.trending_searches ?? [])
      .slice(0, 20)
      .map(
        (item: {
          query: string;
          formatted_traffic?: string;
          related_queries?: { query: string }[];
          image?: { url: string };
        }) => ({
          title: item.query,
          traffic: item.formatted_traffic ?? "N/A",
          relatedQueries: (item.related_queries ?? []).map(
            (q: { query: string }) => q.query
          ),
          image: item.image?.url,
        })
      );
  } catch {
    // Fallback simulated data
    return [
      { title: "Inteligência Artificial", traffic: "500K+", relatedQueries: ["ChatGPT", "Gemini", "Claude"], },
      { title: "Next.js 16", traffic: "200K+", relatedQueries: ["React", "Vercel", "Server Components"], },
      { title: "Copa do Mundo 2026", traffic: "1M+", relatedQueries: ["FIFA", "Seleção Brasileira"], },
      { title: "Sustentabilidade", traffic: "100K+", relatedQueries: ["ESG", "Energia Solar"], },
      { title: "Criptomoedas", traffic: "300K+", relatedQueries: ["Bitcoin", "Ethereum"], },
    ];
  }
}

export async function fetchInterestOverTime(
  query: string
): Promise<{ date: string; value: number }[]> {
  try {
    const { data } = await searchApiClient.get("/search", {
      params: {
        engine: "google_trends",
        q: query,
        data_type: "TIMESERIES",
      },
    });

    return (data.interest_over_time?.timeline_data ?? []).map(
      (item: { date: string; values: { extracted_value: number }[] }) => ({
        date: item.date,
        value: item.values?.[0]?.extracted_value ?? 0,
      })
    );
  } catch {
    return Array.from({ length: 12 }, (_, i) => ({
      date: new Date(2025, i, 1).toISOString().split("T")[0],
      value: Math.floor(Math.random() * 80) + 10,
    }));
  }
}
