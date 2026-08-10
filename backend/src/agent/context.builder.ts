import { ProfileTool } from '../tools/profile.tool';
import { WorkoutTool } from '../tools/workout.tool';
import { ProgressTool } from '../tools/progress.tool';
import { NutritionTool } from '../tools/nutrition.tool';
import { CalculatorTool } from '../tools/calculator.tool';
import { AdaptiveWorkoutService } from '../services/adaptive-workout.service';
import { AgentIntent } from './agent.types';

export class FitnessContextBuilder {
  static async buildUserContext(userId: string, intent?: AgentIntent): Promise<string> {
    console.log(`[CONTEXT BUILDER] Building user context for User ID: ${userId} (Intent: ${intent || 'GENERAL_FITNESS'})`);
    try {
      // 1. Always load User Profile
      const { profile, goals } = await ProfileTool.getUserProfile(userId);

      let bmr = 0;
      let tdee = 0;
      let bmiInfo = { bmi: 0, category: 'Unknown' };

      if (profile) {
        bmr = CalculatorTool.calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.gender);
        tdee = CalculatorTool.calculateTDEE(bmr, profile.workoutFrequencyDays);
        bmiInfo = CalculatorTool.calculateBMI(profile.weightKg, profile.heightCm);
      }

      const currentGoal = goals.length > 0 ? `${goals[0].category} (${goals[0].title})` : 'General Fitness';

      const profileBlock = `
--- USER FITNESS PROFILE & DATABASE CONTEXT ---
Name: ${profile?.user?.name || 'User'}
Age: ${profile?.age || 'Not specified'} | Gender: ${profile?.gender || 'PREFER_NOT_TO_SAY'}
Height: ${profile?.heightCm || 175} cm | Weight: ${profile?.weightKg || 70} kg
BMI: ${bmiInfo.bmi} (${bmiInfo.category})
BMR: ${bmr} kcal/day | Estimated TDEE: ${tdee} kcal/day
Primary Goal: ${currentGoal}
Experience Level: ${profile?.fitnessLevel || 'INTERMEDIATE'}
Target Frequency: ${profile?.workoutFrequencyDays || 4} days/week
Available Equipment: ${profile?.availableEquipment || 'FULL_GYM'}
`.trim();

      const isNutritionIntent = [
        'NUTRITION_ADVICE',
        'PROTEIN_STATUS',
        'HYDRATION_STATUS',
      ].includes(intent || '');

      const isWorkoutIntent = [
        'TODAY_WORKOUT',
        'NEXT_PLAN',
        'WORKOUT_RECOMMENDATION',
        'WORKOUT_GENERATION',
        'WORKOUT_HISTORY',
        'EXERCISE_SEARCH',
        'EXERCISE_PROGRESS',
        'EXERCISE_GUIDANCE',
        'RECOVERY_ADVICE',
      ].includes(intent || '');

      const isProgressOrReportIntent = [
        'PROGRESS_ANALYSIS',
        'WEEKLY_REPORT',
        'PROFILE_DETAILS',
      ].includes(intent || '');

      let nutritionBlock = '';
      let workoutBlock = '';
      let progressBlock = '';

      // 2. Fetch Nutrition Context if intent is nutrition or report/progress
      if (isNutritionIntent || isProgressOrReportIntent || !intent) {
        const todaySummary = await NutritionTool.getTodayNutritionSummary(userId);
        const remainingMacros = await NutritionTool.calculateRemainingMacros(userId);
        const weeklyNutrition = await NutritionTool.getWeeklyNutrition(userId);

        const foodsListStr = (todaySummary.logs || [])
          .map(
            (log: any) =>
              `- [${log.mealType || 'Snack'}] ${log.foodName}: ${log.quantity} (${log.calories} kcal, ${log.proteinG}g P, ${log.carbsG}g C, ${log.fatG}g F, ${log.fiberG || 0}g Fiber) at ${log.mealTime || 'today'}`
          )
          .join('\n');

        const mealBreakdownStr = Object.entries(todaySummary.meals || {})
          .map(([meal, logs]: [string, any]) => `${meal.toUpperCase()}: ${logs.length} item(s) logged`)
          .join(', ');

        nutritionBlock = `
--- TODAY NUTRITION LOGS & CONSUMPTION ---
Logged Foods Today (${todaySummary.logs?.length || 0} items):
${foodsListStr || 'No food items logged for today yet.'}

Meal Breakdown: ${mealBreakdownStr}

Today Consumed Totals:
Calories: ${todaySummary.totalCalories} kcal | Protein: ${todaySummary.totalProtein}g | Carbs: ${todaySummary.totalCarbs}g | Fat: ${todaySummary.totalFat}g | Fiber: ${todaySummary.totalFiber}g

Daily Nutrition Targets & Remaining Budget:
Calories Target: ${remainingMacros.targets.calories} kcal | Remaining: ${remainingMacros.remainingCalories} kcal
Protein Target: ${remainingMacros.targets.protein}g | Remaining: ${remainingMacros.remainingProteinG}g
Carbs Target: ${remainingMacros.targets.carbs}g | Remaining: ${remainingMacros.remainingCarbsG}g
Fat Target: ${remainingMacros.targets.fat}g | Remaining: ${remainingMacros.remainingFatG}g
Fiber Target: ${remainingMacros.targets.fiber}g | Remaining: ${remainingMacros.remainingFiberG}g

--- 7-DAY NUTRITION HISTORY & TRENDS ---
7-Day Average Calories: ${weeklyNutrition.averageCalories} kcal/day
7-Day Average Protein: ${weeklyNutrition.averageProtein} g/day
7-Day Average Carbs: ${weeklyNutrition.averageCarbs} g/day
7-Day Average Fat: ${weeklyNutrition.averageFat} g/day
Highest Calorie Day: ${weeklyNutrition.highestCalorieDay.dayName} (${weeklyNutrition.highestCalorieDay.date}) - ${weeklyNutrition.highestCalorieDay.calories} kcal
Lowest Calorie Day: ${weeklyNutrition.lowestCalorieDay.dayName} (${weeklyNutrition.lowestCalorieDay.date}) - ${weeklyNutrition.lowestCalorieDay.calories} kcal
`.trim();
      }

      // 3. Fetch Adaptive Workout Context if intent is workout or report/progress
      if (isWorkoutIntent || isProgressOrReportIntent || !intent) {
        const adaptiveAnalysis = await AdaptiveWorkoutService.getPrevious6DaysAnalysis(userId);
        const adaptivePlan = await AdaptiveWorkoutService.getLatestAdaptiveRecommendation(userId);

        const muscleFreqStr = Object.entries(adaptiveAnalysis.muscleGroupFrequency)
          .map(
            ([m, d]) =>
              `- ${m}: ${d.sessions} session(s), ${d.sets} completed set(s), ${d.volumeKg}kg volume (Last: ${d.lastTrainedDate || 'Not trained in 6 days'})`
          )
          .join('\n');

        const adaptiveDaysStr = adaptivePlan.days
          .map(
            (d) =>
              `Day ${d.dayNumber} (${d.date} - ${d.dayName}): ${d.workoutType} ${d.isRestDay ? '[REST]' : ''}\n  Target Muscles: ${d.targetMuscleGroups.join(', ')}\n  Exercises: ${d.exercises.map((e) => `${e.name} (${e.targetSets} sets x ${e.targetReps})`).join(', ') || 'Rest'}\n  Reason: ${d.reason}`
          )
          .join('\n\n');

        workoutBlock = `
--- PREVIOUS 6 DAYS WORKOUT ANALYSIS ---
Sessions Logged (Last 6 Days): ${adaptiveAnalysis.totalSessionsCount}
Active Workout Days: ${adaptiveAnalysis.activeDaysCount} | Rest Days: ${adaptiveAnalysis.restDaysCount}
Completed Exercises: ${adaptiveAnalysis.completedExercisesCount} | Skipped Exercises: ${adaptiveAnalysis.skippedExercisesCount}
Frequently Skipped: ${adaptiveAnalysis.frequentlySkippedExercises.join(', ') || 'None'}
Repeated Muscles (>=2 sessions): ${adaptiveAnalysis.repeatedMuscles.join(', ') || 'None'}
Neglected Muscles (0-1 sessions): ${adaptiveAnalysis.neglectedMuscles.join(', ') || 'None'}

Muscle Group Frequency Breakdown:
${muscleFreqStr}

--- ADAPTIVE NEXT 6 DAYS WORKOUT PLAN (STRUCTURED CALCULATION) ---
${adaptiveDaysStr}
`.trim();
      }

      // 4. Fetch Progress Context if intent is progress/report
      if (isProgressOrReportIntent) {
        const measurements = await ProgressTool.getBodyMeasurements(userId, 2);
        const measureStr = measurements
          .map(
            (m) =>
              `- ${new Date(m.recordedAt).toLocaleDateString()}: ${m.weightKg} kg (Body Fat: ${m.bodyFatPercentage || 'N/A'}%)`
          )
          .join('\n');

        progressBlock = `
--- BODY MEASUREMENT TRENDS ---
${measureStr || 'No recent body measurements logged.'}
`.trim();
      }

      const fullContext = [profileBlock, nutritionBlock, workoutBlock, progressBlock]
        .filter(Boolean)
        .join('\n\n');

      console.log(`[CONTEXT BUILDER] Successfully built scoped user context for User ID: ${userId} (${fullContext.length} chars)`);
      return fullContext;
    } catch (error: any) {
      console.error('[CONTEXT BUILDER ERROR]:', error?.message || error);
      return `--- USER FITNESS PROFILE & DATABASE CONTEXT ---\nUser ID: ${userId}\nUnable to load full profile context at this moment.`;
    }
  }
}
