export interface FoodNutrition {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  saturatedFat: number;
  sodium: number;
}

export interface FoodNutrient {
  name: string;
  amount: number;
  unit: string;
  category?: string;
}

export interface FoodIngredient {
  id?: string;
  name: string;
  amount?: number;
  unit?: string;
}

export interface FoodBenefit {
  id?: string;
  benefit: string;
  sortOrder?: number;
}

export interface Food {
  id: string;
  name: string;
  category?: string;
  servingSize: number;
  servingUnit: string;
  nutrition: FoodNutrition;
  ingredients?: FoodIngredient[];
  benefits?: string[] | FoodBenefit[];
  nutrients: FoodNutrient[];
}

export interface MacroItemSummary {
  consumed: number;
  target: number;
  remaining?: number;
  overTarget?: number;
  percentage: number;
}

export interface MicronutrientSummaryItem {
  name: string;
  amount: number;
  unit: string;
  referenceTarget: number;
  percentage: number;
}

export interface NutritionSummaryData {
  calories: MacroItemSummary;
  protein: MacroItemSummary;
  carbs: MacroItemSummary;
  fat: MacroItemSummary;
  fiber: MacroItemSummary;
  sugar: MacroItemSummary;
  sodium: MacroItemSummary;
  micronutrients: MicronutrientSummaryItem[];
}

export interface LoggedMicronutrient {
  name: string;
  amount: number;
  unit: string;
}

export interface MealLog {
  id: string;
  userId: string;
  mealType: string;
  mealTime?: string;
  foodName: string;
  quantity: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  sugarG?: number;
  saturatedFatG?: number;
  sodiumMg?: number;
  micronutrients?: LoggedMicronutrient[];
  loggedAt: string;
  items?: Array<{
    id: string;
    foodName: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }>;
}

export interface TodayMealsData {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  logs: MealLog[];
  totals?: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
  remaining?: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
  overTarget?: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
}

export interface WaterSummaryData {
  consumedMl: number;
  consumedLiters: number;
  targetMl: number;
  targetLiters: number;
  percentage: number;
}

export interface WeeklyNutritionPoint {
  date: string;
  dayName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface HistoryPoint {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface NutritionHistoryData {
  days: number;
  trackedDaysCount: number;
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  averageFiber: number;
  goalCompletionPercentage: number;
  historyPoints: HistoryPoint[];
}

export interface AINutritionInsightData {
  available: boolean;
  insight: string;
  actionableSuggestion?: string;
}
