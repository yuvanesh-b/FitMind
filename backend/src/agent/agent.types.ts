export type AgentIntent =
  | 'PROFILE_DETAILS'
  | 'GREETING'
  | 'THANKS'
  | 'FAREWELL'
  | 'GENERAL_FITNESS'
  | 'TODAY_WORKOUT'
  | 'WORKOUT_RECOMMENDATION'
  | 'WORKOUT_GENERATION'
  | 'WORKOUT_HISTORY'
  | 'EXERCISE_PROGRESS'
  | 'EXERCISE_SEARCH'
  | 'PROGRESS_ANALYSIS'
  | 'NUTRITION_ADVICE'
  | 'PROTEIN_STATUS'
  | 'HYDRATION_STATUS'
  | 'RECOVERY_ADVICE'
  | 'WEEKLY_REPORT'
  | 'NEXT_PLAN'
  | 'EXERCISE_GUIDANCE';

export interface StructuredWorkoutExercise {
  name: string;
  sets: number;
  reps: number;
  restSeconds: number;
  notes?: string;
}

export interface StructuredWorkout {
  title: string;
  summary: string;
  workout: {
    split: string;
    duration: number;
    exercises: StructuredWorkoutExercise[];
  };
}

export type StructuredWorkoutRecommendation = StructuredWorkout;

export interface AgentResponse {
  intent: AgentIntent;
  replyText: string;
  structuredData?: StructuredWorkout;
  toolsExecuted: string[];
  conversationId?: string;
}
