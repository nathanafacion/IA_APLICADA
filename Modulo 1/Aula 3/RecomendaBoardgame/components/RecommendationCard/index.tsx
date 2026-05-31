// Componente puro para exibir card de recomendação
import type { GameWithSimilarity } from '@/types/game';
import {
  getFirstName,
  parseYear,
  getPlayersInfo,
  getMinAge,
  getDurationInfo,
  formatComplexity,
  getRatingsCount,
} from '@/utils/gameUtils';

interface RecommendationCardProps {
  game: GameWithSimilarity;
  index: number;
}

export default function RecommendationCard({ game, index }: RecommendationCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-transparent hover:border-primary-300">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold text-gray-800 flex-1">
          {index + 1}. {game.nome_do_jogo}
        </h3>
        <div className="ml-4 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-semibold">
          {(game.similarity * 100).toFixed(1)}% similar
        </div>
      </div>

      <div className="space-y-3 text-sm">
        {/* Row 1: Designer and Year */}
        <div className="grid grid-cols-2 gap-2">
          {game.designer && (
            <p className="text-gray-600">
              <span className="font-semibold">👤 Designer:</span> {getFirstName(game.designer)}
            </p>
          )}
          {game.year && (
            <p className="text-gray-600">
              <span className="font-semibold">📅 Ano:</span> {parseYear(game.year)}
            </p>
          )}
        </div>

        {/* Row 2: Players and Age */}
        {game.raw_features && (
          <div className="grid grid-cols-2 gap-2">
            <p className="text-gray-600">
              <span className="font-semibold">👥 Jogadores:</span> {getPlayersInfo(game)}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">🎂 Idade:</span> {getMinAge(game)}
            </p>
          </div>
        )}

        {/* Row 3: Time */}
        {game.raw_features && (
          <p className="text-gray-600">
            <span className="font-semibold">⏱️ Tempo:</span> {getDurationInfo(game)}
          </p>
        )}

        {/* Row 4: Rating and Complexity */}
        <div className="grid grid-cols-2 gap-2">
          {game.average_rating && (
            <p className="text-gray-600">
              <span className="font-semibold">⭐ Avaliação:</span> {game.average_rating}
            </p>
          )}
          {game.complexity_rating && (
            <p className="text-gray-600">
              <span className="font-semibold">🎲 Peso:</span> {formatComplexity(game.complexity_rating)}/5
            </p>
          )}
        </div>

        {/* Row 5: User Engagement */}
        {game.raw_features && (
          <p className="text-gray-600 text-xs">
            <span className="font-semibold">💬 Comunidade:</span> {getRatingsCount(game)} avaliações
          </p>
        )}
      </div>

      {game.description && (
        <p className="mt-4 text-gray-700 text-sm italic line-clamp-3">
          "{game.description}"
        </p>
      )}

      {game.mechanism && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            <span className="font-semibold">Mecânicas:</span> {game.mechanism}
          </p>
        </div>
      )}
    </div>
  );
}
