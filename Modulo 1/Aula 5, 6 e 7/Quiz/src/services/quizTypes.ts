export interface QuizQuestion {
  question: string;
  choices: string[] | null;
  answer: string;
  explanation: string;
  difficulty: string;
  topic: string;
}
