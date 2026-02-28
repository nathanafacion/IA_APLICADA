const { ai } = require("../lib/genkit");

async function testOllama() {
  const response = await ai.generate({
    prompt: "Diga olá, mundo! em português.",
  });
  console.log("Resposta do Ollama:", response.text);
}

testOllama();
