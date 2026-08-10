import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ENV.JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as TokenPayload;
};
