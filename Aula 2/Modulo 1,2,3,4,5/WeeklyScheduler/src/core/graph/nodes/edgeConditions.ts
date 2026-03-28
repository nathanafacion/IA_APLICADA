import type { SchedulerState } from "../state";

export function routeAfterGuardrails(
  state: SchedulerState
): "chat" | "blocked" {
  if (!state.guardrailsEnabled) return "chat";
  const check = state.guardrailCheck;
  if (!check || check.safe) return "chat";
  return "blocked";
}
