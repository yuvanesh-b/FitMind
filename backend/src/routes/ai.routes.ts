import { Router } from 'express';
import { AiController } from '../controllers/ai.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.post('/chat', AiController.chat);
router.get('/insight', AiController.getInsight);
router.get('/history', AiController.getConversations);
router.get('/conversations', AiController.getConversations);
router.get('/conversations/:id', AiController.getConversationById);
router.post('/weekly-report', AiController.getWeeklyReport);
router.get('/context', AiController.getContext);

export default router;
