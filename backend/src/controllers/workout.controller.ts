import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { WorkoutService } from '../services/workout.service';
import { AdaptiveWorkoutService } from '../services/adaptive-workout.service';

export class WorkoutController {
  static async getPlans(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const plans = await WorkoutService.getPlans(req.user!.userId);
      return res.status(200).json({ success: true, data: plans });
    } catch (error) {
      next(error);
    }
  }

  static async getPlanById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const plan = await WorkoutService.getPlanById(req.user!.userId, req.params.id);
      return res.status(200).json({ success: true, data: plan });
    } catch (error) {
      next(error);
    }
  }

  static async createPlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const plan = await WorkoutService.createPlan(req.user!.userId, req.body);
      return res.status(201).json({ success: true, data: plan, message: 'Workout plan created' });
    } catch (error) {
      next(error);
    }
  }

  static async aiGeneratePlan(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const plan = await WorkoutService.aiGeneratePlan(req.user!.userId, req.body);
      return res.status(201).json({ success: true, data: plan, message: 'AI Workout plan generated successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async getAdaptiveRecommendation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const recommendation = await AdaptiveWorkoutService.getLatestAdaptiveRecommendation(req.user!.userId);
      return res.status(200).json({ success: true, data: recommendation });
    } catch (error) {
      next(error);
    }
  }

  static async generateAdaptiveRecommendation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const recommendation = await AdaptiveWorkoutService.generate6DayAdaptivePlan(req.user!.userId);
      return res.status(201).json({
        success: true,
        data: recommendation,
        message: 'Fresh next 6-day adaptive workout plan generated based on your recent training history.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async startSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const session = await WorkoutService.startSession(req.user!.userId, req.body);
      return res.status(201).json({ success: true, data: session, message: 'Workout session started' });
    } catch (error) {
      next(error);
    }
  }

  static async getActiveSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const activeSession = await WorkoutService.getActiveSession(req.user!.userId);
      return res.status(200).json({ success: true, data: activeSession });
    } catch (error) {
      next(error);
    }
  }

  static async updateSet(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updatedSet = await WorkoutService.updateSet(req.params.setId, req.body);
      return res.status(200).json({ success: true, data: updatedSet });
    } catch (error) {
      next(error);
    }
  }

  static async completeSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { durationSeconds, notes } = req.body;
      const completed = await WorkoutService.completeSession(req.params.id, req.user!.userId, durationSeconds || 0, notes);
      return res.status(200).json({ success: true, data: completed, message: 'Workout completed!' });
    } catch (error) {
      next(error);
    }
  }

  static async getSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sessions = await WorkoutService.getSessions(req.user!.userId);
      return res.status(200).json({ success: true, data: sessions });
    } catch (error) {
      next(error);
    }
  }

  static async getPreviousExerciseHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sets = await WorkoutService.getPreviousExerciseHistory(req.user!.userId, req.params.exerciseId);
      return res.status(200).json({ success: true, data: sets });
    } catch (error) {
      next(error);
    }
  }

  static async getSessionById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const session = await WorkoutService.getSessionById(req.user!.userId, req.params.id);
      return res.status(200).json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  }
}
