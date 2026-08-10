import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { NutritionService } from '../services/nutrition.service';
import { FoodService } from '../services/food.service';
import { HydrationService } from '../services/hydration.service';
import { NutritionAiService } from '../services/nutrition-ai.service';

export class NutritionController {
  // GET /api/nutrition/daily?date=YYYY-MM-DD
  static async getDailyNutrition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dateStr = req.query.date as string | undefined;
      const dailyData = await NutritionService.getDailyNutrition(req.user!.userId, dateStr);
      return res.status(200).json({
        success: true,
        data: dailyData,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/nutrition/logs
  static async createFoodLog(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const foodLog = await NutritionService.createFoodLog(req.user!.userId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Food log created successfully',
        data: foodLog,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/nutrition/logs/today
  static async getTodayLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const logs = await NutritionService.getTodayMeals(req.user!.userId);
      return res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/nutrition/logs (supports ?date=2026-08-09)
  static async getLogsByDate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dateStr = req.query.date as string | undefined;
      const logs = await NutritionService.getLogsByDate(req.user!.userId, dateStr);
      return res.status(200).json({
        success: true,
        count: logs.length,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/nutrition/logs/:id
  static async updateFoodLog(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await NutritionService.updateMeal(req.user!.userId, req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Food log updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/nutrition/logs/:id
  static async deleteFoodLog(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await NutritionService.deleteMeal(req.user!.userId, req.params.id);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  // Legacy / Default GET /api/nutrition
  static async getNutrition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dateStr = req.query.date as string | undefined;
      const summary = await NutritionService.getSummary(req.user!.userId, dateStr);
      const todayMeals = await NutritionService.getTodayMeals(req.user!.userId, dateStr);
      const hydration = await HydrationService.getTodayWater(req.user!.userId);

      return res.status(200).json({
        success: true,
        data: {
          today: todayMeals,
          summary,
          hydration,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/nutrition/summary
  static async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dateStr = req.query.date as string | undefined;
      const summary = await NutritionService.getSummary(req.user!.userId, dateStr);
      return res.status(200).json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/nutrition/today
  static async getTodayMeals(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const dateStr = req.query.date as string | undefined;
      const meals = await NutritionService.getTodayMeals(req.user!.userId, dateStr);
      return res.status(200).json({ success: true, data: meals });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/nutrition/weekly
  static async getWeeklyNutrition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const weekly = await NutritionService.getWeeklyNutrition(req.user!.userId);
      return res.status(200).json({ success: true, data: weekly });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/nutrition/history
  static async getNutritionHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? Number(req.query.days) : 30;
      const history = await NutritionService.getNutritionHistory(req.user!.userId, days);
      return res.status(200).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/nutrition/meals & POST /api/nutrition
  static async logMeal(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const log = await NutritionService.logMeal(req.user!.userId, req.body);
      return res.status(201).json({ success: true, data: log, message: 'Meal logged successfully' });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/nutrition/meals/:id
  static async updateMeal(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await NutritionService.updateMeal(req.user!.userId, req.params.id, req.body);
      return res.status(200).json({ success: true, data: updated, message: 'Meal updated successfully' });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/nutrition/meals/:id & DELETE /api/nutrition/:id
  static async deleteMeal(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await NutritionService.deleteMeal(req.user!.userId, req.params.id);
      return res.status(200).json({ success: true, message: 'Meal deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/nutrition/foods/search
  static async searchFoods(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const q = (req.query.q || req.query.query || req.query.search || '') as string;
      const category = (req.query.category || '') as string;
      const foods = await FoodService.getAllFoods({ search: q, category });
      return res.status(200).json({ success: true, data: foods });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/nutrition/foods
  static async getAllFoods(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const search = (req.query.search || req.query.q || req.query.query || '') as string;
      const category = (req.query.category || '') as string;
      const foods = await FoodService.getAllFoods({ search, category });
      return res.status(200).json({ success: true, data: foods });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/nutrition/foods/:id
  static async getFoodById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const food = await FoodService.getFoodById(req.params.id);
      return res.status(200).json({ success: true, data: food });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/nutrition/water
  static async logWater(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const amountMl = req.body.amountMl || req.body.amount || 250;
      const water = await HydrationService.logWater(req.user!.userId, amountMl);
      return res.status(201).json({ success: true, data: water, message: 'Water logged successfully' });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/nutrition/water/today
  static async getTodayWater(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const waterSummary = await HydrationService.getTodayWater(req.user!.userId);
      return res.status(200).json({ success: true, data: waterSummary });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/nutrition/ai-insight
  static async getAiInsight(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const insight = await NutritionAiService.generateNutritionInsight(req.user!.userId);
      return res.status(200).json({ success: true, data: insight });
    } catch (error) {
      next(error);
    }
  }
}
