// Types and Interfaces for Truco Card Comparison

export type Naipe = "paus" | "ouro" | "copas" | "espadas";

export interface Carta {
  valor: string; // "A", "2", "3", "4", "5", "6", "7", "Q", "J", "K"
  naipe: Naipe;
  forca: number; // força da carta no Truco
  nomeCompleto: string; // Nome como aparece no modelo
}

export interface Jogador {
  nome: string;
  mao: Carta[];
  pontosRodada: number; // quantas quedas ganhou na rodada atual
  pontosTotais: number; // pontos totais da partida (até 12)
}

export type GamePhase = "inicio" | "jogando" | "aguardando" | "fim-rodada" | "fim-jogo";

// Valores das cartas no truco (menores valores = mais fracas)
// 1 = 4 (mais fraca), 10 = 3 (mais forte sem manilha)
const VALORES_BASE: { [key: string]: number } = {
  "4": 1,
  "5": 2,
  "6": 3,
  "7": 4,
  "Q": 5,  // Dama
  "J": 6,  // Valete
  "K": 7,  // Rei
  "A": 8,  // Ás
  "2": 9,
  "3": 10,
};

// Ordem dos valores para determinar a manilha (carta seguinte à vira)
const ORDEM_VALORES = ["4", "5", "6", "7", "Q", "J", "K", "A", "2", "3"];

// Hierarquia de naipes para manilhas (Paus > Copas > Espadas > Ouros)
const HIERARQUIA_NAIPES: { [key in Naipe]: number } = {
  "paus": 14,    // Zap (mais forte)
  "copas": 13,   // Copas
  "espadas": 12, // Espadilha
  "ouro": 11,    // Ouros (mais fraco)
};

// Carta vira atual (define qual é a manilha)
let CARTA_VIRA: string = "7"; // Por padrão, 7 é vira, manilha é Q

// Obter o valor da carta manilha baseado na vira
export function getValorManilha(): string {
  const indiceVira = ORDEM_VALORES.indexOf(CARTA_VIRA);
  const indiceManilha = (indiceVira + 1) % ORDEM_VALORES.length;
  return ORDEM_VALORES[indiceManilha];
}

// Verificar se uma carta é manilha
export function isManilha(carta: Carta): boolean {
  return carta.valor === getValorManilha();
}

// Obter força real da carta (considerando se é manilha)
export function getForcaCarta(carta: Carta): number {
  if (isManilha(carta)) {
    return HIERARQUIA_NAIPES[carta.naipe];
  }
  return carta.forca;
}

// Definir nova carta vira
export function setCartaVira(valor: string): void {
  if (ORDEM_VALORES.includes(valor)) {
    CARTA_VIRA = valor;
  }
}

