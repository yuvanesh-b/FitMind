import { prisma } from '../config/db';

export class ProfileTool {
  static async getUserProfile(userId: string) {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    const goals = await prisma.fitnessGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      profile,
      goals,
    };
  }

  static async getFitnessGoal(userId: string) {
    return prisma.fitnessGoal.findFirst({
      where: { userId, isCompleted: false },
      orderBy: { createdAt: 'desc' },
    });
  }
}
