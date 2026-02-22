import * as tf from "@tensorflow/tfjs";
import { Carta } from "@/lib/trucoLogic";

export type { Carta };

export interface CardDetectionResult {
  carta: Carta;
  confianca: number;
}

export interface CardComparisonResult {
  vencedor: "carta1" | "carta2" | "empate";
  mensagem: string;
}

export interface ModelState {
  modelo: tf.LayersModel | null;
  carregando: boolean;
  erro: string | null;
}

export interface DetectionState {
  cartaDetectada: Carta | null;
  confianca: number;
  processando: boolean;
  imagemUpload: string | null;
}
