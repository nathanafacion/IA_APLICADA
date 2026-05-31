/**
 * /api/summarize
 * POST - usa o LLM para resumir um artigo
 * Body: { title: string, description: string, link: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createOllamaModel } from "@/lib/ollama";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { title, description, link } = await req.json();

    if (!title) {
      return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 });
    }

    const model = createOllamaModel(0.3);

    const systemMsg = new SystemMessage(
      `Você é um assistente que resume notícias de forma clara e concisa em português brasileiro.
Faça um resumo de 2-3 parágrafos curtos. Destaque os pontos principais.
Não use listas com asteriscos. Use parágrafos fluidos.`
    );

    const userMsg = new HumanMessage(
      `Resuma esta notícia:\n\nTítulo: ${title}\n\nDescrição: ${description || "Sem descrição disponível"}\n\nLink: ${link || "Sem link"}`
    );

    const response = await model.invoke([systemMsg, userMsg]);
    const summary =
      typeof response.content === "string" ? response.content : JSON.stringify(response.content);

    return NextResponse.json({ summary });
  } catch (error: unknown) {
    console.error("Summarize API error:", error);
    return NextResponse.json({ error: "Erro ao resumir artigo" }, { status: 500 });
  }
}
