export interface DayActivity {
  dayName: string;
  dateStr: string;
  title: string;
  durationMin: number;
  setsCount: number;
  exerciseCount: number;
  status: 'COMPLETED' | 'MISSED' | 'REST';
}

export interface WorkoutReportSummary {
  completedWorkouts: number;
  targetWorkouts: number;
  consistencyPct: number;
  totalTrainingTimeMinutes: number;
  totalVolumeKg: number;
  activeStreakDays: number;
  dayByDay: DayActivity[];
}

export interface NutritionReportSummary {
  avgCalories: number;
  avgProteinG: number;
  avgCarbsG: number;
  avgFatG: number;
  avgFiberG: number;
}

export interface ProgressReportSummary {
  startWeightKg: number;
  currentWeightKg: number;
  weightChangeKg: number;
  targetWeightKg?: number;
}

export interface AiPerformanceAnalysis {
  whatWentWell: string[];
  needsImprovement: string[];
}

export interface NextWeekPlanDay {
  dayName: string;
  workoutTitle: string;
  durationMin: number;
  focus: string;
  exercises: string[];
}

export interface WeeklyReportData {
  id: string;
  userId: string;
  periodStart: string;
  periodEnd: string;
  periodLabel: string;
  workoutSummary: WorkoutReportSummary;
  nutritionSummary?: NutritionReportSummary | null;
  progressSummary: ProgressReportSummary;
  aiAnalysis: AiPerformanceAnalysis;
  aiInsight: string;
  nextWeekPlan: NextWeekPlanDay[];
  nextWeekGoals: string[];
  pdfPath?: string;
  hasPdf: boolean;
  createdAt: string;
}
