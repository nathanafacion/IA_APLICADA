// Types relacionados aos jogos de tabuleiro

export interface Game {
  id: number;
  nome_do_jogo: string;
  description: string;
  designer: string;
  artist?: string;
  publisher?: string;
  year: string;
  category: string;
  mechanism: string;
  family?: string;
  average_rating: string;
  complexity_rating: string;
  features: number[];
  raw_features?: number[];
}

export interface GameWithSimilarity extends Game {
  similarity: number;
}

export interface TrainingProgress {
  epoch: number;
  totalEpochs: number;
  loss: number;
  mae: number;
}

export interface TrainingStatus {
  status: string;
  epoch: number;
  totalEpochs: number;
  loss: number;
  mae: number;
  isTraining: boolean;
  isComplete: boolean;
  error: string | null;
}

export interface WorkerMessage {
  type: 'STATUS' | 'EPOCH_END' | 'TRAINING_COMPLETE' | 'ERROR';
  message?: string;
  epoch?: number;
  totalEpochs?: number;
  loss?: number;
  mae?: number;
  error?: string;
}
