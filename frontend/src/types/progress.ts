export interface BodyMeasurement {
  id: string;
  userId: string;
  weightKg: number;
  chestCm?: number;
  waistCm?: number;
  armsCm?: number;
  thighsCm?: number;
  bodyFatPercentage?: number;
  recordedAt: string;
}

export interface ProgressSummary {
  currentWeight: number;
  startingWeight: number;
  measurements: BodyMeasurement[];
  totalWorkouts: number;
  totalVolumeKg: number;
  analytics: {
    status: string;
    volumeTrend?: string;
    volumeChangePercent?: string;
    latestVolumeKg?: number;
    previousVolumeKg?: number;
  };
  recentSessions: any[];
}
