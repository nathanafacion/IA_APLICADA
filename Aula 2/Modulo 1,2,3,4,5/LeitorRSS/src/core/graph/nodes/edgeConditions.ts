import type { RssState } from "../state";

export function routeAfterGuardrails(state: RssState): "chat" | "blocked" {
  if (!state.guardrailsEnabled) return "chat";
  const check = state.guardrailCheck;
  if (!check || check.safe) return "chat";
  return "blocked";
}
