// Geração de embeddings via OpenRouter (compatível com API OpenAI)
// Modelo: openai/text-embedding-3-small (1536 dimensões)

const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const EMBEDDING_MODEL = "openai/text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

export { EMBEDDING_DIMENSIONS };

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY não configurada");

  const response = await fetch(`${OPENROUTER_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Car Similarity Search",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: text,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Erro ao gerar embedding: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.data[0].embedding as number[];
}

export async function generateEmbeddingsBatch(
  texts: string[]
): Promise<number[][]> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY não configurada");

  const response = await fetch(`${OPENROUTER_BASE_URL}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      "X-Title": "Car Similarity Search",
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Erro ao gerar embeddings em batch: ${response.status} - ${err}`);
  }

  const data = await response.json();
  // Garante que a ordem corresponda ao input
  const sorted = data.data.sort(
    (a: { index: number }, b: { index: number }) => a.index - b.index
  );
  return sorted.map((item: { embedding: number[] }) => item.embedding);
}
