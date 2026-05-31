import { create, all } from "mathjs";
const math = create(all);

export function evaluateMathAnswer(userAnswer: string, correctAnswer: string): boolean {
  try {
    const a = math.evaluate(String(userAnswer));
    const b = math.evaluate(String(correctAnswer));
    return math.equal(a, b) as boolean;
  } catch {
    const ua = String(userAnswer).trim().toLowerCase();
    const ca = String(correctAnswer).trim().toLowerCase();
    return ua === ca;
  }
}
