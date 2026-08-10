import { prisma } from '../config/db';
import { CalculatorTool } from '../tools/calculator.tool';
import { AppError } from '../utils/errors';

export interface CreateFoodLogInput {
  foodId?: string;
  foodName?: string;
  quantity: number | string;
  unit?: string;
  meal?: string;
  mealType?: string;
  consumedAt?: string | Date;
  loggedAt?: string | Date;
  mealTime?: string;
  calories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
}

export class NutritionService {
  /**
   * Helper to parse numerical quantity multiplier from user input
   */
  private static calculateQuantityMultiplier(
    quantityInput: any,
    unitInput: string = 'g',
    baseServingSize: number = 100
  ): { multiplier: number; quantityNum: number; formattedUnit: string } {
    let quantityNum = 100;
    let formattedUnit = unitInput || 'g';

    if (typeof quantityInput === 'number') {
      quantityNum = quantityInput;
    } else if (typeof quantityInput === 'string') {
      const match = quantityInput.match(/([\d.]+)/);
      if (match) quantityNum = parseFloat(match[1]) || 100;
      if (quantityInput.toLowerCase().includes('g')) formattedUnit = 'g';
      else if (quantityInput.toLowerCase().includes('ml')) formattedUnit = 'ml';
    }

    if (isNaN(quantityNum) || quantityNum <= 0) quantityNum = 100;

    let multiplier = 1.0;
    const unitLower = formattedUnit.toLowerCase();
    if (unitLower === 'g' || unitLower === 'ml' || unitLower.includes('gram')) {
      multiplier = quantityNum / (baseServingSize || 100);
    } else {
      multiplier = quantityNum;
    }

    return { multiplier, quantityNum, formattedUnit };
  }

  /**
   * Validate meal category enum values (BREAKFAST, LUNCH, SNACK, DINNER)
   */
  private static validateMeal(mealInput?: string): string {
    const mealRaw = (mealInput || 'SNACK').trim().toUpperCase();
    const validMeals = ['BREAKFAST', 'LUNCH', 'SNACK', 'DINNER'];
    if (!validMeals.includes(mealRaw)) {
      throw new AppError(`Invalid meal "${mealInput}". Allowed meals are: BREAKFAST, LUNCH, SNACK, DINNER.`, 400);
    }
    if (mealRaw === 'BREAKFAST') return 'Breakfast';
    if (mealRaw === 'LUNCH') return 'Lunch';
    if (mealRaw === 'DINNER') return 'Dinner';
    return 'Snack';
  }

  /**
   * Helper to calculate target vs consumed vs remaining vs overTarget
   */
  private static calcMacroSummary(consumed: number, target: number) {
    const remaining = Math.max(0, Number((target - consumed).toFixed(1)));
    const overTarget = Math.max(0, Number((consumed - target).toFixed(1)));
    const percentage = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;
    return {
      consumed,
      target,
      remaining,
      overTarget,
      percentage,
    };
  }

  /**
   * Calculate profile-based calorie and macro targets from database models
   */
  static async calculateNutritionTargets(userId: string) {
    const profile = await prisma.userProfile.findUnique({ where: { userId } });
    const goals = await prisma.fitnessGoal.findMany({ where: { userId } });

    let targetCalories = 2400;
    let proteinG = 150;
    let carbsG = 260;
    let fatG = 70;

    if (profile) {
      const bmr = CalculatorTool.calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.gender);
      const tdee = CalculatorTool.calculateTDEE(bmr, profile.workoutFrequencyDays || 4);
      const goalCategory = goals.length > 0 ? goals[0].category : 'MUSCLE_GAIN';
      const calc = CalculatorTool.calculateCalorieTarget(tdee, goalCategory, profile.weightKg);

      targetCalories = calc.targetCalories;
      proteinG = calc.proteinG;
      carbsG = calc.carbsG;
      fatG = calc.fatG;
    }

