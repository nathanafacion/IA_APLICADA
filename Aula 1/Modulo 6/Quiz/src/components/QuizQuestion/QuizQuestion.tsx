import React from "react";
import { QuizQuestionProps } from "./QuizQuestion.types";
// import MathRender from "../MathRender";

export default function QuizQuestion({ currentQuestion, selectedAnswer, setSelectedAnswer, submitAnswer, currentQuestionIndex, questionsLength }: QuizQuestionProps) {
  // Fallback: se não houver alternativas válidas, mostrar mensagem amigável
  const hasValidChoices = Array.isArray(currentQuestion.choices) && currentQuestion.choices.length === 4;
  return (
    <>
      {/* Progress Bar */}
      <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Pergunta {currentQuestionIndex + 1} de {questionsLength}
          </span>
          <span className="text-sm font-medium text-indigo-600">
            {Math.round(((currentQuestionIndex) / questionsLength) * 100)}% concluído
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentQuestionIndex / questionsLength) * 100}%` }}
          ></div>
        </div>
      </div>
      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-l-4 border-indigo-500">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
            {currentQuestion.difficulty}
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
            {currentQuestion.topic}
          </span>
        </div>
        <div className="text-lg font-semibold text-gray-800 mb-4">
          {currentQuestion.question}
        </div>
        {hasValidChoices ? (
          <div className="space-y-2">
            {currentQuestion.choices.map((option: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setSelectedAnswer(option)}
                className={`w-full text-left px-4 py-2 rounded-xl border transition font-medium ${
                  selectedAnswer === option
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-gray-50 text-gray-800 border-gray-200 hover:bg-indigo-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        ) : (
          <div className="text-red-600 font-semibold text-center my-4">
            Erro ao gerar alternativas para esta questão. Pule ou reinicie o quiz.
          </div>
        )}
        <button
          onClick={submitAnswer}
          disabled={!selectedAnswer || !hasValidChoices}
          className="mt-6 w-full px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition disabled:opacity-50"
        >
          Responder
        </button>
      </div>
    </>
  );
}
