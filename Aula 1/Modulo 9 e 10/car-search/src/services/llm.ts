import type { CarResult } from "@/features/cars/types";

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const CHAT_MODEL = "openai/gpt-4o-mini";

export async function generateRagResponse(
  query: string,
  cars: CarResult[]
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY não configurada");

  const context = cars
    .map(
      (c, i) =>
        `${i + 1}. ${c.marca} ${c.modelo} ${c.ano} — ${c.tipo} ${c.cor}, ` +
        `${c.combustivel}, câmbio ${c.cambio}, motor ${c.motor} (${c.potencia}cv), ` +
        `${c.quilometragem.toLocaleString("pt-BR")} km, ` +
        `R$ ${c.preco.toLocaleString("pt-BR")} | similaridade: ${Math.round(c.score * 100)}%`
    )
    .join("\n");

  const systemPrompt =
    "Você é um consultor especialista em veículos automotores brasileiro. " +
    "Analise os resultados de uma busca por similaridade semântica e, com base nos veículos recuperados, " +
    "responda à pergunta do usuário de forma natural, prestativa e concisa. " +
    "Destaque o melhor match, mencione características relevantes e aponte as melhores opções. " +
    "Responda sempre em português brasileiro. Não use markdown com asteriscos — use texto corrido. " +
    "Limite-se a 3-4 frases.";

  const userPrompt =
    `O usuário buscou: "${query}"\n\n` +
    `Veículos mais similares encontrados (busca vetorial no Neo4j):\n${context}\n\n` +
    `Responda à busca do usuário de forma natural e útil, como um consultor de vendas experiente.`;

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Car RAG Search",
    },
    body: JSON.stringify({
      model: CHAT_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 300,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Erro na geração RAG: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.choices[0].message.content as string;
}
