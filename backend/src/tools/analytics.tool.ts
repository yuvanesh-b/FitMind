import { prisma } from '../config/db';

export class AnalyticsTool {
  static async analyzeStrengthProgress(userId: string) {
    const sessions = await prisma.workoutSession.findMany({
      where: { userId, status: 'COMPLETED' },
      orderBy: { startedAt: 'desc' },
      take: 10,
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });

    if (sessions.length < 2) {
      return { status: 'INSUFFICIENT_DATA', message: 'At least 2 workouts required to analyze strength progression.' };
    }

    const first = sessions[sessions.length - 1];
    const latest = sessions[0];
    const volumeDiff = latest.totalVolumeKg - first.totalVolumeKg;
    const volumePercent = first.totalVolumeKg > 0 ? ((volumeDiff / first.totalVolumeKg) * 100).toFixed(1) : '0';

    return {
      status: 'SUCCESS',
      recentWorkoutsCount: sessions.length,
      volumeTrend: volumeDiff >= 0 ? 'INCREASING' : 'DECREASING',
      volumeChangePercent: `${volumePercent}%`,
      latestVolumeKg: latest.totalVolumeKg,
      previousVolumeKg: first.totalVolumeKg,
    };
  }
}
