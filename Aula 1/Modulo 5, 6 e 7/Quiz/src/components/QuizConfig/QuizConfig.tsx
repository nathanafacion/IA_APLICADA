import React from "react";
import { QuizConfigProps } from "./QuizConfig.types";
import { DIFFICULTY_OPTIONS, QUIZ_LENGTH } from "../../utils/quizConstants";

export default function QuizConfig({ difficulty, setDifficulty, topic, setTopic, startQuiz }: QuizConfigProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Configure seu Quiz</h2>
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Dificuldade</label>
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          >
            {DIFFICULTY_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Tópico</label>
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="ex: algebra, frações..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>
        <button
          onClick={startQuiz}
          className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition"
        >
          🚀 Iniciar Quiz ({QUIZ_LENGTH} perguntas)
        </button>
      </div>
    </div>
  );
}
