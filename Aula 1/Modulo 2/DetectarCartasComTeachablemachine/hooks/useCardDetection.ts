import { useState, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";
import { detectCard } from "@/services/cardDetectionService";
import { Carta } from "@/lib/trucoLogic";

interface UseCardDetectionResult {
  cartaDetectada: Carta | null;
  confianca: number;
  imagemUpload: string | null;
  processando: boolean;
  erro: string | null;
  detectarCartaDaImagem: (imagemUrl: string) => Promise<void>;
  resetarDeteccao: () => void;
}

/**
 * Hook para gerenciar a detecção de cartas
 */
export function useCardDetection(
  modelo: tf.LayersModel | null
): UseCardDetectionResult {
  const [cartaDetectada, setCartaDetectada] = useState<Carta | null>(null);
  const [confianca, setConfianca] = useState<number>(0);
  const [imagemUpload, setImagemUpload] = useState<string | null>(null);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const detectarCartaDaImagem = useCallback(
    async (imagemUrl: string) => {
      if (!modelo) {
        setErro("Modelo não está carregado!");
        return;
      }

      try {
        setProcessando(true);
        setErro(null);
        setImagemUpload(imagemUrl);

        const resultado = await detectCard(modelo, imagemUrl);

        setCartaDetectada(resultado.carta);
        setConfianca(resultado.confianca);
        setProcessando(false);
      } catch (error) {
        console.error("Erro ao detectar carta:", error);
        setErro("Erro ao processar imagem!");
        setProcessando(false);
      }
    },
    [modelo]
  );

  const resetarDeteccao = useCallback(() => {
    setCartaDetectada(null);
    setConfianca(0);
    setImagemUpload(null);
    setErro(null);
  }, []);

  return {
    cartaDetectada,
    confianca,
    imagemUpload,
    processando,
    erro,
    detectarCartaDaImagem,
    resetarDeteccao,
  };
}
