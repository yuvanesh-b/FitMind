import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error Middleware]:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.details || null,
    });
  }

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    errors: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
