import type { NextApiRequest, NextApiResponse } from "next";
import {
  generateQuestion,
  generateQuestionsBatch,
  evaluateAnswer,
  generateExplanation
} from "../../src/services/quizService";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action, difficulty, topic, question, userAnswer, correctAnswer, count } = req.body || {};

  try {
    if (action === "generate") {
      const q = await generateQuestion(difficulty || "easy", topic || "math");
      return res.status(200).json({ question: q });
    }

    if (action === "generateBatch") {
      const questions = await generateQuestionsBatch(count || 5, difficulty || "easy", topic || "math");
      return res.status(200).json({ questions });
    }

    if (action === "evaluate") {
      const correct = evaluateAnswer(userAnswer, correctAnswer);
      const explanation = await generateExplanation(question, userAnswer, correctAnswer, correct);
      return res.status(200).json({ correct, explanation: explanation.trim(), correctAnswer });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
}
