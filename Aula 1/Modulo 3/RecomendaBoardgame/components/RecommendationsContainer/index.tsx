// Componente orquestrador da página de recomendações
'use client';

import { useState } from 'react';
import type { Game } from '@/types/game';
import { useModel } from '@/hooks/useModel';
import { useGamesData } from '@/hooks/useGamesData';
import { useRecommendations } from '@/hooks/useRecommendations';
import Autocomplete from '@/components/Autocomplete';
import SelectedGameCard from '@/components/SelectedGameCard';
import RecommendationsList from '@/components/RecommendationsList';
import ErrorMessage from '@/components/ErrorMessage';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function RecommendationsContainer() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  
  const { model, isLoading: modelLoading, error: modelError } = useModel();
  const { games, isLoading: gamesLoading, error: gamesError } = useGamesData();
  const { 
    recommendations, 
    isLoading: recommendationsLoading, 
    error: recommendationsError,
    generateRecommendations 
  } = useRecommendations();

  const handleGameSelect = async (game: Game) => {
    if (!model) {
      return;
    }

    setSelectedGame(game);
    await generateRecommendations(game, model, games);
  };

  // Show errors
  if (modelError) {
    return <ErrorMessage message={modelError} includeTrainingLink />;
  }

  if (gamesError) {
    return <ErrorMessage message={gamesError} />;
  }

  // Show loading
  if (modelLoading || gamesLoading) {
    return <LoadingSpinner message="Carregando dados..." />;
  }

  return (
    <>
      {/* Search Box */}
      <div className="mb-12">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <label className="block text-lg font-semibold mb-4 text-gray-700">
            Buscar Jogo:
          </label>
          <Autocomplete
            games={games}
            onSelect={handleGameSelect}
            selectedGame={selectedGame}
          />
        </div>
      </div>

      {/* Selected Game */}
      {selectedGame && <SelectedGameCard game={selectedGame} />}

      {/* Recommendations Error */}
      {recommendationsError && <ErrorMessage message={recommendationsError} />}

      {/* Recommendations */}
      <RecommendationsList 
        recommendations={recommendations} 
        isLoading={recommendationsLoading} 
      />

      {/* Instructions */}
      {!selectedGame && !modelError && !gamesError && (
        <div className="text-center py-12">
          <div className="inline-block p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
            <p className="text-2xl text-gray-600 mb-4">👆 Comece digitando o nome de um jogo acima</p>
            <p className="text-gray-500">
              Use o campo de busca para encontrar um jogo e receber recomendações personalizadas
            </p>
          </div>
        </div>
      )}
    </>
  );
}
