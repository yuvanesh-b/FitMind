import { prisma } from '../config/db';

export class AgentTools {
  // 1. User Profile Context
  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        goals: { where: { isCompleted: false } },
      },
    });

    if (!user) return { error: 'User profile not found' };

    return {
      name: user.name,
      email: user.email,
      age: user.profile?.age || null,
      gender: user.profile?.gender || null,
      heightCm: user.profile?.heightCm || null,
      weightKg: user.profile?.weightKg || null,
      targetWeightKg: user.profile?.targetWeightKg || null,
      fitnessLevel: user.profile?.fitnessLevel || 'BEGINNER',
      workoutFrequencyDays: user.profile?.workoutFrequencyDays || 4,
      preferredDurationMin: user.profile?.preferredDurationMin || 45,
      availableEquipment: user.profile?.availableEquipment || 'FULL_GYM',
      activeGoals: user.goals.map((g) => ({
        category: g.category,
        title: g.title,
        targetValue: g.targetValue,
        unit: g.unit,
      })),
    };
  }

  // 2. Recent Workouts
  static async getRecentWorkouts(userId: string, limit: number = 5) {
    const sessions = await prisma.workoutSession.findMany({
      where: { userId, status: 'COMPLETED' },
      take: limit,
      orderBy: { completedAt: 'desc' },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });

    return sessions.map((s) => ({
      sessionId: s.id,
      title: s.title,
      completedAt: s.completedAt,
      durationMinutes: Math.round(s.durationSeconds / 60),
      totalVolumeKg: s.totalVolumeKg,
      totalSets: s.totalSets,
      totalReps: s.totalReps,
      caloriesBurned: s.caloriesBurned,
      exercises: s.exercises.map((e) => ({
        exerciseName: e.exercise.name,
        muscleGroup: e.exercise.muscleGroup,
        setsCount: e.sets.length,
        maxWeightKg: Math.max(...e.sets.map((set) => set.weightKg), 0),
        totalReps: e.sets.reduce((sum, set) => sum + set.reps, 0),
      })),
    }));
  }

  // 3. Workout History by Days
  static async getWorkoutHistory(userId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sessions = await prisma.workoutSession.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        completedAt: { gte: startDate },
      },
      orderBy: { completedAt: 'asc' },
    });

    return {
      daysAnalyzed: days,
      completedWorkoutsCount: sessions.length,
      totalVolumeKg: sessions.reduce((sum, s) => sum + s.totalVolumeKg, 0),
      totalDurationMinutes: Math.round(sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / 60),
      sessions: sessions.map((s) => ({
        title: s.title,
        date: s.completedAt,
        volumeKg: s.totalVolumeKg,
        durationMinutes: Math.round(s.durationSeconds / 60),
      })),
    };
  }

  // 4. Workout by Date
  static async getWorkoutByDate(userId: string, dateStr: string) {
    const date = new Date(dateStr);
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));

    const sessions = await prisma.workoutSession.findMany({
      where: {
        userId,
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });

    return sessions;
  }

  // 5. Recent Workout Performance
  static async getRecentWorkoutPerformance(userId: string) {
    const latestSession = await prisma.workoutSession.findFirst({
      where: { userId, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });

    if (!latestSession) return { message: 'No completed workouts recorded yet.' };

    return {
      title: latestSession.title,
      date: latestSession.completedAt,
      volumeKg: latestSession.totalVolumeKg,
      sets: latestSession.totalSets,
      reps: latestSession.totalReps,
      exercises: latestSession.exercises.map((e) => ({
        name: e.exercise.name,
        muscle: e.exercise.muscleGroup,
        sets: e.sets.map((s) => ({ set: s.setNumber, weightKg: s.weightKg, reps: s.reps })),
      })),
    };
  }

  // 6. Exercise Progress Tracking
  static async getExerciseProgress(userId: string, exerciseName: string) {
    const exercise = await prisma.exercise.findFirst({
      where: { name: { contains: exerciseName } },
    });

    if (!exercise) {
      return { message: `No exercise matching "${exerciseName}" found in database.` };
    }

    const sessionExercises = await prisma.workoutSessionExercise.findMany({
      where: {
        exerciseId: exercise.id,
        session: { userId, status: 'COMPLETED' },
      },
      orderBy: { session: { completedAt: 'asc' } },
      include: {
        session: true,
        sets: true,
      },
    });

    const history = sessionExercises.map((se) => {
      const maxWeight = Math.max(...se.sets.map((s) => s.weightKg), 0);
      const totalVolume = se.sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
      const totalReps = se.sets.reduce((sum, s) => sum + s.reps, 0);
      return {
        date: se.session.completedAt,
        maxWeightKg: maxWeight,
        totalVolumeKg: totalVolume,
        totalReps,
        setsCount: se.sets.length,
      };
    });

    return {
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      totalSessionsTracked: history.length,
      history,
    };
  }

  // 7. Muscle Training Frequency
  static async getMuscleTrainingFrequency(userId: string) {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const sessionExercises = await prisma.workoutSessionExercise.findMany({
      where: {
        session: { userId, status: 'COMPLETED', completedAt: { gte: fourteenDaysAgo } },
      },
      include: {
        exercise: true,
        session: true,
      },
    });

    const frequency: Record<string, { count: number; lastTrained: Date | null }> = {};

    sessionExercises.forEach((se) => {
      const muscle = se.exercise.muscleGroup;
      const date = se.session.completedAt || se.session.createdAt;

      if (!frequency[muscle]) {
        frequency[muscle] = { count: 0, lastTrained: null };
      }

      frequency[muscle].count += 1;
      if (!frequency[muscle].lastTrained || date > frequency[muscle].lastTrained!) {
        frequency[muscle].lastTrained = date;
      }
    });

    return frequency;
  }

  // 8. Weekly Workout Summary
  static async getWeeklyWorkoutSummary(userId: string) {
    return AgentTools.getWorkoutHistory(userId, 7);
  }

  // 9. Progress Data (Weight, Volume, Streaks)
  static async getProgressData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    const totalWorkouts = await prisma.workoutSession.count({
      where: { userId, status: 'COMPLETED' },
    });

    const recentWorkouts = await prisma.workoutSession.findMany({
      where: { userId, status: 'COMPLETED' },
      take: 5,
      orderBy: { completedAt: 'desc' },
    });

    const records = await prisma.progressRecord.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 10,
    });

    const measurements = await prisma.bodyMeasurement.findMany({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
      take: 5,
    });

    return {
      currentWeightKg: user?.profile?.weightKg || null,
      targetWeightKg: user?.profile?.targetWeightKg || null,
      totalCompletedWorkouts: totalWorkouts,
      recentWorkoutsCount: recentWorkouts.length,
      latestProgressRecords: records,
      bodyMeasurementsCount: measurements.length,
      latestBodyMeasurements: measurements,
    };
  }

  // 10. Weight History
  static async getWeightHistory(userId: string) {
    const measurements = await prisma.bodyMeasurement.findMany({
      where: { userId },
      orderBy: { recordedAt: 'asc' },
    });

    return measurements.map((m) => ({
      date: m.recordedAt,
      weightKg: m.weightKg,
      bodyFatPercentage: m.bodyFatPercentage,
    }));
  }

  // 11. Today's Nutrition Intake
  static async getNutritionToday(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const logs = await prisma.nutritionLog.findMany({
      where: { userId, loggedAt: { gte: startOfDay } },
      orderBy: { loggedAt: 'asc' },
    });

    const totalCal = logs.reduce((sum, l) => sum + l.calories, 0);
    const totalProt = Number(logs.reduce((sum, l) => sum + l.proteinG, 0).toFixed(1));
    const totalCarbs = Number(logs.reduce((sum, l) => sum + l.carbsG, 0).toFixed(1));
    const totalFat = Number(logs.reduce((sum, l) => sum + l.fatG, 0).toFixed(1));
    const totalFiber = Number(logs.reduce((sum, l) => sum + (l.fiberG || 0), 0).toFixed(1));

    return {
      date: startOfDay,
      logsCount: logs.length,
      totals: {
        calories: totalCal,
        proteinG: totalProt,
        carbsG: totalCarbs,
        fatG: totalFat,
        fiberG: totalFiber,
      },
      foodsLogged: logs.map((l) => ({
        foodName: l.foodName,
        mealType: l.mealType,
        quantity: l.quantity,
        calories: l.calories,
        proteinG: l.proteinG,
        carbsG: l.carbsG,
        fatG: l.fatG,
        fiberG: l.fiberG,
      })),
    };
  }

  // 12. Nutrition History
  static async getNutritionHistory(userId: string, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await prisma.nutritionLog.findMany({
      where: { userId, loggedAt: { gte: startDate } },
      orderBy: { loggedAt: 'asc' },
    });

    return {
      daysAnalyzed: days,
      totalLogs: logs.length,
      logs,
    };
  }

  // 13. Remaining Nutrition Budget
  static async getRemainingNutritionBudget(userId: string) {
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const today = await AgentTools.getNutritionToday(userId);

    const weightKg = profile?.weightKg || 70;
    const targetCalories = Math.round(weightKg * 32);
    const targetProtein = Math.round(weightKg * 2.0);
    const targetCarbs = Math.round(weightKg * 3.5);
    const targetFat = Math.round(weightKg * 1.0);
    const targetFiber = 30;

    return {
      target: {
        calories: targetCalories,
        proteinG: targetProtein,
        carbsG: targetCarbs,
        fatG: targetFat,
        fiberG: targetFiber,
      },
      consumed: today.totals,
      remaining: {
        calories: Math.max(0, targetCalories - today.totals.calories),
        proteinG: Math.max(0, Number((targetProtein - today.totals.proteinG).toFixed(1))),
        carbsG: Math.max(0, Number((targetCarbs - today.totals.carbsG).toFixed(1))),
        fatG: Math.max(0, Number((targetFat - today.totals.fatG).toFixed(1))),
        fiberG: Math.max(0, Number((targetFiber - today.totals.fiberG).toFixed(1))),
      },
    };
  }

  // 14. Hydration Status
  static async getHydrationStatus(userId: string) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const logs = await prisma.waterLog.findMany({
      where: { userId, loggedAt: { gte: startOfDay } },
    });

    const totalMl = logs.reduce((sum, l) => sum + l.amountMl, 0);
    const targetMl = 3000;

    return {
      consumedMl: totalMl,
      consumedLiters: (totalMl / 1000).toFixed(2),
      targetLiters: (targetMl / 1000).toFixed(2),
      percentage: Math.min(100, Math.round((totalMl / targetMl) * 100)),
    };
  }

  // 15. Calculate Training Volume
  static async calculateTrainingVolume(userId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessions = await prisma.workoutSession.findMany({
      where: { userId, status: 'COMPLETED', completedAt: { gte: thirtyDaysAgo } },
      orderBy: { completedAt: 'asc' },
    });

    const totalVolume = sessions.reduce((sum, s) => sum + s.totalVolumeKg, 0);

    return {
      sessionsCount: sessions.length,
      totalVolumeKg30Days: totalVolume,
      avgVolumePerSessionKg: sessions.length ? Math.round(totalVolume / sessions.length) : 0,
    };
  }

  // 16. Progressive Overload Calculation
  static async calculateProgressiveOverload(userId: string, exerciseName: string) {
    const progress = await AgentTools.getExerciseProgress(userId, exerciseName);

    if ('message' in progress) return progress;

    const history = progress.history;
    if (history.length < 2) {
      return {
        exerciseName: progress.exerciseName,
        recommendation: 'INSUFFICIENT_DATA',
        detail: 'Log at least 2 sessions of this exercise to calculate progressive overload trends.',
      };
    }

    const latest = history[history.length - 1];
    const previous = history[history.length - 2];

    const weightDiff = latest.maxWeightKg - previous.maxWeightKg;
    const volumeDiff = latest.totalVolumeKg - previous.totalVolumeKg;

    let recommendation = 'MAINTAIN';
    let suggestion = 'Keep current working weight to build form mastery.';

    if (weightDiff > 0 || volumeDiff > 0) {
      recommendation = 'INCREASE_WEIGHT';
      suggestion = `Great progress! Weight increased by ${weightDiff}kg. If all target reps were clean, add 2.5kg next session.`;
    } else if (weightDiff === 0 && latest.totalReps >= previous.totalReps) {
      recommendation = 'INCREASE_REPS_OR_WEIGHT';
      suggestion = 'Completed previous target reps. Try adding 1 extra rep per set or micro-loading weight.';
    } else if (volumeDiff < 0) {
      recommendation = 'DELOAD_OR_RECOVER';
      suggestion = 'Training volume decreased. Consider a deload set or extra rest day.';
    }

    return {
      exerciseName: progress.exerciseName,
      latestSession: latest,
      previousSession: previous,
      weightDiffKg: weightDiff,
      volumeDiffKg: volumeDiff,
      recommendation,
      suggestion,
    };
  }

  // 17. Recovery Context
  static async getRecoveryContext(userId: string) {
    const latestSession = await prisma.workoutSession.findFirst({
      where: { userId, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      include: {
        exercises: { include: { exercise: true } },
      },
    });

    if (!latestSession || !latestSession.completedAt) {
      return { hoursSinceLastWorkout: 999, status: 'FULLY_RECOVERED', note: 'No recent workouts logged.' };
    }

    const now = new Date();
    const hoursSince = Math.round((now.getTime() - new Date(latestSession.completedAt).getTime()) / (1000 * 60 * 60));

    let status = 'RECOVERING';
    if (hoursSince >= 48) status = 'FULLY_RECOVERED';
    else if (hoursSince < 24) status = 'POST_WORKOUT_FATIGUE';

    return {
      hoursSinceLastWorkout: hoursSince,
      lastWorkoutTitle: latestSession.title,
      lastTrainedDate: latestSession.completedAt,
      lastMusclesTrained: latestSession.exercises.map((e) => e.exercise.muscleGroup),
      recoveryStatus: status,
    };
  }

  // 18. Weekly Fitness Summary
  static async getWeeklyFitnessSummary(userId: string) {
    const workoutHistory = await AgentTools.getWorkoutHistory(userId, 7);
    const nutritionToday = await AgentTools.getNutritionToday(userId);
    const hydration = await AgentTools.getHydrationStatus(userId);
    const recovery = await AgentTools.getRecoveryContext(userId);

    return {
      workoutSummary: workoutHistory,
      todayNutrition: nutritionToday,
      hydrationStatus: hydration,
      recoveryContext: recovery,
    };
  }
}

