import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import { NutritionFoodController } from '../controllers/nutrition-food.controller';

const router = Router();

// Protect all nutrition food endpoints with JWT authentication middleware
router.use(authenticateToken);

router.get('/', NutritionFoodController.getAllFoods);
router.get('/:id', NutritionFoodController.getFoodById);
router.post('/', NutritionFoodController.createFood);
router.put('/:id', NutritionFoodController.updateFood);
router.delete('/:id', NutritionFoodController.deleteFood);

export default router;
