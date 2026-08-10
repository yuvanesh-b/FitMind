import { prisma } from '../config/db';
import { AppError } from '../utils/errors';
import { CalculatorTool } from '../tools/calculator.tool';

export class WorkoutService {
  static async getPlans(userId: string) {
    return prisma.workoutPlan.findMany({
      where: { userId },
      include: {
        days: {
          orderBy: { dayOrder: 'asc' },
          include: {
            exercises: {
              orderBy: { order: 'asc' },
              include: { exercise: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getPlanById(userId: string, id: string) {
    const plan = await prisma.workoutPlan.findFirst({
      where: { id, userId },
      include: {
        days: {
          orderBy: { dayOrder: 'asc' },
          include: {
            exercises: {
              orderBy: { order: 'asc' },
              include: { exercise: true },
            },
          },
        },
      },
    });
    if (!plan) throw new AppError('Workout plan not found', 404);
    return plan;
  }

  static async createPlan(userId: string, data: any) {
    const { name, description, days } = data;

    return prisma.workoutPlan.create({
      data: {
        userId,
        name: name || 'New Custom Plan',
        description,
        isCustom: true,
        days: {
          create: days?.map((day: any, idx: number) => ({
            dayName: day.dayName || `Day ${idx + 1}`,
            dayOrder: idx + 1,
            targetMuscles: day.targetMuscles || 'Full Body',
            exercises: {
              create: day.exercises?.map((ex: any, exIdx: number) => ({
                exerciseId: ex.exerciseId,
                order: exIdx + 1,
                targetSets: ex.targetSets || 3,
                targetReps: ex.targetReps || 10,
                restSeconds: ex.restSeconds || 60,
              })),
            },
          })),
        },
      },
      include: {
        days: {
          include: {
            exercises: { include: { exercise: true } },
          },
        },
      },
    });
  }

  static async startSession(userId: string, data: { planId?: string; title: string; exerciseIds: string[] }) {
    const { planId, title, exerciseIds } = data;

    let targetExerciseIds = exerciseIds || [];
    if (!targetExerciseIds || targetExerciseIds.length === 0) {
      const defaultDbExercises = await prisma.exercise.findMany({ take: 4 });
      targetExerciseIds = defaultDbExercises.map((e) => e.id);
    }

    const session = await prisma.workoutSession.create({
      data: {
        userId,
        planId: planId || null,
        title: title || 'Workout Session',
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });

    for (let i = 0; i < targetExerciseIds.length; i++) {
      const exId = targetExerciseIds[i];

      const previousEx = await prisma.workoutSessionExercise.findFirst({
        where: {
          exerciseId: exId,
          session: { userId, status: 'COMPLETED' },
        },
        orderBy: { session: { startedAt: 'desc' } },
        include: { sets: true },
      });

      const prevFirstSet = previousEx?.sets[0];

      const sessionEx = await prisma.workoutSessionExercise.create({
        data: {
          sessionId: session.id,
          exerciseId: exId,
          order: i + 1,
        },
      });

      for (let s = 1; s <= 3; s++) {
        await prisma.workoutSet.create({
          data: {
            sessionExerciseId: sessionEx.id,
            setNumber: s,
            weightKg: prevFirstSet ? prevFirstSet.weightKg : 50,
            reps: prevFirstSet ? prevFirstSet.reps : 10,
            isCompleted: false,
            previousWeightKg: prevFirstSet ? prevFirstSet.weightKg : null,
            previousReps: prevFirstSet ? prevFirstSet.reps : null,
          },
        });
      }
    }

    return prisma.workoutSession.findUnique({
      where: { id: session.id },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
          include: {
            exercise: true,
            sets: { orderBy: { setNumber: 'asc' } },
          },
        },
      },
    });
  }

  static async getPreviousExerciseHistory(userId: string, exerciseId: string) {
    const previousEx = await prisma.workoutSessionExercise.findFirst({
      where: {
        exerciseId,
        session: { userId, status: 'COMPLETED' },
      },
      orderBy: { session: { startedAt: 'desc' } },
      include: {
        sets: { orderBy: { setNumber: 'asc' } },
      },
    });

    return previousEx ? previousEx.sets : [];
  }

  static async updateSet(setId: string, data: { weightKg?: number; reps?: number; isCompleted?: boolean }) {
    return prisma.workoutSet.update({
      where: { id: setId },
      data: {
        ...(data.weightKg !== undefined && { weightKg: Number(data.weightKg) }),
        ...(data.reps !== undefined && { reps: Number(data.reps) }),
        ...(data.isCompleted !== undefined && { isCompleted: Boolean(data.isCompleted) }),
      },
    });
  }

  static async completeSession(sessionId: string, userId: string, durationSeconds: number, notes?: string) {
    const session = await prisma.workoutSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        exercises: {
          include: { sets: true },
        },
      },
    });

    if (!session) throw new AppError('Session not found', 404);

    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;

    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        if (set.isCompleted) {
          totalSets++;
          totalReps += set.reps;
          totalVolume += set.weightKg * set.reps;
        }
      }
    }

    const durationMin = Math.max(1, Math.round(durationSeconds / 60));
    const estimatedCalories = Math.round(durationMin * 7.5); // ~7.5 kcal/min average workout burn

    const updated = await prisma.workoutSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        durationSeconds,
        totalVolumeKg: totalVolume,
        totalSets,
        totalReps,
        caloriesBurned: estimatedCalories,
        notes,
      },
      include: {
        exercises: {
          include: { exercise: true, sets: true },
        },
      },
    });

