'use client';

import { useState, useEffect, useMemo } from 'react';
import { Game } from '@/types/game';

interface AutocompleteProps {
  games: Game[];
  onSelect: (game: Game) => void;
  selectedGame: Game | null;
}

export default function Autocomplete({ games, onSelect, selectedGame }: AutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Filter games based on search term
  const filteredGames = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    return games
      .filter(game => game.nome_do_jogo.toLowerCase().includes(term))
      .slice(0, 10); // Limit to 10 suggestions
  }, [searchTerm, games]);

  useEffect(() => {
    setIsOpen(searchTerm.length > 0 && filteredGames.length > 0);
  }, [searchTerm, filteredGames]);

  useEffect(() => {
    if (selectedGame) {
      setSearchTerm(selectedGame.nome_do_jogo);
      setIsOpen(false);
    }
  }, [selectedGame]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredGames.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredGames.length) {
          handleSelect(filteredGames[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  const handleSelect = (game: Game) => {
    setSearchTerm(game.nome_do_jogo);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSelect(game);
  };

  const handleClear = () => {
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite o nome de um jogo de tabuleiro..."
          className="w-full px-4 py-3 pr-10 text-lg border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 transition"
          aria-autocomplete="list"
          aria-controls="autocomplete-list"
          aria-expanded={isOpen}
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Limpar busca"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <ul
          id="autocomplete-list"
          className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-xl max-h-96 overflow-y-auto"
          role="listbox"
        >
          {filteredGames.map((game, index) => (
            <li
              key={game.id}
              onClick={() => handleSelect(game)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`px-4 py-3 cursor-pointer transition ${
                index === highlightedIndex
                  ? 'bg-primary-100 text-primary-900'
                  : 'hover:bg-gray-100'
              }`}
              role="option"
              aria-selected={index === highlightedIndex}
            >
              <div className="font-semibold">{game.nome_do_jogo}</div>
              <div className="text-sm text-gray-600 truncate">
                {game.designer && `${game.designer} • `}
                {game.year && `${game.year} • `}
                ⭐ {game.average_rating || 'N/A'}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* No results message */}
      {searchTerm && !isOpen && filteredGames.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4">
          <p className="text-gray-600">Nenhum jogo encontrado com "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}
