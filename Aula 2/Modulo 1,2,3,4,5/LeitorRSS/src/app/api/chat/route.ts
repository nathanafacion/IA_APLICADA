import { NextRequest, NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { buildRssGraph } from "@/core/graph/graph";
import {
  getChatHistory,
  addChatMessage,
  getUserSummary,
  upsertUserSummary,
  getChatMessagesSinceId,
  getLatestChatMessageId,
} from "@/lib/db";
import { createOllamaModel } from "@/lib/ollama";
import { SystemMessage } from "@langchain/core/messages";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, guardrailsEnabled = true } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array required" }, { status: 400 });
    }

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg?.content || typeof lastMsg.content !== "string") {
      return NextResponse.json({ error: "Formato de mensagem inválido" }, { status: 400 });
    }

    // Busca histórico anterior para contexto de recomendações
    const history = getChatHistory(20);
    const historyContext = history
      .reverse()
      .map((h) => `[${h.role}]: ${h.content.slice(0, 200)}`)
      .join("\n");

    const graph = buildRssGraph();

    // Converte mensagens para LangChain format
    const langchainMessages = messages.map((m: { role: string; content: string }) => {
      if (m.role === "user") return new HumanMessage(m.content);
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { AIMessage } = require("@langchain/core/messages");
      return new AIMessage(m.content);
    });

    // Injeta contexto do histórico se existir
    if (historyContext) {
      langchainMessages.unshift(
        new HumanMessage(
          `[CONTEXTO DE CONVERSAS ANTERIORES - use para recomendações personalizadas]\n${historyContext}\n[FIM DO CONTEXTO]`
        )
      );
    }

    const result = await graph.invoke({
      messages: langchainMessages,
      guardrailsEnabled,
    });

    const lastMessage = result.messages[result.messages.length - 1];
    const content =
      typeof lastMessage.content === "string"
        ? lastMessage.content
        : JSON.stringify(lastMessage.content);

    // Salva no histórico
    addChatMessage("user", lastMsg.content);
    addChatMessage("assistant", content);

    // Gera summary automático a cada 10 mensagens novas
    generateSummaryIfNeeded().catch((err) =>
      console.error("Erro ao gerar summary:", err)
    );

    return NextResponse.json({
      message: content,
      rssCommand: result.rssCommand ?? null,
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const msg = error instanceof Error ? error.message : String(error);

    if (msg.includes("429") || msg.includes("Too Many Requests")) {
      return NextResponse.json(
        { message: "Limite de requisições atingido. Aguarde e tente novamente." },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

const SUMMARY_INTERVAL = 10; // gera summary a cada 10 mensagens novas

async function generateSummaryIfNeeded() {
  const currentSummary = getUserSummary();
  const lastProcessed = currentSummary?.lastMessageId ?? 0;
  const latestId = getLatestChatMessageId();

  // Só gera se tiver pelo menos SUMMARY_INTERVAL mensagens novas
  if (latestId - lastProcessed < SUMMARY_INTERVAL) return;

  const newMessages = getChatMessagesSinceId(lastProcessed);
  if (newMessages.length < SUMMARY_INTERVAL) return;

  const messagesText = newMessages
    .map((m) => `[${m.role}]: ${m.content.slice(0, 300)}`)
    .join("\n");

  const previousSummary = currentSummary?.summary || "(nenhum resumo anterior)";

  const model = createOllamaModel();
  const response = await model.invoke([
    new SystemMessage(
      `Você é um analisador de preferências de usuário. Sua tarefa é criar um RESUMO ATUALIZADO dos interesses, gostos e preferências do usuário com base nas conversas.

REGRAS:
- Mantenha o resumo conciso (máximo 500 caracteres)
- Inclua: temas de interesse, comidas favoritas, hobbies, assuntos preferidos, tipos de notícia que gosta
- Atualize o resumo anterior incorporando novas informações
- Se houver contradição, priorize a informação mais recente
- Formato: lista de tópicos separados por ponto e vírgula
- Responda APENAS com o resumo, sem explicações`
    ),
    new HumanMessage(
      `RESUMO ANTERIOR:\n${previousSummary}\n\nNOVAS MENSAGENS:\n${messagesText}\n\nGere o resumo atualizado:`
    ),
  ]);

  const summary =
    typeof response.content === "string"
      ? response.content.slice(0, 500)
      : "";

  if (summary.trim()) {
    upsertUserSummary(summary.trim(), latestId);
    console.log("[Summary] Resumo de interesses atualizado:", summary.trim());
  }
}