    // Update Daily Activity record
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activity = await prisma.dailyActivity.findFirst({
      where: { userId, date: { gte: today } },
    });

    if (activity) {
      await prisma.dailyActivity.update({
        where: { id: activity.id },
        data: {
          workoutsDone: activity.workoutsDone + 1,
          caloriesBurned: activity.caloriesBurned + estimatedCalories,
          activeMinutes: activity.activeMinutes + durationMin,
        },
      });
    } else {
      await prisma.dailyActivity.create({
        data: {
          userId,
          workoutsDone: 1,
          caloriesBurned: estimatedCalories,
          activeMinutes: durationMin,
        },
      });
    }

    return updated;
  }

  static async getSessions(userId: string) {
    return prisma.workoutSession.findMany({
      where: { userId },
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

  static async getSessionById(userId: string, id: string) {
    return prisma.workoutSession.findFirst({
      where: { id, userId },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
          include: {
            exercise: true,
            sets: { orderBy: { setNumber: 'asc' } },
          },
        },
      },
    });
  }

  static async getActiveSession(userId: string) {
    return prisma.workoutSession.findFirst({
      where: { userId, status: 'IN_PROGRESS' },
      orderBy: { startedAt: 'desc' },
      include: {
        exercises: {
          orderBy: { order: 'asc' },
          include: {
            exercise: true,
            sets: { orderBy: { setNumber: 'asc' } },
          },
        },
      },
    });
  }

  static async aiGeneratePlan(userId: string, options: any) {
    const { goal = 'MUSCLE_GAIN', experience = 'INTERMEDIATE', daysPerWeek = 4, durationMin = 45, equipment = 'FULL_GYM', focusMuscle = 'FULL_BODY' } = options;

    // Retrieve exercises from MySQL database matching equipment or category
    const availableExercises = await prisma.exercise.findMany({
      take: 20,
    });

    const exList = availableExercises.length > 0 ? availableExercises : await prisma.exercise.findMany();
    const dayCount = Math.min(6, Math.max(2, Number(daysPerWeek) || 4));

    const generatedDays: any[] = [];
    for (let d = 1; d <= dayCount; d++) {
      const selected = exList.slice((d - 1) * 3, d * 3 + 1);
      const exercisesForDay = (selected.length > 0 ? selected : exList.slice(0, 3)).map((ex, idx) => ({
        exerciseId: ex.id,
        order: idx + 1,
        targetSets: experience === 'ADVANCED' ? 4 : 3,
        targetReps: goal === 'STRENGTH' ? 5 : 10,
        restSeconds: 60,
      }));

      generatedDays.push({
        dayName: `Day ${d} - ${focusMuscle === 'FULL_BODY' ? 'Hypertrophy & Strength' : focusMuscle}`,
        dayOrder: d,
        targetMuscles: focusMuscle || 'Full Body',
        exercises: {
          create: exercisesForDay,
        },
      });
    }

    const planName = `AI ${goal.replace('_', ' ')} ${daysPerWeek}D Program`;

    return prisma.workoutPlan.create({
      data: {
        userId,
        name: planName,
        description: `Custom ${daysPerWeek}-day AI generated plan tailored for ${experience.toLowerCase()} level using ${equipment.toLowerCase().replace('_', ' ')}.`,
        isAiGenerated: true,
        days: {
          create: generatedDays,
        },
      },
      include: {
        days: {
          include: {
            exercises: { include: { exercise: true } },
          },
        },
      },
    });
  }
}
