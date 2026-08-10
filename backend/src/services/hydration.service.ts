import { prisma } from '../config/db';

export class HydrationService {
  static async logWater(userId: string, amountMl: number) {
    const validAmount = Math.max(50, Math.min(3000, Number(amountMl) || 250));
    return prisma.waterLog.create({
      data: {
        userId,
        amountMl: validAmount,
        loggedAt: new Date(),
      },
    });
  }

  static async getTodayWater(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await prisma.waterLog.findMany({
      where: {
        userId,
        loggedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { loggedAt: 'desc' },
    });

    const totalConsumedMl = logs.reduce((sum, log) => sum + log.amountMl, 0);

    // Calculate dynamic water target based on user weight if profile exists, default 3000ml (3.0L)
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const targetMl = profile ? Math.round(profile.weightKg * 35) : 3000;
    const percentage = Math.min(100, Math.round((totalConsumedMl / targetMl) * 100));

    return {
      consumedMl: totalConsumedMl,
      consumedLiters: Number((totalConsumedMl / 1000).toFixed(1)),
      targetMl,
      targetLiters: Number((targetMl / 1000).toFixed(1)),
      percentage,
      logs,
    };
  }
}
