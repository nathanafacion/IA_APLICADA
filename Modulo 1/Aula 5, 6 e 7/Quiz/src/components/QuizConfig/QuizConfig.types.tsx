export interface QuizConfigProps {
  difficulty: string;
  setDifficulty: (d: string) => void;
  topic: string;
  setTopic: (t: string) => void;
  startQuiz: () => void;
}
