import { prisma } from '../config/db';
import { AppError } from '../utils/errors';

export interface CreateFoodInput {
  name: string;
  category?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  protein: number;
  carbs?: number;
  carbohydrates?: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  saturatedFat?: number;
  sodium?: number;
  ingredients?: Array<{ name: string; amount?: number; unit?: string }>;
  benefits?: string[];
}

export interface UpdateFoodInput extends Partial<CreateFoodInput> {}

export class FoodService {
  private static formatFood(food: any) {
    return {
      id: food.id,
      name: food.name,
      category: food.category,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      nutrition: {
        calories: food.calories,
        protein: Number(food.protein),
        carbs: Number(food.carbohydrates),
        fat: Number(food.fat),
        fiber: Number(food.fiber || 0),
        sugar: Number(food.sugar || 0),
        saturatedFat: Number(food.saturatedFat || 0),
        sodium: Number(food.sodium || 0),
      },
      ingredients: (food.ingredients || []).map((i: any) => ({
        id: i.id,
        name: i.name,
        amount: i.amount,
        unit: i.unit,
      })),
      benefits: (food.benefits || []).map((b: any) => b.benefit),
      nutrients: (food.foodNutrients || []).map((fn: any) => ({
        name: fn.nutrient?.name || '',
        amount: fn.amount,
        unit: fn.nutrient?.unit || 'mg',
        category: fn.nutrient?.category || 'Micronutrient',
      })),
      createdAt: food.createdAt,
      updatedAt: food.updatedAt,
    };
  }

  static async getAllFoods(params?: { search?: string; category?: string }) {
    const searchTerm = (params?.search || '').trim();
    const categoryTerm = (params?.category || '').trim();

    const whereConditions: any = {};

    if (searchTerm) {
      whereConditions.OR = [
        { name: { contains: searchTerm } },
        { category: { contains: searchTerm } },
      ];
    }

    if (categoryTerm && categoryTerm.toUpperCase() !== 'ALL') {
      whereConditions.category = { contains: categoryTerm };
    }

    const foods = await prisma.food.findMany({
      where: whereConditions,
      include: {
        ingredients: { orderBy: { sortOrder: 'asc' } },
        benefits: { orderBy: { sortOrder: 'asc' } },
        foodNutrients: {
          include: {
            nutrient: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return foods.map(FoodService.formatFood);
  }

  static async searchFoods(query: string) {
    return this.getAllFoods({ search: query });
  }

  static async getFoodById(id: string) {
    const food = await prisma.food.findUnique({
      where: { id },
      include: {
        ingredients: { orderBy: { sortOrder: 'asc' } },
        benefits: { orderBy: { sortOrder: 'asc' } },
        foodNutrients: {
          include: {
            nutrient: true,
          },
        },
      },
    });

    if (!food) {
      throw new AppError('Nutrition food item not found.', 404);
    }

    return FoodService.formatFood(food);
  }

  static async createFood(data: CreateFoodInput) {
    // Validation
    const name = (data.name || '').trim();
    if (!name) {
      throw new AppError('Food name is required.', 400);
    }

    const servingSize = Number(data.servingSize);
    if (isNaN(servingSize) || servingSize <= 0) {
      throw new AppError('Serving size must be a number greater than 0.', 400);
    }

    const servingUnit = (data.servingUnit || '').trim();
    if (!servingUnit) {
      throw new AppError('Serving unit is required.', 400);
    }

    const calories = Number(data.calories);
    const protein = Number(data.protein);
    const carbs = Number(data.carbs ?? data.carbohydrates ?? 0);
    const fat = Number(data.fat);
    const fiber = Number(data.fiber ?? 0);

    if (isNaN(calories) || calories < 0) throw new AppError('Calories must be >= 0.', 400);
    if (isNaN(protein) || protein < 0) throw new AppError('Protein must be >= 0.', 400);
    if (isNaN(carbs) || carbs < 0) throw new AppError('Carbs must be >= 0.', 400);
    if (isNaN(fat) || fat < 0) throw new AppError('Fat must be >= 0.', 400);
    if (isNaN(fiber) || fiber < 0) throw new AppError('Fiber must be >= 0.', 400);

    // Duplicate Protection
    const existing = await prisma.food.findFirst({
      where: { name: { equals: name } },
    });

    if (existing) {
      throw new AppError(`A food item named "${name}" already exists in the master database.`, 400);
    }

    const created = await prisma.food.create({
      data: {
        name,
        category: (data.category || 'General').trim(),
        servingSize,
        servingUnit,
        calories: Math.round(calories),
        protein,
        carbohydrates: carbs,
        fat,
        fiber,
        sugar: Number(data.sugar || 0),
        saturatedFat: Number(data.saturatedFat || 0),
        sodium: Number(data.sodium || 0),
      },
      include: {
        ingredients: true,
        benefits: true,
        foodNutrients: { include: { nutrient: true } },
      },
    });

    return FoodService.formatFood(created);
  }

  static async updateFood(id: string, data: UpdateFoodInput) {
    const existing = await prisma.food.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Nutrition food item not found.', 404);
    }

    if (data.name) {
      const nameTrimmed = data.name.trim();
      const duplicate = await prisma.food.findFirst({
        where: {
          name: { equals: nameTrimmed },
          id: { not: id },
        },
      });
      if (duplicate) {
        throw new AppError(`A food item named "${nameTrimmed}" already exists.`, 400);
      }
    }

    const updated = await prisma.food.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name.trim() : undefined,
        category: data.category !== undefined ? data.category.trim() : undefined,
        servingSize: data.servingSize !== undefined ? Number(data.servingSize) : undefined,
        servingUnit: data.servingUnit !== undefined ? data.servingUnit.trim() : undefined,
        calories: data.calories !== undefined ? Math.round(Number(data.calories)) : undefined,
        protein: data.protein !== undefined ? Number(data.protein) : undefined,
        carbohydrates: (data.carbs ?? data.carbohydrates) !== undefined ? Number(data.carbs ?? data.carbohydrates) : undefined,
        fat: data.fat !== undefined ? Number(data.fat) : undefined,
        fiber: data.fiber !== undefined ? Number(data.fiber) : undefined,
        sugar: data.sugar !== undefined ? Number(data.sugar) : undefined,
        saturatedFat: data.saturatedFat !== undefined ? Number(data.saturatedFat) : undefined,
        sodium: data.sodium !== undefined ? Number(data.sodium) : undefined,
      },
      include: {
        ingredients: true,
        benefits: true,
        foodNutrients: { include: { nutrient: true } },
      },
    });

    return FoodService.formatFood(updated);
  }

  static async deleteFood(id: string) {
    const existing = await prisma.food.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Nutrition food item not found.', 404);
    }

    await prisma.food.delete({ where: { id } });
    return { success: true, message: 'Food item deleted successfully.' };
  }

  static async getFoodBenefits(foodId: string) {
    const benefits = await prisma.foodBenefit.findMany({
      where: { foodId },
      orderBy: { sortOrder: 'asc' },
    });
    return benefits.map((b) => b.benefit);
  }

  static async getFoodIngredients(foodId: string) {
    return prisma.foodIngredient.findMany({
      where: { foodId },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
