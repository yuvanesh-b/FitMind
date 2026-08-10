import { AgentOrchestrator } from '../agent/agent.orchestrator';
import { FitnessContextBuilder } from '../agent/context.builder';
import { prisma } from '../config/db';

export class AiService {
  static async chat(userId: string, message: string, conversationId?: string) {
    console.log('[AI SERVICE] Processing Chat for User ID:', userId);
    try {
      return await AgentOrchestrator.processUserRequest(userId, message, conversationId);
    } catch (error: any) {
      console.error('[AI SERVICE ERROR]:', error?.message || error);
      throw error;
    }
  }

  static async getSmartCoachInsight(userId: string) {
    console.log('[AI SERVICE] Fetching Insight for User ID:', userId);
    try {
      const response = await AgentOrchestrator.processUserRequest(
        userId,
        'Give me a concise 2-sentence motivational coaching insight based on my latest progress and remaining targets today.',
        undefined
      );
      return { insight: response.replyText, intent: response.intent };
    } catch (error: any) {
      console.error('[AI SERVICE INSIGHT ERROR]:', error?.message || error);
      throw error;
    }
  }

  static async generateWeeklyReport(userId: string) {
    console.log('[AI SERVICE] Generating Weekly Report for User ID:', userId);
    try {
      return await AgentOrchestrator.processUserRequest(
        userId,
        'Generate a complete weekly fitness and nutrition report with clear highlights and key action items for next week.',
        undefined
      );
    } catch (error: any) {
      console.error('[AI SERVICE WEEKLY REPORT ERROR]:', error?.message || error);
      throw error;
    }
  }

  static async getUserContext(userId: string) {
    console.log('[AI SERVICE] Fetching Context for User ID:', userId);
    try {
      return await FitnessContextBuilder.buildUserContext(userId);
    } catch (error: any) {
      console.error('[AI SERVICE CONTEXT ERROR]:', error?.message || error);
      throw error;
    }
  }

  static async getConversations(userId: string) {
    console.log('[AI SERVICE] Fetching Conversations for User ID:', userId);
    try {
      return await prisma.aiConversation.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        include: { messages: { orderBy: { createdAt: 'asc' }, take: 1 } },
      });
    } catch (error: any) {
      console.error('[AI SERVICE GET CONVERSATIONS ERROR]:', error?.message || error);
      throw error;
    }
  }

  static async getConversationById(userId: string, conversationId: string) {
    console.log('[AI SERVICE] Fetching Conversation ID:', conversationId, 'for User ID:', userId);
    try {
      return await prisma.aiConversation.findFirst({
        where: { id: conversationId, userId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    } catch (error: any) {
      console.error('[AI SERVICE GET CONVERSATION BY ID ERROR]:', error?.message || error);
      throw error;
    }
  }
}
