// Service para gerenciamento do modelo TensorFlow.js
// NOTA: O treinamento acontece no trainWorker.js para não travar a UI
// Este service é responsável apenas por CARREGAR e USAR o modelo já treinado
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';

export const MODEL_PATH = 'indexeddb://game-model';
export const FEATURE_SIZE = 11;

/**
 * Inicializa o TensorFlow.js com backend WebGL
 * Usado apenas para inferência (predições), NÃO para treinamento
 */
export async function initializeTensorFlow(): Promise<void> {
  await tf.ready();
  await tf.setBackend('webgl');
  console.log('TensorFlow.js backend:', tf.getBackend());
}

/**
 * Verifica se o modelo existe no IndexedDB
 */
export async function modelExists(): Promise<boolean> {
  try {
    const models = await tf.io.listModels();
    return MODEL_PATH in models;
  } catch (error) {
    console.error('Error checking model existence:', error);
    return false;
  }
}

/**
 * Carrega o modelo do IndexedDB
 */
export async function loadModel(): Promise<tf.Sequential | null> {
  try {
    const exists = await modelExists();
    if (!exists) {
      console.log('Model does not exist in IndexedDB');
      return null;
    }
    const model = await tf.loadLayersModel(MODEL_PATH) as tf.Sequential;
    console.log('Model loaded successfully');
    return model;
  } catch (error) {
    console.error('Error loading model:', error);
    return null;
  }
}

/**
 * Salva o modelo no IndexedDB
 */
export async function saveModel(model: tf.Sequential): Promise<void> {
  try {
    await model.save(MODEL_PATH);
    console.log('Model saved successfully to IndexedDB');
  } catch (error) {
    console.error('Error saving model:', error);
    throw error;
  }
}

/**
 * Obtém predições para um conjunto de features
 */
export async function getPredictions(
  model: tf.Sequential,
  features: number[][]
): Promise<number[][]> {
  const tensorInput = tf.tensor2d(features);
  const predictions = model.predict(tensorInput) as tf.Tensor;
  const result = await predictions.array() as number[][];
  
  // Clean up tensors
  tensorInput.dispose();
  predictions.dispose();
  
  return result;
}
