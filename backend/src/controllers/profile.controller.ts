import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { ProfileService } from '../services/profile.service';

export class ProfileController {
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await ProfileService.getProfile(req.user!.userId);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await ProfileService.updateProfile(req.user!.userId, req.body);
      return res.status(200).json({ success: true, data: updated, message: 'Profile updated successfully' });
    } catch (error) {
      next(error);
    }
  }
}
