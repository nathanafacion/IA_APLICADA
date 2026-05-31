import { ChatOllama } from "@langchain/ollama";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3.2";

export function createOllamaModel(temperature = 0.3): ChatOllama {
  return new ChatOllama({
    baseUrl: OLLAMA_BASE_URL,
    model: OLLAMA_MODEL,
    temperature,
    numCtx: 4096,
    keepAlive: "5m",
  });
}
