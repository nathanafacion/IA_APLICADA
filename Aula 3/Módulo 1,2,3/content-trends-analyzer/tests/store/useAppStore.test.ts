import { describe, it, expect } from "vitest";
import { useAppStore } from "@/store/useAppStore";
import type { AnalysisResult, TrendingTerm } from "@/store/useAppStore";

describe("useAppStore", () => {
  beforeEach(() => {
    // Reset store to initial state
    useAppStore.setState({
      analysisResult: null,
      isAnalyzing: false,
      trendingTerms: [],
      searchTrendData: [],
      isLoadingTrends: false,
    });
  });

  describe("initial state", () => {
    it("should have null analysisResult", () => {
      expect(useAppStore.getState().analysisResult).toBeNull();
    });

    it("should have isAnalyzing as false", () => {
      expect(useAppStore.getState().isAnalyzing).toBe(false);
    });

    it("should have empty trendingTerms", () => {
      expect(useAppStore.getState().trendingTerms).toEqual([]);
    });

    it("should have empty searchTrendData", () => {
      expect(useAppStore.getState().searchTrendData).toEqual([]);
    });

    it("should have isLoadingTrends as false", () => {
      expect(useAppStore.getState().isLoadingTrends).toBe(false);
    });
  });

  describe("analyzer actions", () => {
    it("should set analysis result", () => {
      // Arrange
      const result: AnalysisResult = {
        score: 75,
        feedback: "Bom potencial.",
        suggestedKeywords: ["ia", "tecnologia"],
        trendData: [{ date: "2025-01-01", value: 50 }],
        suggestions: [
          { title: "Test Title", description: "Test Description", estimatedScore: 80 },
        ],
      };

      // Act
      useAppStore.getState().setAnalysisResult(result);

      // Assert
      expect(useAppStore.getState().analysisResult).toEqual(result);
    });

    it("should clear analysis result with null", () => {
      // Arrange
      useAppStore.getState().setAnalysisResult({
        score: 50,
        feedback: "test",
        suggestedKeywords: [],
        trendData: [],
        suggestions: [],
      });

      // Act
      useAppStore.getState().setAnalysisResult(null);

      // Assert
      expect(useAppStore.getState().analysisResult).toBeNull();
    });

    it("should set isAnalyzing flag", () => {
      // Act
      useAppStore.getState().setIsAnalyzing(true);

      // Assert
      expect(useAppStore.getState().isAnalyzing).toBe(true);
    });
  });

  describe("trends actions", () => {
    it("should set trending terms", () => {
      // Arrange
      const terms: TrendingTerm[] = [
        { title: "IA", traffic: "100K+", relatedQueries: ["chatgpt"] },
        { title: "Next.js", traffic: "50K+", relatedQueries: ["react"] },
      ];

      // Act
      useAppStore.getState().setTrendingTerms(terms);

      // Assert
      expect(useAppStore.getState().trendingTerms).toEqual(terms);
      expect(useAppStore.getState().trendingTerms).toHaveLength(2);
    });

    it("should set search trend data", () => {
      // Arrange
      const data = [
        { date: "2025-01-01", value: 40 },
        { date: "2025-02-01", value: 60 },
      ];

      // Act
      useAppStore.getState().setSearchTrendData(data);

      // Assert
      expect(useAppStore.getState().searchTrendData).toEqual(data);
    });

    it("should set isLoadingTrends flag", () => {
      // Act
      useAppStore.getState().setIsLoadingTrends(true);

      // Assert
      expect(useAppStore.getState().isLoadingTrends).toBe(true);
    });
  });
});
