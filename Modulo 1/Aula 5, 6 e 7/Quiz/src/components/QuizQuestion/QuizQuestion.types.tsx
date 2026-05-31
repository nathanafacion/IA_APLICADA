import { QuizQuestion } from '../../services/quizTypes';
export interface QuizQuestionProps {
  currentQuestion: QuizQuestion;
  selectedAnswer: string;
  setSelectedAnswer: (a: string) => void;
  submitAnswer: () => void;
  currentQuestionIndex: number;
  questionsLength: number;
}
