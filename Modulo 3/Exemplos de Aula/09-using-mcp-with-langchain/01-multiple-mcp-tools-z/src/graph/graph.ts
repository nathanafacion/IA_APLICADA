import { StateGraph, START, END } from '@langchain/langgraph';
import { agentNode } from './nodes/agentNode.ts';
import { OpenRouterService } from '../services/openRouterService.ts';
import { GraphAnnotation, type GraphState } from './state.ts';

export function buildGraphPipeline(openRouterService: OpenRouterService) {
  return new StateGraph(GraphAnnotation)
    .addNode('agent', agentNode(openRouterService))

    .addEdge(START, 'agent')
    .addConditionalEdges('agent', (state: GraphState) =>
      state.error ? 'agent' : END
    )
    .compile();
}
