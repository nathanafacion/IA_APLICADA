export interface QuizAnswer {
  correct: boolean;
  userAnswer?: string;
  questionIndex?: number;
}

import { QuizQuestion } from '../services/quizTypes';

export function getQuizStats(
  answers: QuizAnswer[],
  questions: QuizQuestion[],
  currentQuestionIndex: number
) {
  const totalCorrect = answers.filter((a) => a.correct).length;
  const totalWrong = answers.length - totalCorrect;
  const percentage = answers.length > 0 ? (totalCorrect / answers.length) * 100 : 0;
  const barData = {
    labels: answers.map((_, i: number) => `Q${i + 1}`),
    datasets: [
      {
        label: "Resultado",
        data: answers.map((a) => (a.correct ? 1 : 0)),
        backgroundColor: answers.map((a) =>
          a.correct ? "rgba(34, 197, 94, 0.7)" : "rgba(239, 68, 68, 0.7)"
        ),
        borderRadius: 6,
      },
    ],
  };
  const doughnutData = {
    labels: ["Acertos", "Erros"],
    datasets: [
      {
        data: [totalCorrect, totalWrong],
        backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(239, 68, 68, 0.8)"],
        borderWidth: 0,
      },
    ],
  };
  const currentQuestion = questions[currentQuestionIndex];
  return {
    totalCorrect,
    totalWrong,
    percentage,
    barData,
    doughnutData,
    currentQuestion,
  };
}
