// Service para cálculo de similaridade entre jogos
import type { Game, GameWithSimilarity } from '@/types/game';

/**
 * Calcula a similaridade de cosseno entre dois vetores
 */
export function calculateCosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (normA * normB);
}

/**
 * Calcula a distância euclidiana entre dois vetores
 */
export function calculateEuclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  
  return Math.sqrt(sum);
}

/**
 * Encontra jogos similares baseado na similaridade de cosseno
 */
export function findSimilarGames(
  selectedGameFeatures: number[],
  allGamesFeatures: number[][],
  allGames: Game[],
  selectedGameId: number,
  topN: number = 4
): GameWithSimilarity[] {
  const similarities = allGamesFeatures
    .map((features, index) => ({
      game: allGames[index],
      similarity: calculateCosineSimilarity(selectedGameFeatures, features),
    }))
    .filter(item => item.game.id !== selectedGameId) // Exclude the selected game
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topN);
  
  return similarities.map(({ game, similarity }) => ({
    ...game,
    similarity,
  }));
}
