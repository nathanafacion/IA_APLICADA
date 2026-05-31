export interface QuizResultsProps {
  totalCorrect: number;
  totalWrong: number;
  answersLength: number;
  percentage: number;
  barData: any;
  doughnutData: any;
  restartQuiz: () => void;
}
