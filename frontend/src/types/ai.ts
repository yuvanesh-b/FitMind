export interface StructuredExercise {
  name: string;
  muscleGroup?: string;
  sets: number;
  reps: number;
  restSeconds: number;
}

export interface StructuredWorkout {
  type: string;
  title: string;
  summary: string;
  workout?: {
    duration: number;
    difficulty: string;
    exercises: StructuredExercise[];
  };
}

export interface AiMessage {
  id: string;
  conversationId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  structuredData?: string;
  createdAt: string;
}

export interface AiConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AiMessage[];
}

export interface SmartCoachInsight {
  title: string;
  summary: string;
  volumeTrend?: string;
}
