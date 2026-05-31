import { AIMessage } from "@langchain/core/messages";
import type { SchedulerState } from "../state";

export async function blockedNode(
  state: SchedulerState
): Promise<Partial<SchedulerState>> {
  const reason = state.guardrailCheck?.reason;
  const message = reason
    ? `Não posso ajudar com isso: ${reason}`
    : "Só posso ajudar com o gerenciamento da sua agenda semanal.";

  return {
    messages: [new AIMessage(message)],
    pendingSlot: null,
    scheduleAction: null,
  };
}
