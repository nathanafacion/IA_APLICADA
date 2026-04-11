import { create } from "zustand";

export interface Suggestion {
  title: string;
  description: string;
  estimatedScore: number;
}

export interface AnalysisResult {
  score: number;
  feedback: string;
  suggestedKeywords: string[];
  trendData: { date: string; value: number }[];
  suggestions: Suggestion[];
}

export interface TrendingTerm {
  title: string;
  traffic: string;
  relatedQueries: string[];
  image?: string;
}

interface AppState {
  // Analyzer
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setIsAnalyzing: (val: boolean) => void;

  // Trends
  trendingTerms: TrendingTerm[];
  searchTrendData: { date: string; value: number }[];
  isLoadingTrends: boolean;
  setTrendingTerms: (terms: TrendingTerm[]) => void;
  setSearchTrendData: (data: { date: string; value: number }[]) => void;
  setIsLoadingTrends: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Analyzer
  analysisResult: null,
  isAnalyzing: false,
  setAnalysisResult: (result) => set({ analysisResult: result }),
  setIsAnalyzing: (val) => set({ isAnalyzing: val }),

  // Trends
  trendingTerms: [],
  searchTrendData: [],
  isLoadingTrends: false,
  setTrendingTerms: (terms) => set({ trendingTerms: terms }),
  setSearchTrendData: (data) => set({ searchTrendData: data }),
  setIsLoadingTrends: (val) => set({ isLoadingTrends: val }),
}));
