import { describe, it, expect, vi, beforeEach } from "vitest";
import { analyzeContent } from "@/features/analyzer/services/analyzeContent";

// Mock the searchApiClient module
vi.mock("@/lib/searchapi", () => ({
  searchApiClient: {
    get: vi.fn(),
  },
}));

// Mock the Ollama client
vi.mock("@/lib/ollama", () => ({
  ollamaClient: {
    chat: vi.fn(),
  },
  ollamaModel: "llama3.2",
}));

import { searchApiClient } from "@/lib/searchapi";
import { ollamaClient } from "@/lib/ollama";

const mockGet = vi.mocked(searchApiClient.get);
const mockChat = vi.mocked(ollamaClient.chat);

describe("analyzeContent (integration with mocked API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default Ollama mock — returns valid JSON suggestions (object format like real Ollama)
    mockChat.mockResolvedValue({
      message: {
        role: "assistant",
        content: JSON.stringify({
          suggestions: [
            { title: "IA em 2026: O Guia Definitivo", description: "Descubra como a inteligência artificial está transformando o mundo." },
            { title: "Como Usar IA no Dia a Dia", description: "Dicas práticas para aproveitar a IA no cotidiano." },
            { title: "O Futuro da IA: Tendências e Previsões", description: "Análise das principais tendências de inteligência artificial." },
            { title: "IA para Iniciantes: Por Onde Começar", description: "Um guia completo para quem quer entender IA do zero." },
            { title: "Inteligência Artificial e Produtividade", description: "Como a IA pode aumentar sua produtividade no trabalho." },
          ],
        }),
      },
      model: "llama3.2",
      created_at: new Date(),
      done: true,
      done_reason: "stop",
      total_duration: 1000,
      load_duration: 100,
      prompt_eval_count: 50,
      prompt_eval_duration: 200,
      eval_count: 100,
      eval_duration: 700,
    } as never);
  });

  it("should return a valid AnalysisResult with API data", async () => {
    // Arrange — mock TIMESERIES call
    mockGet.mockImplementation(async (_url, config) => {
      const dataType = config?.params?.data_type;

      if (dataType === "TIMESERIES") {
        return {
          data: {
            interest_over_time: {
              timeline_data: [
                { date: "Jan 2025", values: [{ extracted_value: 70 }] },
                { date: "Feb 2025", values: [{ extracted_value: 75 }] },
                { date: "Mar 2025", values: [{ extracted_value: 80 }] },
                { date: "Apr 2025", values: [{ extracted_value: 85 }] },
              ],
            },
          },
        };
      }

      if (dataType === "RELATED_QUERIES") {
        return {
          data: {
            related_queries: {
              rising: [
                { query: "chatgpt trends", extracted_value: 5000 },
                { query: "ai tools", extracted_value: 3000 },
              ],
              top: [
                { query: "artificial intelligence", extracted_value: 100 },
                { query: "machine learning", extracted_value: 80 },
              ],
            },
          },
        };
      }

      return { data: {} };
    });

    // Act
    const result = await analyzeContent(
      "IA vai revolucionar o mundo",
      "Inteligência artificial está mudando tudo",
    );

    // Assert
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.feedback).toBeTruthy();
    expect(result.suggestedKeywords).toBeInstanceOf(Array);
    expect(result.suggestedKeywords.length).toBeGreaterThan(0);
    expect(result.trendData).toBeInstanceOf(Array);
    expect(result.trendData.length).toBe(4);
    expect(result.suggestions).toBeInstanceOf(Array);
    expect(result.suggestions.length).toBeLessThanOrEqual(5);
  });

  it("should have suggestions with real scores when API works", async () => {
    // Arrange
    mockGet.mockImplementation(async (_url, config) => {
      const dataType = config?.params?.data_type;

      if (dataType === "TIMESERIES") {
        return {
          data: {
            interest_over_time: {
              timeline_data: [
                { date: "Jan 2025", values: [{ extracted_value: 60 }] },
                { date: "Feb 2025", values: [{ extracted_value: 65 }] },
                { date: "Mar 2025", values: [{ extracted_value: 70 }] },
                { date: "Apr 2025", values: [{ extracted_value: 75 }] },
              ],
            },
          },
        };
      }

      if (dataType === "RELATED_QUERIES") {
        return {
          data: {
            related_queries: {
              rising: [{ query: "trending term", extracted_value: 9999 }],
              top: [],
            },
          },
        };
      }

      return { data: {} };
    });

    // Act
    const result = await analyzeContent("tecnologia", "");

    // Assert
    for (const suggestion of result.suggestions) {
      expect(suggestion.title).toBeTruthy();
      expect(suggestion.description).toBeTruthy();
      expect(suggestion.estimatedScore).toBeGreaterThanOrEqual(0);
      expect(suggestion.estimatedScore).toBeLessThanOrEqual(100);
    }
  });

  it("should return fallback data when API fails", async () => {
    // Arrange
    mockGet.mockRejectedValue(new Error("Network error"));

    // Act
    const result = await analyzeContent("test title", "test description");

    // Assert
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.feedback).toContain("dados simulados");
    expect(result.trendData.length).toBe(12); // 12 months of fake data
    expect(result.suggestions.length).toBe(5);
  });

  it("should handle empty related queries gracefully", async () => {
    // Arrange
    mockGet.mockImplementation(async (_url, config) => {
      const dataType = config?.params?.data_type;

      if (dataType === "TIMESERIES") {
        return {
          data: {
            interest_over_time: {
              timeline_data: [
                { date: "Jan 2025", values: [{ extracted_value: 50 }] },
              ],
            },
          },
        };
      }

      if (dataType === "RELATED_QUERIES") {
        return {
          data: {
            related_queries: { rising: [], top: [] },
          },
        };
      }

      return { data: {} };
    });

    // Act
    const result = await analyzeContent("something niche", "");

    // Assert
    expect(result.suggestedKeywords.length).toBeGreaterThan(0);
    expect(result.suggestions.length).toBe(5);
  });

  it("should handle missing timeline data", async () => {
    // Arrange
    mockGet.mockImplementation(async (_url, config) => {
      const dataType = config?.params?.data_type;

      if (dataType === "TIMESERIES") {
        return { data: { interest_over_time: {} } };
      }

      if (dataType === "RELATED_QUERIES") {
        return { data: { related_queries: { rising: [], top: [] } } };
      }

      return { data: {} };
    });

    // Act
    const result = await analyzeContent("empty data", "");

    // Assert
    expect(result.score).toBe(0);
    expect(result.trendData).toEqual([]);
  });
});
