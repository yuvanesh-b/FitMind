import { prisma } from '../config/db';
import { AppError } from '../utils/errors';

export interface ExerciseRecommendation {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  category: string;
  equipment: string;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  instructions?: string;
  isSubstitution?: boolean;
}

export interface DayPlan {
  dayNumber: number;
  date: string;
  dayName: string;
  workoutType: string;
  isRestDay: boolean;
  targetMuscleGroups: string[];
  exercises: ExerciseRecommendation[];
  reason: string;
}

export interface AdaptiveAnalysis {
  historyDays: number;
  totalSessionsCount: number;
  activeDaysCount: number;
  restDaysCount: number;
  completedExercisesCount: number;
  skippedExercisesCount: number;
  frequentlySkippedExercises: string[];
  muscleGroupFrequency: Record<string, { sessions: number; sets: number; volumeKg: number; lastTrainedDate: string | null }>;
  repeatedMuscles: string[];
  neglectedMuscles: string[];
  userGoal: string;
  fitnessLevel: string;
  targetFrequencyDays: number;
  availableEquipment: string;
}

export interface AdaptivePlanResult {
  id?: string;
  generatedAt: string;
  startDate: string;
  endDate: string;
  historyWindowDays: number;
  analysis: AdaptiveAnalysis;
  days: DayPlan[];
}

