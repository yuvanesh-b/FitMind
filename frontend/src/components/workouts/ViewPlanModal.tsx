import React from 'react';
import { WorkoutPlan } from '../../types/workout';
import { X, Play, Dumbbell, Clock } from 'lucide-react';

interface ViewPlanModalProps {
  plan: WorkoutPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onStartPlan: (plan: WorkoutPlan) => void;
}

export const ViewPlanModal: React.FC<ViewPlanModalProps> = ({
  plan,
  isOpen,
  onClose,
  onStartPlan,
}) => {
  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#865BC4]/15 text-[#865BC4] border border-[#865BC4]/30">
              {plan.isAiGenerated ? 'AI GENERATED' : 'CUSTOM PLAN'}
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-semibold">{plan.days?.length || 1} Days / Week</span>
          </div>
          <h3 className="text-2xl font-black text-[var(--text-primary)]">{plan.name}</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{plan.description}</p>
        </div>

        {/* Days & Exercises List */}
        <div className="space-y-4 pt-2">
          {plan.days?.map((day, idx) => (
            <div key={day.id || idx} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
                <h4 className="font-extrabold text-[var(--text-primary)] text-sm flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-[#865BC4]" />
                  <span>{day.dayName}</span>
                </h4>
                <span className="text-[11px] font-bold text-[#865BC4]">{day.targetMuscles || 'Full Body'}</span>
              </div>

              <div className="space-y-2">
                {day.exercises?.map((exItem, exIdx) => (
                  <div
                    key={exItem.id || exIdx}
                    className="p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-[var(--text-primary)] block">{exItem.exercise?.name || 'Exercise'}</span>
                      <span className="text-[10px] text-[var(--text-secondary)]">{exItem.exercise?.category || 'Strength'}</span>
                    </div>

                    <div className="text-right flex items-center gap-4">
                      <span className="font-extrabold text-[#865BC4]">
                        {exItem.targetSets} sets × {exItem.targetReps} reps
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {exItem.restSeconds || 60}s rest
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onStartPlan(plan);
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#865BC4] hover:bg-[#7347B0] text-white shadow-lg shadow-[#865BC4]/30 flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Training Session</span>
          </button>
        </div>
      </div>
    </div>
  );
};
