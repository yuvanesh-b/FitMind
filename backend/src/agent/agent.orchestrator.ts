import { IntentClassifier } from './intent.classifier';
import { SYSTEM_PROMPT } from './agent.prompts';
import { GroqProvider } from './groq.provider';
import { ResponseParser } from './response.parser';
import { AgentResponse, AgentIntent } from './agent.types';
import { prisma } from '../config/db';
import { AgentTools } from '../tools/agent.tools';

export class AgentOrchestrator {
  static async processUserRequest(userId: string, userMessage: string, conversationId?: string): Promise<AgentResponse> {
    // 1. Identify Intent
    const intent: AgentIntent = IntentClassifier.classify(userMessage);

    console.log('[AgentOrchestrator] USER ID:', userId);
    console.log('[AgentOrchestrator] INTENT:', intent);
    console.log('[AgentOrchestrator] USER MESSAGE:', userMessage);

    // 2. Find or Create Conversation in MySQL
    let activeConversation;
    if (conversationId) {
      activeConversation = await prisma.aiConversation.findFirst({
        where: { id: conversationId, userId },
      });
    }

    if (!activeConversation) {
      activeConversation = await prisma.aiConversation.create({
        data: {
          userId,
          title: `Coaching: ${userMessage.slice(0, 30)}...`,
        },
      });
    }

    // 3. Load past conversation messages for multi-turn memory
    const pastMessages = await prisma.aiMessage.findMany({
      where: { conversationId: activeConversation.id },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    const historyMessages = pastMessages.map((m) => ({
      role: m.role.toLowerCase() === 'user' ? ('user' as const) : ('assistant' as const),
      content: m.content,
    }));

    // 4. Run Groq Agentic Loop with Targeted Tool Execution
    const { replyText, toolsExecuted } = await GroqProvider.runAgenticLoop(
      SYSTEM_PROMPT,
      historyMessages,
      userMessage,
      userId,
      intent
    );

    console.log('[AgentOrchestrator] TOOLS EXECUTED:', toolsExecuted);
    console.log('[AgentOrchestrator] REPLY LENGTH:', replyText.length);

    // 5. Parse structured output if JSON block exists
    const { structuredData } = ResponseParser.parse(replyText);
    const cleanReplyText = GroqProvider.sanitizeReplyText(replyText);

    // 6. Save User and Assistant Messages in MySQL
    await prisma.aiMessage.create({
      data: {
        conversationId: activeConversation.id,
        role: 'USER',
        content: userMessage,
      },
    });

    await prisma.aiMessage.create({
      data: {
        conversationId: activeConversation.id,
        role: 'ASSISTANT',
        content: cleanReplyText,
        structuredData: structuredData ? JSON.stringify(structuredData) : null,
      },
    });

    // Touch conversation updatedAt
    await prisma.aiConversation.update({
      where: { id: activeConversation.id },
      data: { updatedAt: new Date() },
    });

    return {
      intent,
      replyText: cleanReplyText,
      structuredData: structuredData || undefined,
      toolsExecuted,
      conversationId: activeConversation.id,
    };
  }

  static async generateSmartCoachInsight(userId: string) {
    const summary = await AgentTools.getWeeklyFitnessSummary(userId);

    const prompt = `
Generate a concise, high-impact 2-sentence Daily Coach Insight for the user dashboard based on real user data below:
${JSON.stringify(summary)}
`;

    const { replyText } = await GroqProvider.runAgenticLoop('You are a concise personal fitness coach.', [], prompt, userId, 'WEEKLY_REPORT');
    const cleanOutput = GroqProvider.sanitizeReplyText(replyText);

    return {
      title: 'Smart Coach Insight',
      summary: cleanOutput || "You've maintained solid consistency this week! Prioritize rest and hydration to optimize your recovery.",
      volumeTrend: summary.workoutSummary.completedWorkoutsCount > 2 ? 'UPWARD' : 'STABLE',
    };
  }

  static async generateWeeklyReport(userId: string) {
    const summary = await AgentTools.getWeeklyFitnessSummary(userId);
    const userProfile = await AgentTools.getUserProfile(userId);

    const prompt = `Generate a comprehensive weekly fitness report analysis covering workouts completed, volume trends, protein intake, recovery observations, and recommendations for next week based on this actual MySQL data: ${JSON.stringify({ userProfile, summary })}`;

    const { replyText, toolsExecuted } = await GroqProvider.runAgenticLoop(SYSTEM_PROMPT, [], prompt, userId, 'WEEKLY_REPORT');
    const cleanReport = GroqProvider.sanitizeReplyText(replyText);

    return {
      success: true,
      reportText: cleanReport,
      toolsUsed: toolsExecuted,
      data: summary,
    };
  }
}