export class AdaptiveWorkoutService {
  /**
   * Analyze the previous 6 days of actual workout records from MySQL for the authenticated user
   */
  static async getPrevious6DaysAnalysis(userId: string): Promise<AdaptiveAnalysis> {
    console.log(`[ADAPTIVE AGENT] Analyzing previous 6 days of workout data for User ID: ${userId}`);

    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
    sixDaysAgo.setHours(0, 0, 0, 0);

    // 1. Fetch User Profile & Goals
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const goals = await prisma.fitnessGoal.findMany({ where: { userId, isCompleted: false } });

    const userGoal = goals.length > 0 ? goals[0].category : 'GENERAL_FITNESS';
    const fitnessLevel = profile?.fitnessLevel || 'BEGINNER';
    const targetFrequencyDays = profile?.workoutFrequencyDays || 4;
    const availableEquipment = profile?.availableEquipment || 'FULL_GYM';

    // 2. Fetch Sessions from past 6 days
    const sessions = await prisma.workoutSession.findMany({
      where: {
        userId,
        startedAt: { gte: sixDaysAgo },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
      orderBy: { startedAt: 'asc' },
    });

    const activeDaysSet = new Set<string>();
    let completedExercisesCount = 0;
    let skippedExercisesCount = 0;
    const skippedCounts: Record<string, number> = {};

    const muscleMap: Record<string, { sessions: number; sets: number; volumeKg: number; lastTrainedDate: string | null }> = {
      CHEST: { sessions: 0, sets: 0, volumeKg: 0, lastTrainedDate: null },
      BACK: { sessions: 0, sets: 0, volumeKg: 0, lastTrainedDate: null },
      SHOULDERS: { sessions: 0, sets: 0, volumeKg: 0, lastTrainedDate: null },
      BICEPS: { sessions: 0, sets: 0, volumeKg: 0, lastTrainedDate: null },
      TRICEPS: { sessions: 0, sets: 0, volumeKg: 0, lastTrainedDate: null },
      QUADS: { sessions: 0, sets: 0, volumeKg: 0, lastTrainedDate: null },
      HAMSTRINGS: { sessions: 0, sets: 0, volumeKg: 0, lastTrainedDate: null },
      GLUTES: { sessions: 0, sets: 0, volumeKg: 0, lastTrainedDate: null },
      CORE: { sessions: 0, sets: 0, volumeKg: 0, lastTrainedDate: null },
      CARDIO: { sessions: 0, sets: 0, volumeKg: 0, lastTrainedDate: null },
    };

    sessions.forEach((s) => {
      const dateStr = new Date(s.startedAt).toISOString().split('T')[0];
      activeDaysSet.add(dateStr);

      s.exercises.forEach((se) => {
        const completedSets = se.sets.filter((set) => set.isCompleted);
        const isSkipped = completedSets.length === 0;

        if (isSkipped) {
          skippedExercisesCount++;
          const exName = se.exercise.name;
          skippedCounts[exName] = (skippedCounts[exName] || 0) + 1;
        } else {
          completedExercisesCount++;
          const muscleKey = (se.exercise.muscleGroup || 'CHEST').toUpperCase();

          if (!muscleMap[muscleKey]) {
            muscleMap[muscleKey] = { sessions: 0, sets: 0, volumeKg: 0, lastTrainedDate: null };
          }

          muscleMap[muscleKey].sessions += 1;
          muscleMap[muscleKey].sets += completedSets.length;
          muscleMap[muscleKey].lastTrainedDate = dateStr;

          const exVolume = completedSets.reduce((sum, set) => sum + (set.weightKg || 0) * (set.reps || 0), 0);
          muscleMap[muscleKey].volumeKg += exVolume;
        }
      });
    });

    const activeDaysCount = activeDaysSet.size;
    const restDaysCount = Math.max(0, 6 - activeDaysCount);

    const frequentlySkippedExercises = Object.entries(skippedCounts)
      .filter(([_, count]) => count >= 1)
      .map(([name]) => name);

    // Identify repeated & neglected muscles
    const repeatedMuscles = Object.entries(muscleMap)
      .filter(([_, data]) => data.sessions >= 2)
      .map(([muscle]) => muscle);

    const neglectedMuscles = Object.entries(muscleMap)
      .filter(([_, data]) => data.sessions === 0 || data.sets <= 3)
      .map(([muscle]) => muscle);

    console.log(`[ADAPTIVE AGENT] USER ID: ${userId}`);
    console.log(`[ADAPTIVE AGENT] HISTORY DAYS: 6 | WORKOUT SESSIONS: ${sessions.length}`);
    console.log(`[ADAPTIVE AGENT] MUSCLE GROUP ANALYSIS:`, muscleMap);
    console.log(`[ADAPTIVE AGENT] REPEATED MUSCLES: [${repeatedMuscles.join(', ')}] | NEGLECTED: [${neglectedMuscles.join(', ')}]`);

    return {
      historyDays: 6,
      totalSessionsCount: sessions.length,
      activeDaysCount,
      restDaysCount,
      completedExercisesCount,
      skippedExercisesCount,
      frequentlySkippedExercises,
      muscleGroupFrequency: muscleMap,
      repeatedMuscles,
      neglectedMuscles,
      userGoal,
      fitnessLevel,
      targetFrequencyDays,
      availableEquipment,
    };
  }

  /**
   * Generate next 6 days adaptive workout plan dynamically based on actual MySQL history
   */
  static async generate6DayAdaptivePlan(userId: string): Promise<AdaptivePlanResult> {
    const analysis = await this.getPrevious6DaysAnalysis(userId);

    // Fetch all active master exercises from database
    const dbExercises = await prisma.exercise.findMany({
      where: { isActive: true },
    });

    if (dbExercises.length === 0) {
      throw new AppError('No exercises found in database library.', 500);
    }

    const now = new Date();
    const days: DayPlan[] = [];

    // Helper to filter exercises by muscle group and available equipment
    const getExercisesForMuscles = (muscles: string[], limit: number = 3): ExerciseRecommendation[] => {
      const selected: ExerciseRecommendation[] = [];

      muscles.forEach((muscle) => {
        let matching = dbExercises.filter((e) => e.muscleGroup.toUpperCase() === muscle.toUpperCase());

        if (matching.length === 0) {
          matching = dbExercises;
        }

        // Filter out frequently skipped exercises if alternative exists
        const nonSkipped = matching.filter((e) => !analysis.frequentlySkippedExercises.includes(e.name));
        const pool = nonSkipped.length > 0 ? nonSkipped : matching;

        const ex = pool[Math.floor(Math.random() * pool.length)];

        if (ex && !selected.some((s) => s.exerciseId === ex.id)) {
          let sets = 3;
          let reps = '8-12';
          if (analysis.userGoal === 'MUSCLE_GAIN') {
            sets = 4;
            reps = '8-10';
          } else if (analysis.userGoal === 'WEIGHT_LOSS') {
            sets = 3;
            reps = '12-15';
          }

          selected.push({
            exerciseId: ex.id,
            name: ex.name,
            muscleGroup: ex.muscleGroup,
            category: ex.category,
            equipment: ex.equipment,
            targetSets: sets,
            targetReps: reps,
            restSeconds: ex.restSeconds || 60,
            instructions: ex.instructions,
            isSubstitution: analysis.frequentlySkippedExercises.includes(ex.name),
          });
        }
      });

      // Fill remaining if needed
      while (selected.length < limit && dbExercises.length > selected.length) {
        const remaining = dbExercises.filter((e) => !selected.some((s) => s.exerciseId === e.id));
        if (remaining.length === 0) break;
        const ex = remaining[0];
        selected.push({
          exerciseId: ex.id,
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          category: ex.category,
          equipment: ex.equipment,
          targetSets: 3,
          targetReps: '10',
          restSeconds: ex.restSeconds || 60,
        });
      }

      return selected.slice(0, limit);
    };

    // Determine 6-day split based on neglected muscles and recovery needs
    const neglected = [...analysis.neglectedMuscles];
    const repeated = [...analysis.repeatedMuscles];

    // Priority 1: Pick neglected muscles
    const pushMuscles = ['CHEST', 'SHOULDERS', 'TRICEPS'];
    const pullMuscles = ['BACK', 'BICEPS'];
    const legMuscles = ['QUADS', 'HAMSTRINGS', 'GLUTES'];

    // Schedule 6 Days:
    // Day 1: Primary Neglected Focus (e.g. Legs or Push)
    // Day 2: Complementary Focus (Pull or Upper Body)
    // Day 3: Rest / Active Recovery (if target frequency <= 4 days/week)
    // Day 4: Secondary Focus
    // Day 5: Full Body / Conditioning
    // Day 6: Rest / Recovery

    const targetDaysCount = analysis.targetFrequencyDays || 4;

    for (let i = 1; i <= 6; i++) {
      const dayDate = new Date(now);
      dayDate.setDate(dayDate.getDate() + (i - 1));

      const dateStr = dayDate.toISOString().split('T')[0];
      const dayName = dayDate.toLocaleDateString('en-US', { weekday: 'short' });

      let isRest = false;
      let workoutType = '';
      let targetMuscles: string[] = [];
      let reason = '';

      if (i === 3 && targetDaysCount <= 4) {
        isRest = true;
        workoutType = 'Rest & Active Recovery';
        targetMuscles = ['RECOVERY'];
        reason = `Scheduled rest day to allow muscle protein synthesis and nervous system recovery after 2 consecutive training sessions.`;
      } else if (i === 6) {
        isRest = true;
        workoutType = 'Rest & Systemic Recovery';
        targetMuscles = ['RECOVERY'];
        reason = `End-of-week recovery day. Prioritize hydration and 8+ hours of sleep before starting your next split.`;
      } else if (i === 1) {
        const focusLegs = neglected.some((m) => legMuscles.includes(m));
        if (focusLegs) {
          workoutType = 'Lower Body Strength & Hypertrophy';
          targetMuscles = ['QUADS', 'HAMSTRINGS', 'GLUTES'];
          reason = `Lower body volume was relatively low (${analysis.muscleGroupFrequency.QUADS?.sets || 0} quad sets) during your previous 6 days.`;
        } else {
          workoutType = 'Push Focus (Chest & Shoulders)';
          targetMuscles = ['CHEST', 'SHOULDERS', 'TRICEPS'];
          reason = `Chest was trained ${analysis.muscleGroupFrequency.CHEST?.sessions || 0} times recently; starting week with upper body push focus.`;
        }
      } else if (i === 2) {
        workoutType = 'Pull Focus (Back & Biceps)';
        targetMuscles = ['BACK', 'BICEPS'];
        reason = `Targeting back and biceps to maintain antagonist balance after Push/Leg focus on Day 1.`;
      } else if (i === 4) {
        workoutType = 'Legs & Core Focus';
        targetMuscles = ['QUADS', 'GLUTES', 'CORE'];
        reason = `Targeting lower body after 48 hours of recovery since upper body focus on Day 2.`;
      } else {
        workoutType = 'Upper Body Conditioning & Hypertrophy';
        targetMuscles = ['CHEST', 'BACK', 'SHOULDERS'];
        reason = `Balanced upper body volume to fulfill your ${analysis.userGoal} target frequency.`;
      }

      const dayExercises = isRest ? [] : getExercisesForMuscles(targetMuscles, 3);

      days.push({
        dayNumber: i,
        date: dateStr,
        dayName,
        workoutType,
        isRestDay: isRest,
        targetMuscleGroups: targetMuscles,
        exercises: dayExercises,
        reason,
      });
    }

    const startDate = days[0].date;
    const endDate = days[5].date;

    const result: AdaptivePlanResult = {
      generatedAt: new Date().toISOString(),
      startDate,
      endDate,
      historyWindowDays: 6,
      analysis,
      days,
    };

    // Verify user exists in User table before attempting database insertion
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      console.warn(
        `[ADAPTIVE AGENT WARNING] User ID "${userId}" does not exist in User table (system/guest execution context). Returning generated plan without saving AiRecommendation record.`
      );
      return result;
    }

    // Save to AiRecommendation in database
    const recommendation = await prisma.aiRecommendation.create({
      data: {
        userId,
        type: 'ADAPTIVE_WORKOUT_6DAY',
        title: 'Your Next 6 Days Adaptive Workout Plan',
        summary: `Adaptive 6-day plan generated based on ${analysis.totalSessionsCount} sessions over the past 6 days. Target Goal: ${analysis.userGoal}.`,
        contentJson: JSON.stringify(result),
      },
    });

    result.id = recommendation.id;
    console.log(`[ADAPTIVE AGENT] PLAN GENERATED & SAVED for User ID: ${userId} (ID: ${recommendation.id})`);

    return result;
  }

  /**
   * Fetch the latest generated adaptive recommendation for the user
   */
  static async getLatestAdaptiveRecommendation(userId: string): Promise<AdaptivePlanResult> {
    const existing = await prisma.aiRecommendation.findFirst({
      where: { userId, type: 'ADAPTIVE_WORKOUT_6DAY' },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      try {
        const parsed = JSON.parse(existing.contentJson);
        parsed.id = existing.id;
        return parsed;
      } catch (e) {
        console.warn(`[ADAPTIVE AGENT] Failed to parse contentJson for recommendation ${existing.id}`);
      }
    }

    return this.generate6DayAdaptivePlan(userId);
  }
}
