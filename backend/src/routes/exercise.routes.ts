import { Router } from 'express';
import { ExerciseController } from '../controllers/exercise.controller';

const router = Router();

router.get('/', ExerciseController.getExercises);
router.get('/search', ExerciseController.searchExercises);
router.get('/muscle/:muscleGroup', ExerciseController.getExercisesByMuscle);
router.get('/category/:category', ExerciseController.getExercisesByCategory);
router.get('/:id', ExerciseController.getExerciseById);

export default router;
