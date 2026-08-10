import React from 'react';
import { Trophy, Clock, Dumbbell, Flame, CheckCircle } from 'lucide-react';

interface WorkoutSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: {
    title: string;
    durationMinutes: number;
    exercisesCount: number;
    setsCount: number;
    totalVolumeKg: number;
    estimatedCalories: number;
  } | null;
}

export const WorkoutSummaryModal: React.FC<WorkoutSummaryModalProps> = ({
  isOpen,
  onClose,
  summary,
}) => {
  if (!isOpen || !summary) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--bg-card)] border border-[#865BC4]/40 rounded-2xl p-6 shadow-2xl space-y-5 text-center relative">
        <div className="w-16 h-16 rounded-2xl bg-[#865BC4]/15 border border-[#865BC4]/30 text-[#865BC4] flex items-center justify-center mx-auto shadow-lg shadow-[#865BC4]/20">
          <Trophy className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#865BC4]">Workout Complete</span>
          <h3 className="text-2xl font-black text-[var(--text-primary)] mt-1">{summary.title}</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Great job! Session completed and recorded to database.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center">
            <span className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)] block mb-1">Duration</span>
            <span className="text-lg font-black text-[var(--text-primary)] flex items-center justify-center gap-1">
              <Clock className="w-4 h-4 text-[#865BC4]" />
              {summary.durationMinutes} min
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center">
            <span className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)] block mb-1">Total Volume</span>
            <span className="text-lg font-black text-emerald-600 flex items-center justify-center gap-1">
              <Dumbbell className="w-4 h-4" />
              {summary.totalVolumeKg.toLocaleString()} kg
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center">
            <span className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)] block mb-1">Sets & Reps</span>
            <span className="text-lg font-black text-[var(--text-primary)]">
              {summary.setsCount} <span className="text-xs font-normal text-[var(--text-secondary)]">sets</span>
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center">
            <span className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)] block mb-1">Est. Calories</span>
            <span className="text-lg font-black text-amber-600 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4" />
              {summary.estimatedCalories} kcal
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-xl font-extrabold bg-[#865BC4] hover:bg-[#7347B0] text-white text-xs shadow-lg shadow-[#865BC4]/30 flex items-center justify-center gap-2 transition-all mt-2"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Save & Back to Workouts</span>
        </button>
      </div>
    </div>
  );
};