    return {
      targetCalories,
      proteinG,
      carbsG,
      fatG,
      fiberG: 30,
      sugarG: 36,
      sodiumMg: 2300,
    };
  }

  /**
   * Get accurate daily nutrition calculations aggregated directly from FoodLog records
   */
  static async getDailyNutrition(userId: string, dateStr?: string) {
    const todayStr = dateStr ? dateStr.trim() : new Date().toISOString().split('T')[0];

    const dateParts = todayStr.split('-').map(Number);
    let startOfDay: Date;
    let endOfDay: Date;

    if (dateParts.length === 3 && !isNaN(dateParts[0]) && !isNaN(dateParts[1]) && !isNaN(dateParts[2])) {
      startOfDay = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 0, 0, 0, 0);
      endOfDay = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], 23, 59, 59, 999);
    } else {
      const d = new Date();
      startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
    }

    const logs = await prisma.nutritionLog.findMany({
      where: {
        userId,
        loggedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        items: {
          include: {
            food: true,
          },
        },
      },
      orderBy: { loggedAt: 'asc' },
    });

    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    };

    const mealBreakdown: Record<string, { calories: number; protein: number; carbs: number; fat: number; fiber: number; foods: any[] }> = {
      breakfast: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, foods: [] },
      lunch: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, foods: [] },
      snack: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, foods: [] },
      dinner: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, foods: [] },
    };

    const foodsList = logs.map((log) => {
      let parsedMicros = [];
      if (log.micronutrientsJson) {
        try {
          parsedMicros = JSON.parse(log.micronutrientsJson);
        } catch (e) {}
      }

      const foodItem = {
        id: log.id,
        userId: log.userId,
        foodName: log.foodName,
        quantity: log.quantity,
        meal: log.mealType,
        mealType: log.mealType,
        mealTime: log.mealTime,
        calories: log.calories,
        protein: log.proteinG,
        carbs: log.carbsG,
        fat: log.fatG,
        fiber: log.fiberG,
        consumedAt: log.loggedAt,
        createdAt: log.createdAt,
        updatedAt: log.updatedAt,
        items: log.items,
        micronutrients: parsedMicros,
      };

      totals.calories += log.calories;
      totals.protein = Number((totals.protein + log.proteinG).toFixed(1));
      totals.carbs = Number((totals.carbs + log.carbsG).toFixed(1));
      totals.fat = Number((totals.fat + log.fatG).toFixed(1));
      totals.fiber = Number((totals.fiber + log.fiberG).toFixed(1));

      const key = (log.mealType || 'snack').toLowerCase();
      const targetMeal = mealBreakdown[key] || mealBreakdown.snack;
      targetMeal.calories += log.calories;
      targetMeal.protein = Number((targetMeal.protein + log.proteinG).toFixed(1));
      targetMeal.carbs = Number((targetMeal.carbs + log.carbsG).toFixed(1));
      targetMeal.fat = Number((targetMeal.fat + log.fatG).toFixed(1));
      targetMeal.fiber = Number((targetMeal.fiber + log.fiberG).toFixed(1));
      targetMeal.foods.push(foodItem);

      return foodItem;
    });

    return {
      date: todayStr,
      foodCount: foodsList.length,
      totals,
      mealBreakdown,
      foods: foodsList,
    };
  }

  /**
   * Get 7-day nutrition analytics calculated directly from FoodLog data
   */
  static async getWeeklyNutrition(userId: string) {
    const days: Array<{
      date: string;
      dayName: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    }> = [];

    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);

      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dailyData = await NutritionService.getDailyNutrition(userId, dateStr);

      days.push({
        date: dateStr,
        dayName,
        calories: dailyData.totals.calories || 0,
        protein: dailyData.totals.protein || 0,
        carbs: dailyData.totals.carbs || 0,
        fat: dailyData.totals.fat || 0,
        fiber: dailyData.totals.fiber || 0,
      });
    }

    let highestCalorieDay = days[0];
    let lowestCalorieDay = days[0];

    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;

    for (const d of days) {
      totalCalories += d.calories;
      totalProtein = Number((totalProtein + d.protein).toFixed(1));
      totalCarbs = Number((totalCarbs + d.carbs).toFixed(1));
      totalFat = Number((totalFat + d.fat).toFixed(1));
      totalFiber = Number((totalFiber + d.fiber).toFixed(1));

      if (d.calories > highestCalorieDay.calories) {
        highestCalorieDay = d;
      }
      if (d.calories < lowestCalorieDay.calories) {
        lowestCalorieDay = d;
      }
    }

    const averageCalories = Math.round(totalCalories / 7);
    const averageProtein = Number((totalProtein / 7).toFixed(1));
    const averageCarbs = Number((totalCarbs / 7).toFixed(1));
    const averageFat = Number((totalFat / 7).toFixed(1));
    const averageFiber = Number((totalFiber / 7).toFixed(1));

    return {
      days,
      averageCalories,
      averageProtein,
      averageCarbs,
      averageFat,
      averageFiber,
      highestCalorieDay: {
        date: highestCalorieDay.date,
        dayName: highestCalorieDay.dayName,
        calories: highestCalorieDay.calories,
      },
      lowestCalorieDay: {
        date: lowestCalorieDay.date,
        dayName: lowestCalorieDay.dayName,
        calories: lowestCalorieDay.calories,
      },
      totalCalories,
      totalProtein,
    };
  }

  /**
   * Create a new FoodLog connected to master NutritionFood
   */
  static async createFoodLog(userId: string, data: CreateFoodLogInput) {
    const mealType = this.validateMeal(data.meal || data.mealType);
    const logDate = data.consumedAt ? new Date(data.consumedAt) : data.loggedAt ? new Date(data.loggedAt) : new Date();

    let foodName = (data.foodName || '').trim();
    let calcCalories = 0;
    let calcProtein = 0;
    let calcCarbs = 0;
    let calcFat = 0;
    let calcFiber = 0;
    let calcSugar = 0;
    let calcSatFat = 0;
    let calcSodium = 0;
    let micronutrientsArray: any[] = [];
    let quantityStr = '100g';

    if (data.foodId) {
      const food = await prisma.food.findUnique({
        where: { id: data.foodId },
        include: { foodNutrients: { include: { nutrient: true } } },
      });

      if (!food) {
        throw new AppError('Master nutrition food item not found.', 404);
      }

      foodName = food.name;
      const { multiplier, quantityNum, formattedUnit } = this.calculateQuantityMultiplier(
        data.quantity,
        data.unit || food.servingUnit,
        food.servingSize
      );

      quantityStr = `${quantityNum}${formattedUnit}`;
      calcCalories = Math.round(food.calories * multiplier);
      calcProtein = Number((food.protein * multiplier).toFixed(1));
      calcCarbs = Number((food.carbohydrates * multiplier).toFixed(1));
      calcFat = Number((food.fat * multiplier).toFixed(1));
      calcFiber = Number(((food.fiber || 0) * multiplier).toFixed(1));
      calcSugar = Number(((food.sugar || 0) * multiplier).toFixed(1));
      calcSatFat = Number(((food.saturatedFat || 0) * multiplier).toFixed(1));
      calcSodium = Number(((food.sodium || 0) * multiplier).toFixed(1));

      micronutrientsArray = (food.foodNutrients || []).map((fn) => ({
        name: fn.nutrient.name,
        amount: Number((fn.amount * multiplier).toFixed(1)),
        unit: fn.nutrient.unit,
      }));
    } else {
      if (!foodName) {
        throw new AppError('Food name is required.', 400);
      }
      quantityStr = typeof data.quantity === 'string' ? data.quantity : `${data.quantity || 100}${data.unit || 'g'}`;
      calcCalories = Math.max(0, Number(data.calories) || 0);
      calcProtein = Math.max(0, Number(data.proteinG) || 0);
      calcCarbs = Math.max(0, Number(data.carbsG) || 0);
      calcFat = Math.max(0, Number(data.fatG) || 0);
      calcFiber = Math.max(0, Number(data.fiberG) || 0);
    }

    const formattedTime = data.mealTime || logDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const log = await prisma.nutritionLog.create({
      data: {
        userId,
        mealType,
        mealTime: formattedTime,
        foodName,
        quantity: quantityStr,
        calories: calcCalories,
        proteinG: calcProtein,
        carbsG: calcCarbs,
        fatG: calcFat,
        fiberG: calcFiber,
        sugarG: calcSugar,
        saturatedFatG: calcSatFat,
        sodiumMg: calcSodium,
        micronutrientsJson: JSON.stringify(micronutrientsArray),
        loggedAt: logDate,
      },
    });

    if (data.foodId) {
      await prisma.nutritionLogItem.create({
        data: {
          nutritionLogId: log.id,
          foodId: data.foodId,
          foodName,
          quantity: 1,
          unit: quantityStr,
          calories: calcCalories,
          protein: calcProtein,
          carbs: calcCarbs,
          fat: calcFat,
        },
      });
    }

    return {
      id: log.id,
      userId: log.userId,
      foodId: data.foodId || null,
      foodName: log.foodName,
      quantity: log.quantity,
      unit: data.unit || 'g',
      meal: log.mealType,
      mealType: log.mealType,
      mealTime: log.mealTime,
      calories: log.calories,
      protein: log.proteinG,
      carbs: log.carbsG,
      fat: log.fatG,
      fiber: log.fiberG,
      consumedAt: log.loggedAt,
      loggedAt: log.loggedAt,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt,
      micronutrients: micronutrientsArray,
    };
  }

  static async getLogsByDate(userId: string, dateStr?: string) {
    const dailyData = await this.getDailyNutrition(userId, dateStr);
    return dailyData.foods;
  }

  static async updateMeal(userId: string, id: string, data: any) {
    const existing = await prisma.nutritionLog.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new AppError('Food log item not found or unauthorized access.', 404);
    }

    const mealType = data.meal || data.mealType ? this.validateMeal(data.meal || data.mealType) : existing.mealType;
    const logDate = data.consumedAt ? new Date(data.consumedAt) : existing.loggedAt;

    return prisma.nutritionLog.update({
      where: { id },
      data: {
        mealType,
        mealTime: data.mealTime || existing.mealTime,
        foodName: data.foodName || existing.foodName,
        quantity: data.quantity || existing.quantity,
        calories: data.calories !== undefined ? Math.max(0, Number(data.calories)) : existing.calories,
        proteinG: data.proteinG !== undefined ? Math.max(0, Number(data.proteinG)) : existing.proteinG,
        carbsG: data.carbsG !== undefined ? Math.max(0, Number(data.carbsG)) : existing.carbsG,
        fatG: data.fatG !== undefined ? Math.max(0, Number(data.fatG)) : existing.fatG,
        fiberG: data.fiberG !== undefined ? Math.max(0, Number(data.fiberG)) : existing.fiberG,
        loggedAt: logDate,
      },
    });
  }

  static async deleteMeal(userId: string, id: string) {
    const existing = await prisma.nutritionLog.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new AppError('Food log item not found or unauthorized access.', 404);
    }

    await prisma.nutritionLog.delete({
      where: { id },
    });
    return { success: true, message: 'Food log item deleted successfully.' };
  }

  static async getSummary(userId: string, dateStr?: string) {
    const targets = await NutritionService.calculateNutritionTargets(userId);
    const dailyData = await NutritionService.getDailyNutrition(userId, dateStr);

    const consumedCalories = dailyData.totals.calories;
    const consumedProtein = dailyData.totals.protein;
    const consumedCarbs = dailyData.totals.carbs;
    const consumedFat = dailyData.totals.fat;
    const consumedFiber = dailyData.totals.fiber;

    return {
      date: dailyData.date,
      calories: this.calcMacroSummary(consumedCalories, targets.targetCalories),
      protein: this.calcMacroSummary(consumedProtein, targets.proteinG),
      carbs: this.calcMacroSummary(consumedCarbs, targets.carbsG),
      fat: this.calcMacroSummary(consumedFat, targets.fatG),
      fiber: this.calcMacroSummary(consumedFiber, targets.fiberG),
      sugar: this.calcMacroSummary(0, targets.sugarG),
      sodium: this.calcMacroSummary(0, targets.sodiumMg),
      micronutrients: [],
    };
  }

  static async getTodayMeals(userId: string, dateStr?: string) {
    const dailyData = await NutritionService.getDailyNutrition(userId, dateStr);
    const targets = await NutritionService.calculateNutritionTargets(userId);

    return {
      date: dailyData.date,
      totalCalories: dailyData.totals.calories,
      totalProtein: dailyData.totals.protein,
      totalCarbs: dailyData.totals.carbs,
      totalFat: dailyData.totals.fat,
      totalFiber: dailyData.totals.fiber,
      totals: {
        calories: dailyData.totals.calories,
        protein: dailyData.totals.protein,
        carbohydrates: dailyData.totals.carbs,
        fat: dailyData.totals.fat,
        fiber: dailyData.totals.fiber,
      },
      remaining: {
        calories: Math.max(0, targets.targetCalories - dailyData.totals.calories),
        protein: Math.max(0, Number((targets.proteinG - dailyData.totals.protein).toFixed(1))),
        carbohydrates: Math.max(0, Number((targets.carbsG - dailyData.totals.carbs).toFixed(1))),
        fat: Math.max(0, Number((targets.fatG - dailyData.totals.fat).toFixed(1))),
        fiber: Math.max(0, Number((targets.fiberG - dailyData.totals.fiber).toFixed(1))),
      },
      overTarget: {
        calories: Math.max(0, dailyData.totals.calories - targets.targetCalories),
        protein: Math.max(0, Number((dailyData.totals.protein - targets.proteinG).toFixed(1))),
        carbohydrates: Math.max(0, Number((dailyData.totals.carbs - targets.carbsG).toFixed(1))),
        fat: Math.max(0, Number((dailyData.totals.fat - targets.fatG).toFixed(1))),
        fiber: Math.max(0, Number((dailyData.totals.fiber - targets.fiberG).toFixed(1))),
      },
      meals: dailyData.mealBreakdown,
      logs: dailyData.foods,
    };
  }

  static async getNutritionHistory(userId: string, daysCount: number = 30) {
    const validDays = [7, 30, 90].includes(Number(daysCount)) ? Number(daysCount) : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - validDays);
    startDate.setHours(0, 0, 0, 0);

    const logs = await prisma.nutritionLog.findMany({
      where: {
        userId,
        loggedAt: {
          gte: startDate,
        },
      },
      orderBy: { loggedAt: 'asc' },
    });

    const targets = await NutritionService.calculateNutritionTargets(userId);

    const groupedByDate: Record<string, { calories: number; protein: number; carbs: number; fat: number; fiber: number }> = {};
    for (const log of logs) {
      const dateKey = new Date(log.loggedAt).toISOString().split('T')[0];
      if (!groupedByDate[dateKey]) {
        groupedByDate[dateKey] = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
      }
      groupedByDate[dateKey].calories += log.calories;
      groupedByDate[dateKey].protein += log.proteinG;
      groupedByDate[dateKey].carbs += log.carbsG;
      groupedByDate[dateKey].fat += log.fatG;
      groupedByDate[dateKey].fiber += log.fiberG;
    }

    const trackedDays = Object.keys(groupedByDate).length || 1;
    const totalCal = Object.values(groupedByDate).reduce((s, d) => s + d.calories, 0);
    const avgCalories = Math.round(totalCal / trackedDays);
    const completionRate = Math.min(100, Math.round((avgCalories / targets.targetCalories) * 100));

    return {
      days: validDays,
      trackedDaysCount: trackedDays,
      averageCalories: avgCalories,
      goalCompletionPercentage: completionRate,
    };
  }

  static async logMeal(userId: string, data: any) {
    return this.createFoodLog(userId, data);
  }
}