// Groq Function/Tool Schemas for Tool Calling
export const GROQ_TOOLS = [
  {
    type: 'function',
    function: {
      name: 'getUserProfile',
      description: 'Fetch authenticated user fitness profile, goals, age, weight, target weight, and experience level.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getRecentWorkouts',
      description: 'Fetch user recent completed workout sessions with sets, reps, and exercise volume.',
      parameters: {
        type: 'object',
        properties: { limit: { type: 'number', description: 'Number of recent workouts to retrieve (default 5)' } },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getWorkoutHistory',
      description: 'Fetch user workout session history for the specified number of past days.',
      parameters: {
        type: 'object',
        properties: { days: { type: 'number', description: 'Past days window (default 7)' } },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getRecentWorkoutPerformance',
      description: 'Fetch latest completed workout session details including exercise sets, weights, and reps.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getExerciseProgress',
      description: 'Track max weight and volume history for a specific exercise like Bench Press or Squat.',
      parameters: {
        type: 'object',
        properties: { exerciseName: { type: 'string', description: 'Name of exercise to track (e.g. Bench Press)' } },
        required: ['exerciseName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getMuscleTrainingFrequency',
      description: 'Analyze training frequency and last trained date for all muscle groups in past 14 days.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getWeeklyWorkoutSummary',
      description: 'Get total workouts completed, total volume, and session breakdown over the past 7 days.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getProgressData',
      description: 'Fetch body weight measurements, total volume trends, and workout consistency streaks.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getWeightHistory',
      description: 'Fetch recorded body weight and body fat percentage history over time.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getNutritionToday',
      description: 'Fetch today logged meals, calories, protein, carbs, fat, and fiber totals.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getRemainingNutritionBudget',
      description: 'Calculate remaining calories, protein, carbs, fat, and fiber left for today.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getHydrationStatus',
      description: 'Fetch today water intake in liters, target, and percentage completion.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'calculateProgressiveOverload',
      description: 'Analyze progressive overload trends for an exercise (weight & volume progression recommendations).',
      parameters: {
        type: 'object',
        properties: { exerciseName: { type: 'string', description: 'Exercise name to calculate overload for' } },
        required: ['exerciseName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getRecoveryContext',
      description: 'Calculate hours since last workout, recovery status, and fatigue context for muscle groups.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getWeeklyFitnessSummary',
      description: 'Generate comprehensive 7-day fitness summary covering workouts, volume, nutrition, and recovery.',
      parameters: { type: 'object', properties: {} },
    },
  },
];

// Targeted tool selection based on intent
export function getToolsForIntent(intent?: string) {
  const intentUpper = (intent || '').toUpperCase();

  switch (intentUpper) {
    case 'PROFILE_DETAILS':
      return GROQ_TOOLS.filter((t) =>
        ['getUserProfile', 'getProgressData'].includes(t.function.name)
      );

    case 'GREETING':
    case 'THANKS':
    case 'FAREWELL':
    case 'GENERAL_FITNESS':
      return []; // ZERO database queries for casual messages and general educational fitness questions!

    case 'TODAY_WORKOUT':
    case 'WORKOUT_RECOMMENDATION':
    case 'WORKOUT_GENERATION':
      return GROQ_TOOLS.filter((t) =>
        ['getUserProfile', 'getRecentWorkouts', 'getMuscleTrainingFrequency', 'getRecoveryContext'].includes(t.function.name)
      );

    case 'WORKOUT_HISTORY':
      return GROQ_TOOLS.filter((t) =>
        ['getWorkoutHistory', 'getRecentWorkouts', 'getRecentWorkoutPerformance'].includes(t.function.name)
      );

    case 'EXERCISE_PROGRESS':
    case 'STRENGTH_PROGRESS':
      return GROQ_TOOLS.filter((t) =>
        ['getExerciseProgress', 'calculateProgressiveOverload', 'getRecentWorkoutPerformance'].includes(t.function.name)
      );

    case 'PROGRESS_ANALYSIS':
    case 'GOAL_PROGRESS':
      return GROQ_TOOLS.filter((t) =>
        ['getProgressData', 'getWeightHistory', 'getWeeklyWorkoutSummary'].includes(t.function.name)
      );

    case 'PROTEIN_STATUS':
    case 'CALORIE_STATUS':
    case 'NUTRITION_TODAY':
    case 'NUTRITION_ANALYSIS':
    case 'NUTRITION_ADVICE':
    case 'NUTRITION_GUIDANCE':
      return GROQ_TOOLS.filter((t) =>
        ['getNutritionToday', 'getRemainingNutritionBudget'].includes(t.function.name)
      );

    case 'HYDRATION_STATUS':
      return GROQ_TOOLS.filter((t) =>
        ['getHydrationStatus'].includes(t.function.name)
      );

    case 'RECOVERY_ADVICE':
      return GROQ_TOOLS.filter((t) =>
        ['getRecoveryContext', 'getMuscleTrainingFrequency'].includes(t.function.name)
      );

    case 'WEEKLY_REPORT':
      return GROQ_TOOLS.filter((t) =>
        ['getWeeklyFitnessSummary', 'getWorkoutHistory', 'getNutritionToday', 'getHydrationStatus'].includes(t.function.name)
      );

    case 'FUTURE_WORKOUT_PLAN':
    case 'NEXT_PLAN':
      return GROQ_TOOLS.filter((t) =>
        ['getWorkoutHistory', 'getMuscleTrainingFrequency', 'getUserProfile'].includes(t.function.name)
      );

    default:
      return [];
  }
}

// Helper to execute selected tool by name
export async function executeAgentTool(toolName: string, args: any, userId: string): Promise<any> {
  console.log(`[DATABASE TOOL] Executing tool: ${toolName} for User ID: ${userId}`);
  try {
    switch (toolName) {
      case 'getUserProfile':
        return await AgentTools.getUserProfile(userId);
      case 'getRecentWorkouts':
        return await AgentTools.getRecentWorkouts(userId, args?.limit || 5);
      case 'getWorkoutHistory':
        return await AgentTools.getWorkoutHistory(userId, args?.days || 7);
      case 'getRecentWorkoutPerformance':
        return await AgentTools.getRecentWorkoutPerformance(userId);
      case 'getExerciseProgress':
        return await AgentTools.getExerciseProgress(userId, args?.exerciseName || 'Bench Press');
      case 'getMuscleTrainingFrequency':
        return await AgentTools.getMuscleTrainingFrequency(userId);
      case 'getWeeklyWorkoutSummary':
        return await AgentTools.getWeeklyWorkoutSummary(userId);
      case 'getProgressData':
        return await AgentTools.getProgressData(userId);
      case 'getWeightHistory':
        return await AgentTools.getWeightHistory(userId);
      case 'getNutritionToday':
        return await AgentTools.getNutritionToday(userId);
      case 'getRemainingNutritionBudget':
        return await AgentTools.getRemainingNutritionBudget(userId);
      case 'getHydrationStatus':
        return await AgentTools.getHydrationStatus(userId);
      case 'calculateProgressiveOverload':
        return await AgentTools.calculateProgressiveOverload(userId, args?.exerciseName || 'Bench Press');
      case 'getRecoveryContext':
        return await AgentTools.getRecoveryContext(userId);
      case 'getWeeklyFitnessSummary':
        return await AgentTools.getWeeklyFitnessSummary(userId);
      default:
        console.warn(`[DATABASE TOOL WARNING] Tool ${toolName} not recognized.`);
        return { error: `Tool ${toolName} not recognized.` };
    }
  } catch (error: any) {
    console.error(`[DATABASE TOOL ERROR] Failed executing ${toolName}:`, error?.message || error);
    return { error: `Failed executing ${toolName}: ${error?.message || 'Database query error'}` };
  }
}
