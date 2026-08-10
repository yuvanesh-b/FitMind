import { prisma } from '../config/db';

export class WorkoutTool {
  static async getRecentWorkouts(userId: string, limit = 5) {
    return prisma.workoutSession.findMany({
      where: { userId, status: 'COMPLETED' },
      orderBy: { startedAt: 'desc' },
      take: limit,
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });
  }

  static async getExerciseHistory(userId: string, exerciseId: string) {
    return prisma.workoutSessionExercise.findMany({
      where: {
        exerciseId,
        session: { userId, status: 'COMPLETED' },
      },
      orderBy: { session: { startedAt: 'desc' } },
      take: 5,
      include: {
        session: { select: { startedAt: true } },
        sets: true,
      },
    });
  }

  static async getLastWorkout(userId: string) {
    return prisma.workoutSession.findFirst({
      where: { userId, status: 'COMPLETED' },
      orderBy: { startedAt: 'desc' },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });
  }
}
