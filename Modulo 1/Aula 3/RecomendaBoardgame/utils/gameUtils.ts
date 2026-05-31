// Utilidades para manipulação de dados de jogos

/**
 * Formata um número grande com separador de milhar
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('pt-BR');
}

/**
 * Extrai o primeiro nome de uma string com múltiplos nomes separados por vírgula
 */
export function getFirstName(fullName: string): string {
  return fullName.split(',')[0].trim();
}

/**
 * Converte uma string de ano para inteiro
 */
export function parseYear(yearString: string): number {
  return parseInt(yearString);
}

/**
 * Formata um valor de complexidade para exibição
 */
export function formatComplexity(complexity: string): string {
  return parseFloat(complexity).toFixed(1);
}

/**
 * Verifica se um jogo tem features válidas (raw_features)
 */
export function hasRawFeatures(game: { raw_features?: number[] }): boolean {
  return Array.isArray(game.raw_features) && game.raw_features.length > 0;
}

/**
 * Obtém informações de jogadores de um jogo
 */
export function getPlayersInfo(game: { raw_features?: number[] }): string {
  if (!hasRawFeatures(game)) return 'N/A';
  return `${game.raw_features![0]}-${game.raw_features![1]}`;
}

/**
 * Obtém duração do jogo em minutos
 */
export function getDurationInfo(game: { raw_features?: number[] }): string {
  if (!hasRawFeatures(game)) return 'N/A';
  return `${game.raw_features![2]}-${game.raw_features![3]} min`;
}

/**
 * Obtém idade mínima do jogo
 */
export function getMinAge(game: { raw_features?: number[] }): string {
  if (!hasRawFeatures(game)) return 'N/A';
  return `${game.raw_features![5]}+`;
}

/**
 * Obtém número de avaliações formatado
 */
export function getRatingsCount(game: { raw_features?: number[] }): string {
  if (!hasRawFeatures(game)) return 'N/A';
  return formatNumber(game.raw_features![7]);
}
