import { prisma } from '../config/db';

export class ExerciseTool {
  static async getExercises(limit = 20) {
    return prisma.exercise.findMany({
      where: { isActive: true },
      take: limit,
      orderBy: { name: 'asc' },
    });
  }

  static async getExercisesByMuscle(muscleGroup: string) {
    return prisma.exercise.findMany({
      where: {
        muscleGroup: muscleGroup.toUpperCase() as any,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  static async searchExercises(query: string) {
    return prisma.exercise.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query } },
          { primaryMuscle: { contains: query } },
          { category: { contains: query } },
          { description: { contains: query } },
        ],
      },
      take: 10,
    });
  }

  static async getExerciseDetails(idOrSlug: string) {
    return prisma.exercise.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        isActive: true,
      },
    });
  }
}
