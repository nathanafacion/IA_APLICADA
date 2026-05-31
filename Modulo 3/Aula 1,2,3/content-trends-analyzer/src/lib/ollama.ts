import { Ollama } from "ollama";

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";

export const ollamaClient = new Ollama({ host: OLLAMA_HOST });
export const ollamaModel = OLLAMA_MODEL;
