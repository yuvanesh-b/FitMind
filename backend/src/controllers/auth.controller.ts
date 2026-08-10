import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/errors';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, confirmPassword } = req.body;

      if (!name || !email || !password) {
        throw new AppError('Name, email, and password are required fields.', 400);
      }
      if (password !== confirmPassword) {
        throw new AppError('Passwords do not match.', 400);
      }
      if (password.length < 6) {
        throw new AppError('Password must be at least 6 characters.', 400);
      }

      const result = await AuthService.register({ name, email, password });
      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new AppError('Email and password are required fields.', 400);
      }

      const result = await AuthService.login({ email, password });
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshSession(refreshToken);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const user = await AuthService.getCurrentUser(userId);
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      await AuthService.logout(userId);
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
