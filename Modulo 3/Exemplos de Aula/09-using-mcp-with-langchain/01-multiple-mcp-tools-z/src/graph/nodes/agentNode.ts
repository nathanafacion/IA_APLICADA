import { AIMessage } from '@langchain/core/messages';
import { getSystemPrompt } from '../../prompts/v1/agentNode.ts';
import { OpenRouterService } from '../../services/openRouterService.ts';
import type { GraphState } from '../state.ts';

export function agentNode(openRouterService: OpenRouterService) {
    return async (state: GraphState): Promise<Partial<GraphState>> => {
        console.log('🤖 Agent node processing...');
        try {
            const rawQuestion = state.messages.at(-1)!.text;

            const systemPrompt = getSystemPrompt();

            const result = await openRouterService.generateStructured(
                systemPrompt,
                rawQuestion,
            );

            const answer = result.data as string;

            return {
                answer,
                error: undefined,
                messages: [new AIMessage(answer)],
            };

        } catch (error) {
            console.error('Agent node error:', error);
            return {
                messages: [new AIMessage('Sorry, I encountered an error while processing your request. Please try again.')],
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    };
}
