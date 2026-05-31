
import { ai } from "../../lib/genkit";

export async function generateExplanationAI(prompt: string): Promise<string> {
  const response = await ai.generate({ prompt });
  return response.text || "";
}
