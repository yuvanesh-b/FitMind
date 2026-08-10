export interface Exercise {
  id: string;
  name: string;
  slug: string;
  muscleGroup: string;
  category: string;
  equipment: string;
  difficulty: string;
  description: string;
  instructions: string;
  primaryMuscle: string;
  secondaryMuscles?: string;
  setsRecommendation: number;
  repsRecommendation: string;
  restSeconds: number;
  caloriesBurnEstimate: number;
  isActive?: boolean;
}

export interface WorkoutSet {
  id: string;
  sessionExerciseId: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  isCompleted: boolean;
  previousWeightKg?: number;
  previousReps?: number;
}

export interface WorkoutSessionExercise {
  id: string;
  sessionId: string;
  exerciseId: string;
  order: number;
  exercise: Exercise;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  userId: string;
  planId?: string;
  title: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startedAt: string;
  completedAt?: string;
  durationSeconds: number;
  totalVolumeKg: number;
  totalSets: number;
  totalReps: number;
  caloriesBurned: number;
  notes?: string;
  exercises: WorkoutSessionExercise[];
}

export interface WorkoutPlanExercise {
  id: string;
  exerciseId: string;
  order: number;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
  exercise: Exercise;
}

export interface WorkoutPlanDay {
  id: string;
  dayName: string;
  dayOrder: number;
  targetMuscles?: string;
  exercises: WorkoutPlanExercise[];
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isAiGenerated: boolean;
  isCustom: boolean;
  days: WorkoutPlanDay[];
}
