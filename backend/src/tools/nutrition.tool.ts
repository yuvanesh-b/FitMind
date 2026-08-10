import { prisma } from '../config/db';
import { NutritionService } from '../services/nutrition.service';
import { FoodService } from '../services/food.service';

export class NutritionTool {
  static async getTodayNutritionSummary(userId: string, dateStr?: string) {
    return NutritionService.getTodayMeals(userId, dateStr);
  }

  static async getUserNutritionTargets(userId: string) {
    return NutritionService.calculateNutritionTargets(userId);
  }

  static async calculateRemainingMacros(userId: string, dateStr?: string) {
    const summary = await NutritionService.getSummary(userId, dateStr);
    return {
      date: summary.date,
      consumed: {
        calories: summary.calories.consumed,
        protein: summary.protein.consumed,
        carbs: summary.carbs.consumed,
        fat: summary.fat.consumed,
        fiber: summary.fiber.consumed,
      },
      targets: {
        calories: summary.calories.target,
        protein: summary.protein.target,
        carbs: summary.carbs.target,
        fat: summary.fat.target,
        fiber: summary.fiber.target,
      },
      remainingCalories: Math.max(0, summary.calories.target - summary.calories.consumed),
      remainingProteinG: Math.max(0, Number((summary.protein.target - summary.protein.consumed).toFixed(1))),
      remainingCarbsG: Math.max(0, Number((summary.carbs.target - summary.carbs.consumed).toFixed(1))),
      remainingFatG: Math.max(0, Number((summary.fat.target - summary.fat.consumed).toFixed(1))),
      remainingFiberG: Math.max(0, Number((summary.fiber.target - summary.fiber.consumed).toFixed(1))),
    };
  }

  static async getWeeklyNutrition(userId: string) {
    return NutritionService.getWeeklyNutrition(userId);
  }

  static async getNutritionHistory(userId: string, days: number = 30) {
    return NutritionService.getNutritionHistory(userId, days);
  }

  static async getRecentMeals(userId: string, limit: number = 10) {
    return prisma.nutritionLog.findMany({
      where: { userId },
      orderBy: { loggedAt: 'desc' },
      take: limit,
    });
  }

  static async searchFoodNutrition(query: string) {
    return FoodService.searchFoods(query);
  }

  static async getFoodDetails(foodId: string) {
    return FoodService.getFoodById(foodId);
  }

  static async getFoodBenefits(foodId: string) {
    return FoodService.getFoodBenefits(foodId);
  }

  static async getFoodIngredients(foodId: string) {
    return FoodService.getFoodIngredients(foodId);
  }

  static async getRecommendedFoodsForRemainingBudget(userId: string) {
    const remaining = await NutritionTool.calculateRemainingMacros(userId);
    const foods = await FoodService.searchFoods('');
    const matching = foods
      .filter((f) => f.nutrition.calories <= (remaining.remainingCalories || 500))
      .sort((a, b) => b.nutrition.protein - a.nutrition.protein)
      .slice(0, 5);

    return {
      remaining,
      recommendedFoods: matching,
    };
  }
}
