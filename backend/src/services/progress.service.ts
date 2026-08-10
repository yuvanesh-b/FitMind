import { prisma } from '../config/db';
import { ProgressTool } from '../tools/progress.tool';
import { AnalyticsTool } from '../tools/analytics.tool';

export class ProgressService {
  static async getProgressData(userId: string) {
    const progress = await ProgressTool.getProgressData(userId);
    const analytics = await AnalyticsTool.analyzeStrengthProgress(userId);
    const measurements = await ProgressTool.getBodyMeasurements(userId);

    const userProfile = await prisma.userProfile.findUnique({ where: { userId } });

    return {
      currentWeight: userProfile?.weightKg || (measurements.length > 0 ? measurements[0].weightKg : 70),
      startingWeight: measurements.length > 0 ? measurements[measurements.length - 1].weightKg : 70,
      measurements,
      totalWorkouts: progress.totalWorkouts,
      totalVolumeKg: progress.totalVolume,
      analytics,
      recentSessions: progress.recentSessions,
    };
  }

  static async logMeasurement(userId: string, data: any) {
    const { weightKg, chestCm, waistCm, armsCm, thighsCm, bodyFatPercentage } = data;

    const record = await prisma.bodyMeasurement.create({
      data: {
        userId,
        weightKg: Number(weightKg),
        chestCm: chestCm ? Number(chestCm) : null,
        waistCm: waistCm ? Number(waistCm) : null,
        armsCm: armsCm ? Number(armsCm) : null,
        thighsCm: thighsCm ? Number(thighsCm) : null,
        bodyFatPercentage: bodyFatPercentage ? Number(bodyFatPercentage) : null,
      },
    });

    // Update user profile current weight
    if (weightKg) {
      await prisma.userProfile.update({
        where: { userId },
        data: { weightKg: Number(weightKg) },
      });
    }

    return record;
  }
}
