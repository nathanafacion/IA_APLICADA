// Componente puro para exibir card de jogo selecionado
import type { Game } from '@/types/game';
import {
  getFirstName,
  parseYear,
  getPlayersInfo,
  getMinAge,
  getDurationInfo,
  formatComplexity,
  getRatingsCount,
} from '@/utils/gameUtils';

interface SelectedGameCardProps {
  game: Game;
}

export default function SelectedGameCard({ game }: SelectedGameCardProps) {
  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-4">Jogo Selecionado:</h2>
      <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl shadow-lg p-6 border-2 border-primary-200">
        <h3 className="text-2xl font-bold text-primary-900 mb-4">
          {game.nome_do_jogo}
        </h3>
        
        {game.description && (
          <p className="mb-4 text-gray-700 italic">"{game.description}"</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {/* Designer */}
          {game.designer && (
            <div className="bg-white/50 p-3 rounded-lg">
              <span className="font-semibold text-gray-700 block">👤 Designer:</span>
              <p className="text-gray-600">{getFirstName(game.designer)}</p>
            </div>
          )}
          
          {/* Year */}
          {game.year && (
            <div className="bg-white/50 p-3 rounded-lg">
              <span className="font-semibold text-gray-700 block">📅 Ano:</span>
              <p className="text-gray-600">{parseYear(game.year)}</p>
            </div>
          )}
          
          {/* Players */}
          {game.raw_features && (
            <div className="bg-white/50 p-3 rounded-lg">
              <span className="font-semibold text-gray-700 block">👥 Jogadores:</span>
              <p className="text-gray-600">{getPlayersInfo(game)}</p>
            </div>
          )}
          
          {/* Age */}
          {game.raw_features && (
            <div className="bg-white/50 p-3 rounded-lg">
              <span className="font-semibold text-gray-700 block">🎂 Idade:</span>
              <p className="text-gray-600">{getMinAge(game)} anos</p>
            </div>
          )}
          
          {/* Time */}
          {game.raw_features && (
            <div className="bg-white/50 p-3 rounded-lg">
              <span className="font-semibold text-gray-700 block">⏱️ Duração:</span>
              <p className="text-gray-600">{getDurationInfo(game)}</p>
            </div>
          )}
          
          {/* Rating */}
          {game.average_rating && (
            <div className="bg-white/50 p-3 rounded-lg">
              <span className="font-semibold text-gray-700 block">⭐ Avaliação:</span>
              <p className="text-gray-600">{game.average_rating}/10</p>
            </div>
          )}
          
          {/* Complexity */}
          {game.complexity_rating && (
            <div className="bg-white/50 p-3 rounded-lg">
              <span className="font-semibold text-gray-700 block">🎲 Peso:</span>
              <p className="text-gray-600">{formatComplexity(game.complexity_rating)}/5</p>
            </div>
          )}
          
          {/* User Ratings */}
          {game.raw_features && (
            <div className="bg-white/50 p-3 rounded-lg">
              <span className="font-semibold text-gray-700 block">💬 Avaliações:</span>
              <p className="text-gray-600">{getRatingsCount(game)}</p>
            </div>
          )}
        </div>

        {game.category && (
          <div className="mt-4 pt-4 border-t border-primary-200">
            <span className="font-semibold text-gray-700">📂 Categorias:</span>
            <p className="text-gray-600 text-sm mt-1">{game.category}</p>
          </div>
        )}
      </div>
    </div>
  );
}
