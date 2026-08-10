import { Router } from 'express';
import { NutritionController } from '../controllers/nutrition.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

// STEP 3 Daily Nutrition Calculations Endpoint
router.get('/daily', NutritionController.getDailyNutrition);

// STEP 2 FoodLog API Endpoints
router.post('/logs', NutritionController.createFoodLog);
router.get('/logs/today', NutritionController.getTodayLogs);
router.get('/logs', NutritionController.getLogsByDate);
router.put('/logs/:id', NutritionController.updateFoodLog);
router.delete('/logs/:id', NutritionController.deleteFoodLog);

// Core Summary & History
router.get('/', NutritionController.getNutrition);
router.get('/summary', NutritionController.getSummary);
router.get('/today', NutritionController.getTodayMeals);
router.get('/weekly', NutritionController.getWeeklyNutrition);
router.get('/history', NutritionController.getNutritionHistory);

// Foods Master Catalog Routes
router.get('/foods/search', NutritionController.searchFoods);
router.get('/foods/:id', NutritionController.getFoodById);
router.get('/foods', NutritionController.getAllFoods);

// Meals Logging Routes
router.post('/meals', NutritionController.logMeal);
router.put('/meals/:id', NutritionController.updateMeal);
router.delete('/meals/:id', NutritionController.deleteMeal);

// Water Intake Routes
router.post('/water', NutritionController.logWater);
router.get('/water/today', NutritionController.getTodayWater);

// AI Coach Insight
router.get('/ai-insight', NutritionController.getAiInsight);

// Backwards compatibility routes
router.post('/', NutritionController.logMeal);
router.delete('/:id', NutritionController.deleteMeal);

export default router;