// Todas as cartas disponíveis no modelo
export const TODAS_CARTAS: Carta[] = [
  { valor: "A", naipe: "paus", forca: 8, nomeCompleto: "A paus" },
  { valor: "A", naipe: "ouro", forca: 8, nomeCompleto: "A ouro" },
  { valor: "A", naipe: "copas", forca: 8, nomeCompleto: "A copas" },
  { valor: "A", naipe: "espadas", forca: 8, nomeCompleto: "A espada" },
  { valor: "5", naipe: "paus", forca: 2, nomeCompleto: "5 paus" },
  { valor: "5", naipe: "ouro", forca: 2, nomeCompleto: "5 ouro" },
  { valor: "5", naipe: "copas", forca: 2, nomeCompleto: "5 copas" },
  { valor: "5", naipe: "espadas", forca: 2, nomeCompleto: "5 espadas" },
  { valor: "4", naipe: "paus", forca: 1, nomeCompleto: "4 paus" },
  { valor: "4", naipe: "ouro", forca: 1, nomeCompleto: "4 ouro" },
  { valor: "4", naipe: "copas", forca: 1, nomeCompleto: "4 copas" },
  { valor: "4", naipe: "espadas", forca: 1, nomeCompleto: "4 espadas" },
  { valor: "J", naipe: "paus", forca: 6, nomeCompleto: "J paus" },
  { valor: "J", naipe: "ouro", forca: 6, nomeCompleto: "J ouro" },
  { valor: "J", naipe: "copas", forca: 6, nomeCompleto: "J copas" },
  { valor: "J", naipe: "espadas", forca: 6, nomeCompleto: "J espada" },
  { valor: "K", naipe: "paus", forca: 7, nomeCompleto: "K paus" },
  { valor: "K", naipe: "ouro", forca: 7, nomeCompleto: "K ouro" },
  { valor: "K", naipe: "copas", forca: 7, nomeCompleto: "K copas" },
  { valor: "K", naipe: "espadas", forca: 7, nomeCompleto: "K espada" },
  { valor: "Q", naipe: "paus", forca: 5, nomeCompleto: "Q Paus" },
  { valor: "Q", naipe: "ouro", forca: 5, nomeCompleto: "Q ouro" },
  { valor: "Q", naipe: "copas", forca: 5, nomeCompleto: "Q Copas" },
  { valor: "Q", naipe: "espadas", forca: 5, nomeCompleto: "Q espada" },
  { valor: "7", naipe: "paus", forca: 4, nomeCompleto: "7 paus" },
  { valor: "7", naipe: "ouro", forca: 4, nomeCompleto: "7 Ouro" },
  { valor: "7", naipe: "copas", forca: 4, nomeCompleto: "7 Copas" },
  { valor: "7", naipe: "espadas", forca: 4, nomeCompleto: "7 espadas" },
  { valor: "6", naipe: "paus", forca: 3, nomeCompleto: "6 paus" },
  { valor: "6", naipe: "ouro", forca: 3, nomeCompleto: "6 ouro" },
  { valor: "6", naipe: "copas", forca: 3, nomeCompleto: "6 copas" },
  { valor: "6", naipe: "espadas", forca: 3, nomeCompleto: "6 espada" },
  { valor: "3", naipe: "paus", forca: 10, nomeCompleto: "3 paus" },
  { valor: "3", naipe: "ouro", forca: 10, nomeCompleto: "3 ouro" },
  { valor: "3", naipe: "copas", forca: 10, nomeCompleto: "3 copas" },
  { valor: "3", naipe: "espadas", forca: 10, nomeCompleto: "3 espada" },
  { valor: "2", naipe: "paus", forca: 9, nomeCompleto: "2 paus" },
  { valor: "2", naipe: "ouro", forca: 9, nomeCompleto: "2 ouro" },
  { valor: "2", naipe: "copas", forca: 9, nomeCompleto: "2 copas" },
  { valor: "2", naipe: "espadas", forca: 9, nomeCompleto: "2 espada" },
];

// Encontrar carta por nome do modelo
export function encontrarCartaPorNome(nomeModelo: string): Carta | null {
  // Normalizar o nome para comparação (case insensitive)
  const nomeNormalizado = nomeModelo.toLowerCase().trim();
  
  const carta = TODAS_CARTAS.find(c => 
    c.nomeCompleto.toLowerCase() === nomeNormalizado
  );
  
  return carta || null;
}

// Comparar duas cartas e retornar resultado
export function compararCartas(carta1: Carta, carta2: Carta): {
  vencedor: "carta1" | "carta2" | "empate";
  diferenca: number;
} {
  const forca1 = getForcaCarta(carta1);
  const forca2 = getForcaCarta(carta2);
  
  if (forca1 > forca2) {
    return { vencedor: "carta1", diferenca: forca1 - forca2 };
  }
  if (forca1 < forca2) {
    return { vencedor: "carta2", diferenca: forca2 - forca1 };
  }
  // Empate só ocorre para cartas não-manilhas do mesmo valor
  return { vencedor: "empate", diferenca: 0 };
}

// Obter todas as cartas que a carta dada ganha
export function obterCartasQueGanha(carta: Carta): Carta[] {
  const forcaCarta = getForcaCarta(carta);
  return TODAS_CARTAS.filter(c => getForcaCarta(c) < forcaCarta);
}

// Obter todas as cartas que a carta dada perde
export function obterCartasQuePerde(carta: Carta): Carta[] {
  const forcaCarta = getForcaCarta(carta);
  return TODAS_CARTAS.filter(c => getForcaCarta(c) > forcaCarta);
}

// Obter todas as cartas que empata
export function obterCartasQueEmpata(carta: Carta): Carta[] {
  const forcaCarta = getForcaCarta(carta);
  return TODAS_CARTAS.filter(c => 
    getForcaCarta(c) === forcaCarta && 
    c.nomeCompleto !== carta.nomeCompleto
  );
}

// Obter símbolo do naipe
export function getSimboloNaipe(naipe: Naipe): string {
  const simbolos: { [key in Naipe]: string } = {
    ouro: "♦",
    espadas: "♠",
    copas: "♥",
    paus: "♣",
  };
  return simbolos[naipe];
}

// Obter cor do naipe
export function getCorNaipe(naipe: Naipe): string {
  return naipe === "ouro" || naipe === "copas" ? "#dc2626" : "#000000";
}

// Escolher carta aleatória
export function escolherCartaAleatoria(): Carta {
  const indiceAleatorio = Math.floor(Math.random() * TODAS_CARTAS.length);
  return TODAS_CARTAS[indiceAleatorio];
}
