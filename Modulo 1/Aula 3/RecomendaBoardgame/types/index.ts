export interface Game {
  id: number;
  nome_do_jogo: string;
  description: string;
  designer: string;
  artist?: string;
  publisher?: string;
  min_players?: string;
  max_players?: string;
  min_playtime?: string;
  max_playtime?: string;
  playing_time?: string;
  min_age?: string;
  complexity_rating: string;
  user_ratings?: string;
  user_comments?: string;
  type?: string;
  category: string;
  mechanism: string;
  family?: string;
  year: string;
  average_rating: string;
  features: number[];
  raw_features?: number[];
}

export interface TrainingProgress {
  epoch: number;
  totalEpochs: number;
  loss: number;
  mae: number;
}

export interface WorkerMessage {
  type: 'STATUS' | 'EPOCH_END' | 'TRAINING_COMPLETE' | 'ERROR';
  message?: string;
  epoch?: number;
  totalEpochs?: number;
  loss?: number;
  mae?: number;
}

export interface SimilarityResult {
  id: number;
  similarity: number;
}

export interface RecommendedGame extends Game {
  similarity: number;
}
