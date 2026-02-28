import { QuizQuestion } from '../../services/quizTypes';
import { UserAnswer } from '../../contexts/QuizContext';
export interface QuizDetailsProps {
  questions: QuizQuestion[];
  answers: UserAnswer[];
}
