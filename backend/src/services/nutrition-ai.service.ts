import axios from 'axios';
import { ENV } from '../config/env';
import { prisma } from '../config/db';
import { NutritionService } from './nutrition.service';
import { HydrationService } from './hydration.service';

export class NutritionAiService {
  static async generateNutritionInsight(userId: string) {
    try {
      // 1. Fetch comprehensive user context
      const [summary, todayData, hydration, userProfile, goals, foods] = await Promise.all([
        NutritionService.getSummary(userId),
        NutritionService.getTodayMeals(userId),
        HydrationService.getTodayWater(userId),
        prisma.userProfile.findUnique({ where: { userId } }),
        prisma.fitnessGoal.findMany({ where: { userId } }),
        prisma.food.findMany({ take: 10 }),
      ]);

      const goalTitle = goals.length > 0 ? goals[0].title : 'Muscle Gain & Fitness';
      const goalCategory = goals.length > 0 ? goals[0].category : 'MUSCLE_GAIN';

      const remainingCalories = Math.max(0, summary.calories.target - summary.calories.consumed);
      const remainingProtein = Math.max(0, summary.protein.target - summary.protein.consumed);
      const remainingCarbs = Math.max(0, summary.carbs.target - summary.carbs.consumed);
      const remainingFat = Math.max(0, summary.fat.target - summary.fat.consumed);

      const mealNames = todayData.logs.map((m: any) => `${m.mealType}: ${m.foodName} (${m.calories} kcal, ${m.proteinG}g P, ${m.carbsG}g C, ${m.fatG}g F, ${m.fiberG}g Fiber)`).join('; ');

      const topMicros = summary.micronutrients.slice(0, 6).map((m: any) => `${m.name}: ${m.amount}${m.unit} (${m.percentage}%)`).join(', ');

      const availableFoods = foods.map((f) => `${f.name} (100${f.servingUnit} = ${f.calories}kcal, ${f.protein}g P, ${f.carbohydrates}g C, ${f.fat}g F)`).join('; ');

      const promptContext = {
        goal: `${goalCategory} (${goalTitle})`,
        weightKg: userProfile?.weightKg || 70,
        heightCm: userProfile?.heightCm || 175,
        caloriesConsumed: summary.calories.consumed,
        caloriesTarget: summary.calories.target,
        remainingCalories,
        proteinConsumed: summary.protein.consumed,
        proteinTarget: summary.protein.target,
        remainingProtein,
        carbsConsumed: summary.carbs.consumed,
        carbsTarget: summary.carbs.target,
        remainingCarbs,
        fatConsumed: summary.fat.consumed,
        fatTarget: summary.fat.target,
        remainingFat,
        fiberConsumed: summary.fiber.consumed,
        fiberTarget: summary.fiber.target,
        sugarConsumed: summary.sugar.consumed,
        sodiumConsumed: summary.sodium.consumed,
        waterConsumedLiters: hydration.consumedLiters,
        waterTargetLiters: hydration.targetLiters,
        loggedMeals: mealNames || 'No meals logged yet today',
        topMicros,
        availableDatabaseFoods: availableFoods,
      };

      if (!ENV.GROQ_API_KEY) {
        return {
          available: false,
          insight: 'AI insights are temporarily unavailable (Groq API Key not configured). Your nutrition tracking is working normally.',
          actionableSuggestion: 'Prioritize balanced whole foods containing high protein and complex carbs.',
          foodRecommendations: [],
        };
      }

      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: ENV.GROQ_MODEL || 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content:
                'You are FitMind AI, an elite sports nutritionist. Analyze real logged intake (Calories, Protein, Carbs, Fat, Fiber, Sugar, Sodium, Micronutrients) and remaining macro budget. Identify key patterns (e.g. low protein, good fiber) and suggest 1-2 real food items from the user\'s database that fit their remaining macro budget. Keep response under 3 concise sentences. Do NOT invent nutrition numbers.',
            },
            {
              role: 'user',
              content: `User Nutrition Intake Today:
- Goal: ${promptContext.goal}
- Calories: ${promptContext.caloriesConsumed} / ${promptContext.caloriesTarget} kcal (Remaining: ${promptContext.remainingCalories} kcal)
- Protein: ${promptContext.proteinConsumed} / ${promptContext.proteinTarget} g (Remaining: ${promptContext.remainingProtein} g)
- Carbs: ${promptContext.carbsConsumed} / ${promptContext.carbsTarget} g
- Fat: ${promptContext.fatConsumed} / ${promptContext.fatTarget} g
- Fiber: ${promptContext.fiberConsumed} / ${promptContext.fiberTarget} g
- Sugar: ${promptContext.sugarConsumed} g | Sodium: ${promptContext.sodiumConsumed} mg
- Key Micronutrients Logged: ${promptContext.topMicros}
- Logged Meals Today: ${promptContext.loggedMeals}
- Available Database Foods: ${promptContext.availableDatabaseFoods}

Analyze today\'s intake and recommend appropriate real food items to reach remaining macro targets.`,
            },
          ],
          temperature: 0.6,
          max_tokens: 280,
        },
        {
          headers: {
            Authorization: `Bearer ${ENV.GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      const aiText = response.data?.choices?.[0]?.message?.content?.trim();

      return {
        available: true,
        insight: aiText || 'Maintain your macro balance by aiming for high-protein foods and adequate hydration.',
        actionableSuggestion: summary.protein.percentage < 70
          ? `You have ${remainingProtein}g protein remaining. Consider Chicken Breast or Greek Yogurt.`
          : 'Great progress on hitting your daily targets!',
      };
    } catch (error: any) {
      console.error('[NutritionAiService Error]:', error?.response?.data || error.message);
      return {
        available: false,
        insight: 'AI insights are temporarily unavailable. Your nutrition tracking is still working normally.',
        actionableSuggestion: 'Continue logging meals to track your calorie and macro intake.',
      };
    }
  }
}
