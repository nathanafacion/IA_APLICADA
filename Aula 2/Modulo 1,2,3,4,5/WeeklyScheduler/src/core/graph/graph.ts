import { StateGraph, START, END } from "@langchain/langgraph";
import { SchedulerStateAnnotation } from "./state";
import { guardrailsCheckNode } from "./nodes/guardrailsCheckNode";
import { chatNode } from "./nodes/chatNode";
import { blockedNode } from "./nodes/blockedNode";
import { routeAfterGuardrails } from "./nodes/edgeConditions";

export function buildSchedulerGraph() {
  const graph = new StateGraph(SchedulerStateAnnotation)
    .addNode("guardrails_check", guardrailsCheckNode)
    .addNode("chat", chatNode)
    .addNode("blocked", blockedNode)
    .addEdge(START, "guardrails_check")
    .addConditionalEdges("guardrails_check", routeAfterGuardrails, {
      chat: "chat",
      blocked: "blocked",
    })
    .addEdge("chat", END)
    .addEdge("blocked", END);

  return graph.compile();
}
