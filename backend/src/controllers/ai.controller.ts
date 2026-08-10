import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AiService } from '../services/ai.service';
import { AppError } from '../utils/errors';

export class AiController {
  static async chat(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { message, conversationId } = req.body;
      if (!message) {
        throw new AppError('Message is required', 400);
      }

      console.log('[AI CONTROLLER] Incoming Chat Request from User ID:', req.user?.userId);
      const result = await AiService.chat(req.user!.userId, message, conversationId);

      return res.status(200).json({
        success: true,
        message: result.replyText,
        replyText: result.replyText,
        conversationId: result.conversationId,
        intent: result.intent,
        toolsUsed: result.toolsExecuted,
        structuredData: result.structuredData,
        data: result,
      });
    } catch (error: any) {
      console.error('[AI CONTROLLER ERROR]:', error?.message || error);
      next(error);
    }
  }

  static async getInsight(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      console.log('[AI CONTROLLER] Fetching Insight for User ID:', req.user?.userId);
      const insight = await AiService.getSmartCoachInsight(req.user!.userId);
      return res.status(200).json({ success: true, data: insight });
    } catch (error: any) {
      console.error('[AI CONTROLLER INSIGHT ERROR]:', error?.message || error);
      next(error);
    }
  }

  static async getWeeklyReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      console.log('[AI CONTROLLER] Generating Weekly Report for User ID:', req.user?.userId);
      const report = await AiService.generateWeeklyReport(req.user!.userId);
      return res.status(200).json({ success: true, data: report });
    } catch (error: any) {
      console.error('[AI CONTROLLER WEEKLY REPORT ERROR]:', error?.message || error);
      next(error);
    }
  }

  static async getContext(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      console.log('[AI CONTROLLER] Fetching User Context for User ID:', req.user?.userId);
      const context = await AiService.getUserContext(req.user!.userId);
      return res.status(200).json({ success: true, data: context });
    } catch (error: any) {
      console.error('[AI CONTROLLER CONTEXT ERROR]:', error?.message || error);
      next(error);
    }
  }

  static async getConversations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      console.log('[AI CONTROLLER] Fetching Conversations for User ID:', req.user?.userId);
      const conversations = await AiService.getConversations(req.user!.userId);
      return res.status(200).json({ success: true, data: conversations });
    } catch (error: any) {
      console.error('[AI CONTROLLER CONVERSATIONS ERROR]:', error?.message || error);
      next(error);
    }
  }

  static async getConversationById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      console.log('[AI CONTROLLER] Fetching Conversation ID:', req.params.id, 'for User ID:', req.user?.userId);
      const conversation = await AiService.getConversationById(req.user!.userId, req.params.id);
      return res.status(200).json({ success: true, data: conversation });
    } catch (error: any) {
      console.error('[AI CONTROLLER CONVERSATION BY ID ERROR]:', error?.message || error);
      next(error);
    }
  }
}
