import React from "react";
import { QuizLoadingProps } from "./QuizLoading.types";

export default function QuizLoading({ loadingProgress }: QuizLoadingProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
      <div className="animate-spin text-5xl mb-4">🧠</div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Gerando 5 questões...</h2>
      <p className="text-gray-500 mb-4">A IA está preparando seu quiz</p>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-300"
          style={{ width: `${loadingProgress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-400 mt-2">{loadingProgress}%</p>
    </div>
  );
}
