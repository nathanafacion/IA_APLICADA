// Componente puro para lista de recomendações
import type { GameWithSimilarity } from '@/types/game';
import RecommendationCard from '../RecommendationCard';

interface RecommendationsListProps {
  recommendations: GameWithSimilarity[];
  isLoading: boolean;
}

export default function RecommendationsList({ recommendations, isLoading }: RecommendationsListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <span className="ml-4 text-xl text-gray-600">Calculando recomendações...</span>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Jogos Recomendados:</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((game, index) => (
          <RecommendationCard key={game.id} game={game} index={index} />
        ))}
      </div>
    </div>
  );
}
