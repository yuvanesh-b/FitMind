import { Request, Response, NextFunction } from 'express';
import { ExerciseService } from '../services/exercise.service';

export class ExerciseController {
  static async getExercises(req: Request, res: Response, next: NextFunction) {
    try {
      const { muscle, category, difficulty, equipment, search, page, limit } = req.query;

      const result = await ExerciseService.getAllExercises({
        muscle: muscle as string,
        category: category as string,
        difficulty: difficulty as string,
        equipment: equipment as string,
        search: search as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getExerciseById(req: Request, res: Response, next: NextFunction) {
    try {
      const exercise = await ExerciseService.getExerciseById(req.params.id);
      if (!exercise) {
        return res.status(404).json({ success: false, message: 'Exercise not found' });
      }
      return res.status(200).json({ success: true, data: exercise });
    } catch (error) {
      next(error);
    }
  }

  static async searchExercises(req: Request, res: Response, next: NextFunction) {
    try {
      const q = (req.query.q || req.query.search || '') as string;
      const exercises = await ExerciseService.searchExercises(q);
      return res.status(200).json({ success: true, data: exercises });
    } catch (error) {
      next(error);
    }
  }

  static async getExercisesByMuscle(req: Request, res: Response, next: NextFunction) {
    try {
      const exercises = await ExerciseService.getExercisesByMuscle(req.params.muscleGroup);
      return res.status(200).json({ success: true, data: exercises });
    } catch (error) {
      next(error);
    }
  }

  static async getExercisesByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const exercises = await ExerciseService.getExercisesByCategory(req.params.category);
      return res.status(200).json({ success: true, data: exercises });
    } catch (error) {
      next(error);
    }
  }
}
