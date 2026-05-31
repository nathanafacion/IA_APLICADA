import { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import { loadCardModel } from "@/services/cardDetectionService";

interface UseCardModelResult {
  modelo: tf.LayersModel | null;
  carregando: boolean;
  erro: string | null;
}

/**
 * Hook para gerenciar o carregamento do modelo TensorFlow
 */
export function useCardModel(): UseCardModelResult {
  const [modelo, setModelo] = useState<tf.LayersModel | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const carregarModelo = async () => {
      try {
        const model = await loadCardModel();
        setModelo(model);
        setCarregando(false);
      } catch (error) {
        console.error("Erro ao carregar modelo:", error);
        setErro("Erro ao carregar modelo. Verifique o console.");
        setCarregando(false);
      }
    };

    carregarModelo();
  }, []);

  return { modelo, carregando, erro };
}
