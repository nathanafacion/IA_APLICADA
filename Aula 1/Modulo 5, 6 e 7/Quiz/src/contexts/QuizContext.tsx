import React, { createContext, useContext, useState } from "react";

interface QuizQuestion {
  question: string;
  choices: string[] | null;
  answer: string;
  explanation: string;
  difficulty: string;
  topic: string;
}

export interface UserAnswer {
  questionIndex: number;
  userAnswer: string;
  correct: boolean;
}

type QuizPhase = "config" | "loading" | "quiz" | "results";

interface QuizContextType {
  difficulty: string;
  setDifficulty: (d: string) => void;
  topic: string;
  setTopic: (t: string) => void;
  questions: QuizQuestion[];
  setQuestions: (q: QuizQuestion[]) => void;
  currentQuestionIndex: number;
  setCurrentQuestionIndex: React.Dispatch<React.SetStateAction<number>>;
  answers: UserAnswer[];
  setAnswers: React.Dispatch<React.SetStateAction<UserAnswer[]>>;
  selectedAnswer: string;
  setSelectedAnswer: (a: string) => void;
  phase: QuizPhase;
  setPhase: (p: QuizPhase) => void;
  loadingProgress: number;
  setLoadingProgress: React.Dispatch<React.SetStateAction<number>>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

export function QuizProvider({ children }: { children: React.ReactNode }) {
  const [difficulty, setDifficulty] = useState("easy");
  const [topic, setTopic] = useState("arithmetic");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [phase, setPhase] = useState<QuizPhase>("config");
  const [loadingProgress, setLoadingProgress] = useState(0);

  return (
    <QuizContext.Provider
      value={{
        difficulty,
        setDifficulty,
        topic,
        setTopic,
        questions,
        setQuestions,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        answers,
        setAnswers,
        selectedAnswer,
        setSelectedAnswer,
        phase,
        setPhase,
        loadingProgress,
        setLoadingProgress,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (!context) throw new Error("useQuiz must be used within a QuizProvider");
  return context;
}
