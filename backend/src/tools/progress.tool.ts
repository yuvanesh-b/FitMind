import { prisma } from '../config/db';

export class ProgressTool {
  static async getBodyMeasurements(userId: string, limit = 10) {
    return prisma.bodyMeasurement.findMany({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
      take: limit,
    });
  }

  static async getProgressData(userId: string) {
    const measurements = await prisma.bodyMeasurement.findMany({
      where: { userId },
      orderBy: { recordedAt: 'asc' },
    });

    const recentSessions = await prisma.workoutSession.findMany({
      where: { userId, status: 'COMPLETED' },
      orderBy: { startedAt: 'asc' },
      take: 30,
    });

    const totalWorkouts = recentSessions.length;
    const totalVolume = recentSessions.reduce((acc, s) => acc + s.totalVolumeKg, 0);

    return {
      measurements,
      recentSessions,
      totalWorkouts,
      totalVolume,
    };
  }
}
