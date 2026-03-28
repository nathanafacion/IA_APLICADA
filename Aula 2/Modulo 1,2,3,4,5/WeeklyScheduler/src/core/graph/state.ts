import { MessagesAnnotation, Annotation } from "@langchain/langgraph";
import type { GuardrailResult, Evento } from "@/types";

export const SchedulerStateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  guardrailCheck: Annotation<GuardrailResult | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  guardrailsEnabled: Annotation<boolean>({
    reducer: (_, next) => next,
    default: () => true,
  }),
  pendingSlot: Annotation<Omit<Evento, "id"> | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  scheduleAction: Annotation<string | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
});

export type SchedulerState = typeof SchedulerStateAnnotation.State;
