'use client';

import { useEffect, useState } from 'react';
import { modelExists } from '@/services/modelService';

interface TrainingStatus {
  status: string;
  epoch: number;
  totalEpochs: number;
  loss: number;
  mae: number;
  isTraining: boolean;
  isComplete: boolean;
  error: string | null;
}

export default function TreinarPage() {
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>({
    status: 'Verificando modelo existente...',
    epoch: 0,
    totalEpochs: 50,
    loss: 0,
    mae: 0,
    isTraining: false,
    isComplete: false,
    error: null,
  });

  const [worker, setWorker] = useState<Worker | null>(null);
  const [modelAlreadyExists, setModelAlreadyExists] = useState(false);

  useEffect(() => {
    checkAndStartTraining();
    
    return () => {
      if (worker) {
        worker.terminate();
      }
    };
  }, []);

  async function checkAndStartTraining() {
    try {
      // Check if model already exists
      const exists = await modelExists();
      
      if (exists) {
        setModelAlreadyExists(true);
        setTrainingStatus(prev => ({
          ...prev,
          status: 'Modelo já existe no IndexedDB',
          isComplete: true,
        }));
        return;
      }
      
      // Model doesn't exist, start training
      await startTraining();
      
    } catch (error) {
      setTrainingStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        status: 'Erro ao verificar modelo',
      }));
    }
  }

  async function startTraining() {
    try {
      setTrainingStatus(prev => ({
        ...prev,
        status: 'Carregando dados...',
        isTraining: true,
      }));

      // Load game data
      const response = await fetch('/data/raw_data.json');
      if (!response.ok) {
        throw new Error('Erro ao carregar dados dos jogos');
      }
      const games = await response.json();
      
      console.log(`Dados carregados: ${games.length} jogos`);

      // Create Web Worker
      const newWorker = new Worker('/trainWorker.js');
      setWorker(newWorker);
      
      console.log('Web Worker criado');

      // Handle messages from worker
      newWorker.onmessage = (e) => {
        const { type, message, epoch, totalEpochs, loss, mae } = e.data;
        
        console.log('Mensagem do Worker:', type, message);

        switch (type) {
          case 'STATUS':
            setTrainingStatus(prev => ({
              ...prev,
              status: message,
            }));
            break;

          case 'EPOCH_END':
            setTrainingStatus(prev => ({
              ...prev,
              epoch,
              totalEpochs,
              loss,
              mae,
              status: `Treinando... Época ${epoch}/${totalEpochs}`,
            }));
            break;

          case 'TRAINING_COMPLETE':
            setTrainingStatus(prev => ({
              ...prev,
              status: message,
              isTraining: false,
              isComplete: true,
            }));
            newWorker.terminate();
            break;

          case 'ERROR':
            setTrainingStatus(prev => ({
              ...prev,
              error: message,
              status: 'Erro durante o treinamento',
              isTraining: false,
            }));
            newWorker.terminate();
            break;
        }
      };
      
      // Handle worker errors
      newWorker.onerror = (error) => {
        console.error('Erro no Worker:', error);
        setTrainingStatus(prev => ({
          ...prev,
          error: `Erro no Worker: ${error.message}`,
          status: 'Erro no Web Worker',
          isTraining: false,
        }));
      };

      // Start training
      console.log('Enviando dados para o Worker...');
      newWorker.postMessage({
        type: 'START_TRAINING',
        data: {
          games,
          epochs: 50,
        },
      });

    } catch (error) {
      setTrainingStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        status: 'Erro ao iniciar treinamento',
        isTraining: false,
      }));
    }
  }

  const progress = trainingStatus.totalEpochs > 0 
    ? (trainingStatus.epoch / trainingStatus.totalEpochs) * 100 
    : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Treinamento do Modelo
      </h1>

      <div className="bg-white rounded-lg shadow-xl p-8">
        {/* Status Message */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Status:</h2>
          <p className="text-lg text-gray-700">{trainingStatus.status}</p>
        </div>

        {/* Error Message */}
        {trainingStatus.error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            <strong>⚠️ Erro:</strong> {trainingStatus.error}
            <p className="text-sm mt-2">
              Verifique o console do navegador (F12) para mais detalhes
            </p>
          </div>
        )}

        {/* Model Already Exists */}
        {modelAlreadyExists && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <p className="font-semibold">✅ Modelo já treinado!</p>
            <p className="mt-2">
              O modelo já existe no IndexedDB. Você pode ir para a página de recomendações.
            </p>
            <button
              onClick={() => {
                setModelAlreadyExists(false);
                startTraining();
              }}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition"
            >
              Treinar Novamente
            </button>
          </div>
        )}

        {/* Progress Bar */}
        {trainingStatus.isTraining && (
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="font-semibold">Progresso:</span>
              <span className="font-semibold">
                {trainingStatus.epoch} / {trainingStatus.totalEpochs} épocas
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className="bg-primary-600 h-full transition-all duration-300 flex items-center justify-center text-white text-sm font-semibold"
                style={{ width: `${progress}%` }}
              >
                {progress.toFixed(1)}%
              </div>
            </div>
          </div>
        )}

        {/* Training Metrics */}
        {trainingStatus.isTraining && trainingStatus.epoch > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Loss (Perda)</p>
              <p className="text-2xl font-bold text-blue-600">
                {trainingStatus.loss.toFixed(6)}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">MAE</p>
              <p className="text-2xl font-bold text-purple-600">
                {trainingStatus.mae.toFixed(6)}
              </p>
            </div>
          </div>
        )}

        {/* Complete Message */}
        {trainingStatus.isComplete && !modelAlreadyExists && (
          <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <p className="font-semibold">✅ Treinamento concluído!</p>
            <p className="mt-2">
              O modelo foi salvo com sucesso. Agora você pode usar a página de recomendações.
            </p>
          </div>
        )}

        {/* Loading Animation */}
        {trainingStatus.isTraining && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-3 h-3 bg-primary-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}
      </div>

      {/* Information Box */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">ℹ️ Sobre o Treinamento</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>O treinamento usa um autoencoder neural para aprender representações dos jogos</li>
          <li>O modelo é treinado com 50 épocas por padrão</li>
          <li>Todo o processo ocorre em um Web Worker para não travar a interface</li>
          <li>O modelo é salvo automaticamente no IndexedDB após o treinamento</li>
          <li>Backend utilizado: WebGL para aceleração por hardware</li>
        </ul>
      </div>
    </div>
  );
}
