import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { FoodService } from '../services/food.service';

export class NutritionFoodController {
  // GET /api/nutrition-foods
  static async getAllFoods(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const search = (req.query.search || req.query.q || req.query.query || '') as string;
      const category = (req.query.category || '') as string;

      const foods = await FoodService.getAllFoods({ search, category });
      return res.status(200).json({
        success: true,
        count: foods.length,
        data: foods,
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/nutrition-foods/:id
  static async getFoodById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const food = await FoodService.getFoodById(req.params.id);
      return res.status(200).json({
        success: true,
        data: food,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/nutrition-foods
  static async createFood(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const created = await FoodService.createFood(req.body);
      return res.status(201).json({
        success: true,
        message: 'Food item created successfully.',
        data: created,
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/nutrition-foods/:id
  static async updateFood(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const updated = await FoodService.updateFood(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Food item updated successfully.',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/nutrition-foods/:id
  static async deleteFood(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await FoodService.deleteFood(req.params.id);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
