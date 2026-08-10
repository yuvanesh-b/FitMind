import { Router } from 'express';
import { WorkoutController } from '../controllers/workout.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

// Adaptive 6-Day Recommendation
router.get('/adaptive-recommendation', WorkoutController.getAdaptiveRecommendation);
router.post('/adaptive-recommendation', WorkoutController.generateAdaptiveRecommendation);

// Plans & AI Generation
router.get('/plans', WorkoutController.getPlans);
router.get('/plans/:id', WorkoutController.getPlanById);
router.post('/plans', WorkoutController.createPlan);
router.post('/ai-generate', WorkoutController.aiGeneratePlan);

// Sessions & Active Workout
router.get('/sessions/active', WorkoutController.getActiveSession);
router.get('/sessions', WorkoutController.getSessions);
router.get('/sessions/:id', WorkoutController.getSessionById);
router.post('/sessions', WorkoutController.startSession);
router.put('/sets/:setId', WorkoutController.updateSet);
router.put('/sessions/:id/complete', WorkoutController.completeSession);
router.get('/exercises/:exerciseId/history', WorkoutController.getPreviousExerciseHistory);
router.post('/sessions/:id/finish', WorkoutController.completeSession);

export default router;
