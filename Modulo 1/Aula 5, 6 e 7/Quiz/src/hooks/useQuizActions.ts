import axios from "axios";
import { useQuiz } from "../contexts/QuizContext";
import type { UserAnswer } from "../contexts/QuizContext";

export function useQuizActions() {
  const {
    difficulty,
    topic,
    setQuestions,
    setPhase,
    setAnswers,
    setCurrentQuestionIndex,
    setSelectedAnswer,
    setLoadingProgress,
    questions,
    currentQuestionIndex,
  } = useQuiz();

  async function startQuiz() {
    setPhase("loading");
    setLoadingProgress(0);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    let progressInterval: NodeJS.Timeout | null = null;
    try {
      progressInterval = setInterval(() => {
        setLoadingProgress((prev) => Math.min(prev + 5, 90));
      }, 500);
      const r = await axios.post("/api/quiz", {
        action: "generateBatch",
        difficulty,
        topic,
        count: 5,
      });
      if (progressInterval) clearInterval(progressInterval);
      setLoadingProgress(100);
      // Fallback: se não vier questões válidas, volta para config e mostra erro
      if (!r.data.questions || !Array.isArray(r.data.questions) || r.data.questions.length === 0) {
        alert("Erro ao gerar questões. Tente novamente ou ajuste o tópico/dificuldade.");
        setPhase("config");
        return;
      }
      setQuestions(r.data.questions);
      setTimeout(() => setPhase("quiz"), 300);
    } catch (err) {
      if (progressInterval) clearInterval(progressInterval);
      setLoadingProgress(0);
      alert("Erro ao gerar questões. Verifique sua conexão ou tente novamente.");
      setPhase("config");
    }
  }

  function submitAnswer(selectedAnswer: string) {
    if (!selectedAnswer) return;
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect =
      selectedAnswer.trim().toLowerCase() ===
      currentQuestion.answer.trim().toLowerCase();
    const newAnswer = {
      questionIndex: currentQuestionIndex,
      userAnswer: selectedAnswer,
      correct: isCorrect,
    };
    setAnswers((prev: UserAnswer[]) => [...prev, newAnswer]);
    setSelectedAnswer("");
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setPhase("results");
    }
  }

  function restartQuiz() {
    setPhase("config");
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
  }

  return { startQuiz, submitAnswer, restartQuiz };
}
