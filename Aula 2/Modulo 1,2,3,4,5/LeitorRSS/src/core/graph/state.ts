import { MessagesAnnotation, Annotation } from "@langchain/langgraph";
import type { GuardrailResult, RssCommand } from "@/types";

export const RssStateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  guardrailCheck: Annotation<GuardrailResult | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
  guardrailsEnabled: Annotation<boolean>({
    reducer: (_, next) => next,
    default: () => true,
  }),
  rssCommand: Annotation<RssCommand | null>({
    reducer: (_, next) => next,
    default: () => null,
  }),
});

export type RssState = typeof RssStateAnnotation.State;
