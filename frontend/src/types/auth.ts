export interface UserProfile {
  id: string;
  userId: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  targetWeightKg?: number;
  fitnessLevel: string;
  workoutFrequencyDays: number;
  preferredDurationMin: number;
  availableEquipment: string;
  preferredTime?: string;
}

export interface FitnessGoal {
  id: string;
  userId: string;
  category: string;
  title: string;
  targetValue?: number;
  unit?: string;
  isCompleted: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profile?: UserProfile;
  goals?: FitnessGoal[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  accessToken: string | null;
}
