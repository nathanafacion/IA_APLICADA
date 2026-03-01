import React from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import { QuizResultsProps } from "./QuizResults.types";
import "./chartjs-setup";

export default function QuizResults({ totalCorrect, totalWrong, answersLength, percentage, barData, doughnutData, restartQuiz }: QuizResultsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">
          {percentage >= 70 ? "🎉" : percentage >= 50 ? "👍" : "📚"}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Finalizado!</h2>
        <p className="text-gray-500">
          Você acertou {totalCorrect} de {answersLength} questões
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-indigo-600">{answersLength}</div>
          <div className="text-sm text-gray-500">Total</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{totalCorrect}</div>
          <div className="text-sm text-gray-500">Acertos</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-red-600">{totalWrong}</div>
          <div className="text-sm text-gray-500">Erros</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <Bar data={barData} />
        </div>
        <div>
          <Doughnut data={doughnutData} />
        </div>
      </div>
      <div className="text-center">
        <button
          onClick={restartQuiz}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition"
        >
          Refazer Quiz
        </button>
      </div>
    </div>
  );
}
