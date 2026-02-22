// Hook para carregar dados de jogos
import { useState, useEffect } from 'react';
import type { Game } from '@/types/game';

interface UseGamesDataReturn {
  games: Game[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook para carregar e gerenciar dados de jogos
 */
export function useGamesData(): UseGamesDataReturn {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGames() {
      try {
        const response = await fetch('/data/raw_data.json');
        if (!response.ok) {
          throw new Error('Erro ao carregar dados dos jogos');
        }
        const data = await response.json();
        setGames(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        console.error('Error loading games:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadGames();
  }, []);

  return { games, isLoading, error };
}
