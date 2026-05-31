import { AIMessage } from "@langchain/core/messages";
import type { RssState } from "../state";

export async function blockedNode(
  state: RssState
): Promise<Partial<RssState>> {
  const reason = state.guardrailCheck?.reason ?? "conteúdo não permitido";
  return {
    messages: [
      new AIMessage(
        `Não posso processar essa solicitação. Motivo: ${reason}. Por favor, use o assistente apenas para gerenciar feeds RSS e notícias.`
      ),
    ],
    rssCommand: null,
  };
}
