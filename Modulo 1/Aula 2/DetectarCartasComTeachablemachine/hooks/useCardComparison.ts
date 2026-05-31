import { useState, useCallback, useEffect } from "react";
import { Carta, escolherCartaAleatoria, compararCartas, setCartaVira } from "@/lib/trucoLogic";

interface UseCardComparisonResult {
  cartaReferencia: Carta | null;
  mensagem: string;
  gerarNovaCartaReferencia: () => void;
  compararComReferencia: (carta: Carta) => void;
  setMensagem: (msg: string) => void;
}

/**
 * Hook para gerenciar a comparação de cartas
 */
export function useCardComparison(): UseCardComparisonResult {
  const [cartaReferencia, setCartaReferencia] = useState<Carta | null>(null);
  const [mensagem, setMensagem] = useState<string>("");

  // Gerar carta tombada na mesa após montagem para evitar hydration error
  useEffect(() => {
    const carta = escolherCartaAleatoria();
    setCartaVira(carta.valor); // Define a vira para calcular manilhas corretamente
    setCartaReferencia(carta);
  }, []);

  const gerarNovaCartaReferencia = useCallback(() => {
    const novaCarta = escolherCartaAleatoria();
    setCartaVira(novaCarta.valor); // Define a vira para calcular manilhas corretamente
    setCartaReferencia(novaCarta);
    setMensagem("Nova carta tombada na mesa!");
  }, []);

  const compararComReferencia = useCallback(
    (carta: Carta) => {
      if (!cartaReferencia) return;

      const resultado = compararCartas(carta, cartaReferencia);

      if (resultado.vencedor === "carta1") {
        setMensagem(`Sua carta GANHA da ${cartaReferencia.nomeCompleto}!`);
      } else if (resultado.vencedor === "carta2") {
        setMensagem(`Sua carta PERDE para ${cartaReferencia.nomeCompleto}!`);
      } else {
        setMensagem(`Sua carta EMPATA com ${cartaReferencia.nomeCompleto}!`);
      }
    },
    [cartaReferencia]
  );

  return {
    cartaReferencia,
    mensagem,
    gerarNovaCartaReferencia,
    compararComReferencia,
    setMensagem,
  };
}
