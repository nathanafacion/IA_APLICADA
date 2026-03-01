
import { QuizProvider, useQuiz } from "../contexts/QuizContext";
import { useQuizActions } from "../hooks/useQuizActions";
import QuizConfig from "../components/QuizConfig/QuizConfig";
import QuizLoading from "../components/QuizLoading/QuizLoading";
import QuizQuestion from "../components/QuizQuestion/QuizQuestion";
import QuizResults from "../components/QuizResults/QuizResults";
import QuizDetails from "../components/QuizDetails/QuizDetails";
import { getQuizStats } from "../utils/quizHelpers";


function HomeContent() {
  const {
    difficulty, setDifficulty, topic, setTopic, questions, currentQuestionIndex,
    answers, selectedAnswer, setSelectedAnswer, phase, loadingProgress
  } = useQuiz();
  const { startQuiz, submitAnswer, restartQuiz } = useQuizActions();

  const {
    totalCorrect,
    totalWrong,
    percentage,
    barData,
    doughnutData,
    currentQuestion,
  } = getQuizStats(answers, questions, currentQuestionIndex);

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🧮 Quiz de Matemática
          </h1>
          <p className="text-gray-500">Responda 5 questões geradas por IA</p>
        </div>
        {phase === "config" && (
          <QuizConfig
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            topic={topic}
            setTopic={setTopic}
            startQuiz={startQuiz}
          />
        )}
        {phase === "loading" && <QuizLoading loadingProgress={loadingProgress} />}
        {phase === "quiz" && currentQuestion && (
          <QuizQuestion
            currentQuestion={currentQuestion}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
            submitAnswer={() => submitAnswer(selectedAnswer)}
            currentQuestionIndex={currentQuestionIndex}
            questionsLength={questions.length}
          />
        )}
        {phase === "results" && (
          <>
            <QuizResults
              totalCorrect={totalCorrect}
              totalWrong={totalWrong}
              answersLength={answers.length}
              percentage={percentage}
              barData={barData}
              doughnutData={doughnutData}
              restartQuiz={restartQuiz}
            />
            <QuizDetails questions={questions} answers={answers} />
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <QuizProvider>
      <HomeContent />
    </QuizProvider>
  );
}
