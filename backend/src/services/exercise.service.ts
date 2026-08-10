import { prisma } from '../config/db';

export interface ExerciseQueryParams {
  muscle?: string;
  category?: string;
  difficulty?: string;
  equipment?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class ExerciseService {
  static async getAllExercises(params: ExerciseQueryParams) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = { isActive: true };

    if (params.muscle) {
      where.muscleGroup = params.muscle.toUpperCase();
    }
    if (params.category) {
      where.category = { contains: params.category };
    }
    if (params.difficulty) {
      where.difficulty = params.difficulty.toUpperCase();
    }
    if (params.equipment) {
      where.equipment = params.equipment.toUpperCase();
    }
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { primaryMuscle: { contains: params.search } },
        { category: { contains: params.search } },
        { description: { contains: params.search } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.exercise.count({ where }),
      prisma.exercise.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  static async getExerciseById(idOrSlug: string) {
    return prisma.exercise.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        isActive: true,
      },
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
      take: 20,
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

  static async getExercisesByCategory(category: string) {
    return prisma.exercise.findMany({
      where: {
        category: { contains: category },
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
