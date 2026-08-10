import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Sparkles, RefreshCw, Calendar, Flame, Dumbbell, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';

interface ExerciseItem {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  isSubstitution?: boolean;
}

interface DayPlan {
  dayNumber: number;
  date: string;
  dayName: string;
  workoutType: string;
  isRestDay: boolean;
  targetMuscleGroups: string[];
  exercises: ExerciseItem[];
  reason: string;
}

interface AdaptiveAnalysis {
  historyDays: number;
  totalSessionsCount: number;
  activeDaysCount: number;
  restDaysCount: number;
  completedExercisesCount: number;
  skippedExercisesCount: number;
  frequentlySkippedExercises: string[];
  userGoal: string;
  targetFrequencyDays?: number;
  repeatedMuscles: string[];
  neglectedMuscles: string[];
}

interface AdaptiveRecommendationData {
  id?: string;
  generatedAt: string;
  startDate: string;
  endDate: string;
  analysis: AdaptiveAnalysis;
  days: DayPlan[];
}

export const Adaptive6DayRecommendationCard: React.FC = () => {
  const [recommendation, setRecommendation] = useState<AdaptiveRecommendationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/workouts/adaptive-recommendation');
      if (res.data.success) {
        setRecommendation(res.data.data);
      }
    } catch (e: any) {
      console.error('Failed to fetch adaptive recommendation:', e);
      setError('Unable to load adaptive workout plan.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await api.post('/workouts/adaptive-recommendation');
      if (res.data.success) {
        setRecommendation(res.data.data);
      }
    } catch (e: any) {
      console.error('Failed to regenerate adaptive plan:', e);
      setError('Failed to recalculate adaptive plan.');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchRecommendation();
  }, []);

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] animate-pulse space-y-4 shadow-sm">
        <div className="w-48 h-6 bg-[var(--bg-surface)] rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 bg-[var(--bg-surface)] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!recommendation || recommendation.days.length === 0) {
    return null;
  }

  const { analysis, days } = recommendation;

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-surface)] to-[var(--bg-card)] border border-[#865BC4]/40 shadow-lg space-y-5 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#865BC4] animate-pulse" />
            <h3 className="text-lg font-black text-[var(--text-primary)] tracking-tight">Your Next 6 Days (Adaptive Plan)</h3>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">
            Dynamically adapted from your previous 6 days of MySQL workout history ({analysis.totalSessionsCount} session(s) logged, {analysis.activeDaysCount} active days, {analysis.skippedExercisesCount} skipped items).
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={generating}
          className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#865BC4]/20 hover:bg-[#865BC4]/30 text-[var(--text-primary)] border border-[#865BC4]/40 flex items-center gap-2 transition-all disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Analyzing & Re-calculating...' : 'Regenerate Plan'}</span>
        </button>
      </div>

      {/* Analysis Quick Banner */}
      <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-4">
          <span className="text-[var(--text-secondary)]">Goal: <strong className="text-[var(--text-primary)]">{analysis.userGoal}</strong></span>
          <span className="text-[var(--text-secondary)]">Target Frequency: <strong className="text-[#865BC4]">{analysis.targetFrequencyDays || 4} days/wk</strong></span>
        </div>
        {analysis.neglectedMuscles.length > 0 && (
          <div className="flex items-center gap-1.5 text-[#865BC4]">
            <ShieldAlert className="w-4 h-4 text-[#865BC4]" />
            <span>Priority focus: <strong>{analysis.neglectedMuscles.slice(0, 3).join(', ')}</strong></span>
          </div>
        )}
      </div>

      {/* 6 Day Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {days.map((day) => (
          <div
            key={day.dayNumber}
            className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
              day.isRestDay
                ? 'bg-[var(--bg-surface)]/60 border-[var(--border-subtle)] text-[var(--text-secondary)]'
                : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[#865BC4]/50 shadow-sm hover:shadow-md'
            }`}
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-[#865BC4] uppercase tracking-wider">
                  Day {day.dayNumber} • {day.dayName} ({day.date.slice(5)})
                </span>
                {day.isRestDay ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                    Rest Day
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#865BC4]/20 text-[#865BC4] border border-[#865BC4]/40">
                    Active Session
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-[var(--text-primary)] mb-2">{day.workoutType}</h4>

              {/* Target Muscles */}
              {!day.isRestDay && day.targetMuscleGroups.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {day.targetMuscleGroups.map((m) => (
                    <span key={m} className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
                      {m}
                    </span>
                  ))}
                </div>
              )}

              {/* Exercises List */}
              {!day.isRestDay && day.exercises.length > 0 && (
                <div className="space-y-1.5 my-3">
                  {day.exercises.map((ex, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[var(--bg-surface)] last:border-0">
                      <div className="flex items-center gap-1.5 font-medium text-[var(--text-primary)]">
                        <ChevronRight className="w-3 h-3 text-[#865BC4]" />
                        <span>{ex.name}</span>
                        {ex.isSubstitution && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#865BC4]/20 text-[#865BC4] border border-[#865BC4]/40">
                            Substituted
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-extrabold text-[#865BC4]">
                        {ex.targetSets} sets × {ex.targetReps}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Data-Driven Reason */}
            <div className="mt-3 pt-2.5 border-t border-[var(--bg-surface)] text-[11px] text-[var(--text-secondary)] italic flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#865BC4] shrink-0 mt-0.5" />
              <span>{day.reason}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
