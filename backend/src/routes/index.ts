import { Router } from 'express';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import exerciseRoutes from './exercise.routes';
import workoutRoutes from './workout.routes';
import progressRoutes from './progress.routes';
import nutritionRoutes from './nutrition.routes';
import nutritionFoodRoutes from './nutrition-food.routes';
import aiRoutes from './ai.routes';
import weeklyReportRoutes from './weekly-report.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/exercises', exerciseRoutes);
router.use('/workouts', workoutRoutes);
router.use('/progress', progressRoutes);
router.use('/nutrition', nutritionRoutes);
router.use('/nutrition-foods', nutritionFoodRoutes);
router.use('/ai', aiRoutes);
router.use('/reports/weekly', weeklyReportRoutes);

export default router;
