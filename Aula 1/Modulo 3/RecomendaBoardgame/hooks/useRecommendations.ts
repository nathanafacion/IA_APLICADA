// Hook para gerar recomendações de jogos
import { useState } from 'react';
import type * as tf from '@tensorflow/tfjs';
import type { Game, GameWithSimilarity } from '@/types/game';
import { getPredictions } from '@/services/modelService';
import { findSimilarGames } from '@/services/similarityService';

interface UseRecommendationsReturn {
  recommendations: GameWithSimilarity[];
  isLoading: boolean;
  error: string | null;
  generateRecommendations: (game: Game, model: tf.Sequential, allGames: Game[]) => Promise<void>;
}

/**
 * Hook para gerar recomendações baseadas em similaridade
 */
export function useRecommendations(): UseRecommendationsReturn {
  const [recommendations, setRecommendations] = useState<GameWithSimilarity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecommendations = async (
    selectedGame: Game,
    model: tf.Sequential,
    allGames: Game[]
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      // Get predictions for all games
      const allFeatures = allGames.map(g => g.features);
      const predictions = await getPredictions(model, allFeatures);

      // Find similar games based on the selected game's predicted features
      const selectedPrediction = predictions[selectedGame.id];
      const similarGames = findSimilarGames(
        selectedPrediction,
        predictions,
        allGames,
        selectedGame.id,
        4
      );

      setRecommendations(similarGames);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar recomendações');
      console.error('Recommendation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recommendations,
    isLoading,
    error,
    generateRecommendations,
  };
}
