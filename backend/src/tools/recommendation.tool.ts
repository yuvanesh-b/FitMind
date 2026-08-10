import { prisma } from '../config/db';
import { WorkoutTool } from './workout.tool';
import { ProfileTool } from './profile.tool';

export class RecommendationTool {
  static async generateTodayWorkoutRecommendation(userId: string) {
    const { profile } = await ProfileTool.getUserProfile(userId);
    const lastWorkout = await WorkoutTool.getLastWorkout(userId);

    // Determine target muscle groups based on last workout
    let recommendedMuscles = ['Legs', 'Core'];
    let title = 'Lower Body Strength & Core';

    if (lastWorkout && lastWorkout.exercises.length > 0) {
      const lastMuscleGroup = lastWorkout.exercises[0].exercise.muscleGroup;
      if (lastMuscleGroup === 'CHEST' || lastMuscleGroup === 'TRICEPS') {
        recommendedMuscles = ['Back', 'Biceps'];
        title = 'Back & Biceps Hypertrophy';
      } else if (lastMuscleGroup === 'BACK' || lastMuscleGroup === 'BICEPS') {
        recommendedMuscles = ['Quads', 'Hamstrings', 'Glutes'];
        title = 'Leg Day Power';
      } else if (lastMuscleGroup === 'QUADS' || lastMuscleGroup === 'HAMSTRINGS') {
        recommendedMuscles = ['Shoulders', 'Chest'];
        title = 'Upper Body Push';
      }
    }

    const availableExercises = await prisma.exercise.findMany({
      take: 6,
    });

    return {
      title,
      summary: `Recommended session target based on training frequency and recovery from last workout (${lastWorkout ? lastWorkout.title : 'None'}).`,
      recommendedMuscles,
      suggestedDurationMin: profile?.preferredDurationMin || 45,
      exercises: availableExercises.slice(0, 4).map((ex) => ({
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        sets: 4,
        reps: 10,
        restSeconds: 60,
      })),
    };
  }
}
