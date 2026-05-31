import { NextRequest, NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { buildSchedulerGraph } from "@/core/graph/graph";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { messages, guardrailsEnabled = true } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages array required" }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1];
    if (!lastUserMessage?.content || typeof lastUserMessage.content !== "string") {
      return NextResponse.json({ error: "Invalid message format" }, { status: 400 });
    }

    const graph = buildSchedulerGraph();

    // Convert history to LangChain messages
    const langchainMessages = messages.map((m: { role: string; content: string }) => {
      if (m.role === "user") return new HumanMessage(m.content);
      const { AIMessage } = require("@langchain/core/messages");
      return new AIMessage(m.content);
    });

    const result = await graph.invoke({
      messages: langchainMessages,
      guardrailsEnabled,
    });

    const lastMessage = result.messages[result.messages.length - 1];
    const content =
      typeof lastMessage.content === "string"
        ? lastMessage.content
        : JSON.stringify(lastMessage.content);

    return NextResponse.json({
      message: content,
      pendingEvento: result.pendingSlot ?? null,
      scheduleAction: result.scheduleAction ?? null,
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);

    const msg = error instanceof Error ? error.message : String(error);

    if (msg.includes("429") || msg.includes("quota") || msg.includes("Too Many Requests")) {
      return NextResponse.json(
        { message: "Limite de requisições da IA atingido. Aguarde alguns minutos e tente novamente." },
        { status: 200 }
      );
    }

    if (msg.includes("API_KEY_INVALID") || msg.includes("expired") || msg.includes("API key")) {
      return NextResponse.json(
        { message: "Chave de API inválida ou expirada. Verifique o arquivo .env.local." },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
