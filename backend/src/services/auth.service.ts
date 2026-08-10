import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { AppError } from '../utils/errors';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

export class AuthService {
  static async register(data: { name: string; email: string; password: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError('Email is already registered.', 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        profile: {
          create: {
            age: 25,
            heightCm: 175,
            weightKg: 70,
            fitnessLevel: 'INTERMEDIATE',
            workoutFrequencyDays: 4,
            availableEquipment: 'FULL_GYM',
          },
        },
        goals: {
          create: {
            category: 'MUSCLE_GAIN',
            title: 'Build Lean Muscle & Strength',
          },
        },
      },
      include: {
        profile: true,
        goals: true,
      },
    });

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        goals: user.goals,
      },
      accessToken,
      refreshToken,
    };
  }

  static async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        profile: true,
        goals: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid email or password credentials.', 401);
    }

    const validPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!validPassword) {
      throw new AppError('Invalid email or password credentials.', 401);
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        goals: user.goals,
      },
      accessToken,
      refreshToken,
    };
  }

  static async refreshSession(token: string) {
    if (!token) {
      throw new AppError('Refresh token required', 401);
    }

    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { profile: true, goals: true },
    });

    if (!user || !user.refreshTokenHash) {
      throw new AppError('Invalid refresh token.', 401);
    }

    const valid = await bcrypt.compare(token, user.refreshTokenHash);
    if (!valid) {
      throw new AppError('Invalid refresh token.', 401);
    }

    const newAccessToken = generateAccessToken({ userId: user.id, email: user.email });
    const newRefreshToken = generateRefreshToken({ userId: user.id, email: user.email });

    const newHash = await bcrypt.hash(newRefreshToken, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: newHash },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profile: user.profile,
        goals: user.goals,
      },
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true, goals: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      goals: user.goals,
    };
  }

  static async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash: null },
    });
  }
}
