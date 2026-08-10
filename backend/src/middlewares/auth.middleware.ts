import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/errors';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized access. Token required.', 401));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired token.', 401));
  }
};
