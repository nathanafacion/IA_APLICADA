import React from "react";
import { QuizDetailsProps } from "./QuizDetails.types";
// import MathRender from "../MathRender";

export default function QuizDetails({ questions, answers }: QuizDetailsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">📋 Resultados Detalhados</h3>
      <div className="space-y-4">
        {questions.map((q, index) => {
          const userAnswer = answers.find((a) => a.questionIndex === index);
          const isCorrect = userAnswer?.correct || false;
          return (
            <div
              key={index}
              className={`p-4 rounded-xl border-l-4 ${
                isCorrect ? "bg-green-50 border-green-500" : "bg-red-50 border-red-500"
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{isCorrect ? "✅" : "❌"}</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-800 mb-2">
                    <span className="text-gray-500">Q{index + 1}:</span> {q.question}
                  </div>
                  <div className="text-sm text-gray-700 mt-1">
                    <span className="font-semibold">Explicação:</span> {q.explanation}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-2">
                    <div>
                      <span className="text-gray-500">Sua resposta: </span>
                      <span className={`font-medium ${isCorrect ? "text-green-600" : "text-red-600"}`}>
                        {userAnswer?.userAnswer || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Resposta correta: </span>
                      <span className="font-medium text-green-600">{q.answer}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
