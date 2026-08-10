import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { ProgressService } from '../services/progress.service';

export class ProgressController {
  static async getProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await ProgressService.getProgressData(req.user!.userId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async logMeasurement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const record = await ProgressService.logMeasurement(req.user!.userId, req.body);
      return res.status(201).json({ success: true, data: record, message: 'Body measurement recorded' });
    } catch (error) {
      next(error);
    }
  }
}
