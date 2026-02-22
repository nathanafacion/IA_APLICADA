import * as tf from "@tensorflow/tfjs";
import { encontrarCartaPorNome, Carta } from "@/lib/trucoLogic";
import { CardDetectionResult } from "@/types/card";

// Labels do modelo (mesma ordem do metadata.json)
const MODEL_LABELS = [
  "A paus", "A ouro", "A copas", "A espada",
  "5 paus", "5 ouro", "5 copas", "5 espadas",
  "4 paus", "4 ouro", "4 copas", "4 espadas",
  "J paus", "J ouro", "J copas", "J espada",
  "K paus", "K ouro", "K copas", "K espada",
  "Q Paus", "Q ouro", "Q Copas", "Q espada",
  "7 paus", "7 Ouro", "7 Copas", "7 espadas",
  "6 paus", "6 ouro", "6 copas", "6 espada",
  "3 paus", "3 ouro", "3 copas", "3 espada",
  "2 paus", "2 ouro", "2 copas", "2 espada"
];

const IMAGE_SIZE = 224;

/**
 * Carrega o modelo TensorFlow.js
 */
export async function loadCardModel(): Promise<tf.LayersModel> {
  const model = await tf.loadLayersModel("/modelo_treinado/model.json");
  return model;
}

/**
 * Pré-processa a imagem para o modelo
 */
function preprocessImage(img: HTMLImageElement): tf.Tensor4D {
  return tf.browser
    .fromPixels(img)
    .resizeNearestNeighbor([IMAGE_SIZE, IMAGE_SIZE])
    .toFloat()
    .div(255.0)
    .expandDims(0) as tf.Tensor4D;
}

/**
 * Converte o resultado da predição em carta e confiança
 */
function parsePrediction(resultados: Float32Array): CardDetectionResult | null {
  const indiceMaximo = resultados.indexOf(Math.max(...Array.from(resultados)));
  const confiancaMaxima = resultados[indiceMaximo];
  const cartaNome = MODEL_LABELS[indiceMaximo];
  const carta = encontrarCartaPorNome(cartaNome);

  if (!carta) {
    return null;
  }

  return {
    carta,
    confianca: confiancaMaxima * 100,
  };
}

/**
 * Detecta uma carta a partir de uma imagem
 */
export async function detectCard(
  modelo: tf.LayersModel,
  imagemUrl: string
): Promise<CardDetectionResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imagemUrl;

    img.onload = async () => {
      try {
        // Pré-processar imagem
        const tensor = preprocessImage(img);

        // Fazer predição
        const predicao = (await modelo.predict(tensor)) as tf.Tensor;
        const resultados = await predicao.data();

        // Limpar tensores
        tensor.dispose();
        predicao.dispose();

        // Converter resultados
        const resultado = parsePrediction(resultados as Float32Array);

        if (!resultado) {
          reject(new Error("Carta não reconhecida"));
          return;
        }

        resolve(resultado);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Erro ao carregar imagem"));
    };
  });
}
