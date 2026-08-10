import Groq from 'groq-sdk';
import { ENV } from '../config/env';
import { getToolsForIntent, executeAgentTool } from '../tools/agent.tools';
import { AgentResponse, AgentIntent } from './agent.types';
import { FitnessContextBuilder } from './context.builder';

export class GroqProvider {
  private static groqClient = new Groq({ apiKey: ENV.GROQ_API_KEY });

  static sanitizeReplyText(text: string): string {
    if (!text) return '';
    return text.replace(/```json\s*[\s\S]*?\s*```/gi, '').trim();
  }

  static async generateResponse(systemPrompt: string, userPrompt: string, context?: string): Promise<string> {
    const res = await this.runAgenticLoop(systemPrompt, [], userPrompt, 'system', 'WEEKLY_REPORT');
    return res.replyText;
  }

  static async runAgenticLoop(
    systemPrompt: string,
    historyMessages: Array<{ role: 'user' | 'assistant'; content: string }>,
    userMessage: string,
    userId: string,
    intent?: string
  ): Promise<AgentResponse> {
    const currentIntent: AgentIntent = (intent as AgentIntent) || 'GENERAL_FITNESS';

    if (!ENV.GROQ_API_KEY) {
      console.error('[GROQ ERROR] GROQ_API_KEY is missing in environment configuration.');
      return {
        replyText: 'Backend Configuration Error: GROQ_API_KEY is missing in backend .env file. Please set GROQ_API_KEY.',
        toolsExecuted: [],
        intent: currentIntent,
      };
    }

    const userContext = await FitnessContextBuilder.buildUserContext(userId, currentIntent);
    const enrichedSystemPrompt = `${systemPrompt}\n\n${userContext}`;

    const availableTools = getToolsForIntent(intent);
    const toolsExecuted: string[] = [];
    const model = ENV.GROQ_MODEL || 'llama-3.3-70b-versatile';

    console.log(`[GROQ] Initiating request to model: ${model} for User ID: ${userId} with Intent: ${intent || 'UNKNOWN'}`);

    const messages: Array<any> = [
      { role: 'system', content: enrichedSystemPrompt },
      ...historyMessages.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ];

    try {
      console.log(`[GROQ] Dispatching prompt to Groq API...`);
      let completion = await this.groqClient.chat.completions.create({
        model,
        messages,
        tools: availableTools.length > 0 ? (availableTools as any) : undefined,
        tool_choice: availableTools.length > 0 ? 'auto' : undefined,
        temperature: 0.4,
        max_tokens: 1024,
      });

      let responseMessage = completion.choices[0]?.message;

      let iterations = 0;
      while (responseMessage?.tool_calls && responseMessage.tool_calls.length > 0 && iterations < 3) {
        iterations++;
        messages.push(responseMessage);

        for (const toolCall of responseMessage.tool_calls) {
          const functionName = toolCall.function.name;
          toolsExecuted.push(functionName);

          let args = {};
          try {
            args = JSON.parse(toolCall.function.arguments || '{}');
          } catch (e) {
            console.warn(`[GROQ] Failed to parse arguments for tool ${functionName}`);
          }

          console.log(`[GROQ TOOL CALL ${iterations}] Executing tool: ${functionName} for User ID: ${userId}`);
          const toolResult = await executeAgentTool(functionName, args, userId);

          messages.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            name: functionName,
            content: JSON.stringify(toolResult),
          });
        }

        completion = await this.groqClient.chat.completions.create({
          model,
          messages,
          temperature: 0.4,
          max_tokens: 1024,
        });

        responseMessage = completion.choices[0]?.message;
      }

      const finalReply = responseMessage?.content || "I am here to coach you. What specific question do you have about your workouts or nutrition?";
      console.log(`[GROQ SUCCESS] Completed request for User ID: ${userId}. Executed Tools: [${Array.from(new Set(toolsExecuted)).join(', ')}]`);

      return {
        replyText: finalReply,
        toolsExecuted: Array.from(new Set(toolsExecuted)),
        intent: currentIntent,
      };
    } catch (error: any) {
      const errorMsg = String(error?.message || error || '');
      const statusCode = error?.status || error?.statusCode || 500;

      console.error(`[GROQ FATAL API ERROR] Status Code: ${statusCode} | Message: ${errorMsg}`);

      if (statusCode === 429 || errorMsg.includes('429') || errorMsg.toLowerCase().includes('rate limit')) {
        console.warn(`[GROQ 429 RATE LIMIT EXCEEDED] User ID: ${userId}`);
        return {
          replyText: 'The AI coach is currently experiencing high demand. Please try asking your question again in a moment.',
          toolsExecuted: Array.from(new Set(toolsExecuted)),
          intent: currentIntent,
        };
      }

      return {
        replyText: `The AI coach is temporarily unavailable. Please try again in a moment.`,
        toolsExecuted: Array.from(new Set(toolsExecuted)),
        intent: currentIntent,
      };
    }
  }
}
