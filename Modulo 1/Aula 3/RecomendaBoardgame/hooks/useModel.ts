// Hook para gerenciar o modelo TensorFlow.js
import { useState, useEffect } from 'react';
import type * as tf from '@tensorflow/tfjs';
import { 
  initializeTensorFlow, 
  loadModel, 
  modelExists 
} from '@/services/modelService';

interface UseModelReturn {
  model: tf.Sequential | null;
  isLoading: boolean;
  error: string | null;
  modelLoaded: boolean;
}

/**
 * Hook para gerenciar o ciclo de vida do modelo TensorFlow
 */
export function useModel(): UseModelReturn {
  const [model, setModel] = useState<tf.Sequential | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    async function initialize() {
      try {
        // Initialize TensorFlow
        await initializeTensorFlow();
        
        // Try to load existing model
        const loadedModel = await loadModel();
        
        if (loadedModel) {
          setModel(loadedModel);
          setModelLoaded(true);
        } else {
          setError('Modelo não encontrado. Por favor, treine o modelo primeiro.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao inicializar modelo');
        console.error('Model initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initialize();
  }, []);

  return {
    model,
    isLoading,
    error,
    modelLoaded,
  };
}
