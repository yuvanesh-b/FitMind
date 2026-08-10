import React from 'react';
import { WorkoutPlan, WorkoutSession } from '../../types/workout';
import { Play, Eye, Bot, Dumbbell, Calendar, Activity, ArrowRight } from 'lucide-react';
import { Adaptive6DayRecommendationCard } from './Adaptive6DayRecommendationCard';

interface MyPlansTabProps {
  plans: WorkoutPlan[];
  activeSession: WorkoutSession | null;
  loading?: boolean;
  onStartPlan: (plan: WorkoutPlan) => void;
  onViewPlan: (plan: WorkoutPlan) => void;
  onContinueActiveWorkout: () => void;
  onOpenAiModal: () => void;
  onOpenCustomModal: () => void;
}

export const MyPlansTab: React.FC<MyPlansTabProps> = ({
  plans,
  activeSession,
  loading,
  onStartPlan,
  onViewPlan,
  onContinueActiveWorkout,
  onOpenAiModal,
  onOpenCustomModal,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] h-60" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Workout Prominent Banner */}
      {activeSession && (
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[#865BC4]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#865BC4] text-white flex items-center justify-center shadow-lg shadow-[#865BC4]/30">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#865BC4]">
                  ACTIVE WORKOUT IN PROGRESS
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-primary)] mt-0.5">{activeSession.title}</h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Started {new Date(activeSession.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                {activeSession.exercises?.length || 0} exercises
              </p>
            </div>
          </div>

          <button
            onClick={onContinueActiveWorkout}
            className="px-5 py-2.5 rounded-xl font-extrabold bg-[#865BC4] hover:bg-[#7347B0] text-white text-xs shadow-lg shadow-[#865BC4]/30 flex items-center gap-2 transition-all active:scale-95 self-end sm:self-center"
          >
            <span>Continue Workout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Adaptive Next 6 Days Workout Plan */}
      <Adaptive6DayRecommendationCard />

      {/* Empty State */}
      {plans.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center space-y-4 max-w-2xl mx-auto my-8 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#865BC4]/15 text-[#865BC4] border border-[#865BC4]/30 flex items-center justify-center mx-auto shadow-sm">
            <Dumbbell className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-[var(--text-primary)]">No custom workout plans yet</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
              Create a custom training plan or let your FitMind coach generate a personalized routine for your fitness goal.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenAiModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-extrabold bg-[#865BC4] hover:bg-[#7347B0] text-white text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <Dumbbell className="w-4 h-4" />
              <span>Generate AI Workout</span>
            </button>
            <button
              onClick={onOpenCustomModal}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-semibold bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs flex items-center justify-center transition-all"
            >
              <span>New Custom Plan</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[var(--text-primary)] uppercase tracking-wider">Your Custom Workout Plans ({plans.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[#865BC4]/40 transition-all shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[#865BC4]">
                      {plan.isAiGenerated ? 'AI Generated' : 'Custom'}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] font-medium">
                      {plan.days?.length || 0} Days
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[#865BC4] transition-colors">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                    {plan.description || 'Custom training split designed for your targets.'}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-[var(--border-subtle)]">
                  <button
                    onClick={() => onStartPlan(plan)}
                    className="flex-1 py-2.5 rounded-xl font-extrabold bg-[#865BC4] hover:bg-[#7347B0] text-white text-xs shadow-md shadow-[#865BC4]/20 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Plan</span>
                  </button>
                  <button
                    onClick={() => onViewPlan(plan)}
                    className="p-2.5 rounded-xl font-semibold bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)] text-xs transition-all"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
