
import { genkit } from "genkit";
import { ollama } from "genkitx-ollama";

export const ai = genkit({
  plugins: [
    ollama({
      serverAddress: "http://127.0.0.1:11434"
    })
  ],
  model: "ollama/phi3:latest"
});
