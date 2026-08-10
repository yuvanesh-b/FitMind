import React, { useState, useEffect } from 'react';
import { WorkoutSession } from '../../types/workout';
import { api } from '../../services/api';
import { Clock, Dumbbell, Check, Play, CheckCircle, Plus, Timer, X, SkipForward, AlertCircle } from 'lucide-react';

interface ActiveWorkoutTabProps {
  session: WorkoutSession | null;
  onFinishWorkout: (summary: any) => void;
  onGoToPlans: () => void;
}

export const ActiveWorkoutTab: React.FC<ActiveWorkoutTabProps> = ({
  session,
  onFinishWorkout,
  onGoToPlans,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [localSession, setLocalSession] = useState<WorkoutSession | null>(session);

  // Skipped Exercises Tracking State
  const [skippedExerciseIds, setSkippedExerciseIds] = useState<Set<string>>(new Set());
  const [skippingExerciseId, setSkippingExerciseId] = useState<string | null>(null);

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [isResting, setIsResting] = useState(false);

  useEffect(() => {
    setLocalSession(session);
    if (session?.startedAt) {
      const startMs = new Date(session.startedAt).getTime();
      const nowMs = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((nowMs - startMs) / 1000)));
    }
  }, [session]);

  // Elapsed timer ticker
  useEffect(() => {
    if (!localSession) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [localSession]);

  // Rest timer ticker
  useEffect(() => {
    if (!isResting || restSeconds === null) return;
    if (restSeconds <= 0) {
      setIsResting(false);
      setRestSeconds(null);
      return;
    }
    const timer = setInterval(() => {
      setRestSeconds((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(timer);
  }, [isResting, restSeconds]);

  if (!localSession) {
    return (
      <div className="p-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center space-y-4 max-w-xl mx-auto my-8 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-[#865BC4]/15 text-[#865BC4] border border-[#865BC4]/30 flex items-center justify-center mx-auto shadow-sm">
          <Clock className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-[var(--text-primary)]">No Active Workout Session</h3>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Select a workout plan from "My Plans" to start logging sets and tracking performance.</p>
        </div>
        <button
          onClick={onGoToPlans}
          className="px-5 py-2.5 rounded-xl font-extrabold bg-[#865BC4] hover:bg-[#7347B0] text-white text-xs shadow-lg shadow-[#865BC4]/20 inline-flex items-center gap-2 transition-all active:scale-95"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Go to My Plans</span>
        </button>
      </div>
    );
  }

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleSet = async (setId: string, currentWeight: number, currentReps: number, currentStatus: boolean) => {
    const nextStatus = !currentStatus;

    // Optimistic UI Update
    setLocalSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map((ex) => ({
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, isCompleted: nextStatus } : s)),
        })),
      };
    });

    try {
      await api.put(`/workouts/sets/${setId}`, {
        weightKg: currentWeight,
        reps: currentReps,
        isCompleted: nextStatus,
      });

      // Start Rest Timer if set was marked completed
      if (nextStatus) {
        setRestSeconds(90);
        setIsResting(true);
      }
    } catch (e) {
      console.error('Failed to update set:', e);
    }
  };

  const handleUpdateSetValues = async (setId: string, weightKg: number, reps: number) => {
    try {
      await api.put(`/workouts/sets/${setId}`, { weightKg, reps });
    } catch (e) {
      console.error('Failed to update set values:', e);
    }
  };

  const handleConfirmSkip = () => {
    if (skippingExerciseId) {
      setSkippedExerciseIds((prev) => new Set(prev).add(skippingExerciseId));
    }
    setSkippingExerciseId(null);
  };

  const handleFinish = async () => {
    try {
      const res = await api.put(`/workouts/sessions/${localSession.id}/complete`, {
        durationSeconds: elapsedSeconds,
      });

      const completedData = res.data.data;
      onFinishWorkout({
        title: localSession.title,
        durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
        exercisesCount: localSession.exercises.length,
        setsCount: completedData.totalSets || 0,
        totalVolumeKg: completedData.totalVolumeKg || 0,
        estimatedCalories: completedData.caloriesBurned || 250,
      });
    } catch (e) {
      console.error('Failed to finish session:', e);
    }
  };

  const totalExercisesCount = localSession.exercises.length;
  const skippedExercisesCount = skippedExerciseIds.size;
  const completedExercisesCount = localSession.exercises.filter(
    (ex) => !skippedExerciseIds.has(ex.id) && ex.sets.length > 0 && ex.sets.every((s) => s.isCompleted)
  ).length;
  const remainingExercisesCount = Math.max(0, totalExercisesCount - completedExercisesCount - skippedExercisesCount);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Rest Timer Floating Banner */}
      {isResting && restSeconds !== null && (
        <div className="p-4 rounded-2xl bg-[#865BC4] text-white border border-[#865BC4] shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/20 text-white animate-pulse">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/80">Rest Timer Active</span>
              <h4 className="text-xl font-black text-white">{formatTimer(restSeconds)}</h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRestSeconds((prev) => (prev ? prev + 30 : 30))}
              className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+30s</span>
            </button>
            <button
              onClick={() => {
                setIsResting(false);
                setRestSeconds(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-white text-[#865BC4] hover:bg-white/90 text-xs font-bold flex items-center gap-1 transition-all shadow-sm"
            >
              <X className="w-3.5 h-3.5" />
              <span>Skip Rest</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Session Header Bar */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              IN PROGRESS
            </span>
            <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-secondary)]">
              <span>Completed: <strong className="text-emerald-600">{completedExercisesCount}</strong></span>
              <span>Skipped: <strong className="text-amber-600">{skippedExercisesCount}</strong></span>
              <span>Remaining: <strong className="text-[var(--text-primary)]">{remainingExercisesCount}</strong></span>
            </div>
          </div>

          <h2 className="text-2xl font-black text-[var(--text-primary)]">{localSession.title}</h2>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)] block">Elapsed Time</span>
            <span className="text-xl font-black text-[#865BC4] font-mono">{formatTimer(elapsedSeconds)}</span>
          </div>

          <button
            onClick={handleFinish}
            className="px-5 py-2.5 rounded-xl font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Finish Workout</span>
          </button>
        </div>
      </div>

      {/* Exercises & Set Tracking Cards */}
      <div className="space-y-4">
        {localSession.exercises.map((exItem) => {
          const isSkipped = skippedExerciseIds.has(exItem.id);
          const completedSets = exItem.sets.filter((s) => s.isCompleted).length;

          return (
            <div key={exItem.id} className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3 shadow-sm">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-[var(--text-primary)] text-base">{exItem.exercise?.name || 'Exercise'}</h3>
                    {isSkipped && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500/15 text-amber-600 border border-amber-500/30">
                        SKIPPED
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] font-medium">{exItem.exercise?.primaryMuscle || exItem.exercise?.category}</span>
                </div>
                <span className="text-xs font-bold text-[#865BC4] bg-[#865BC4]/10 px-2.5 py-1 rounded-lg border border-[#865BC4]/20">
                  {completedSets} / {exItem.sets.length} Sets
                </span>
              </div>

              {/* Set Table */}
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] px-2">
                  <div className="col-span-2">SET</div>
                  <div className="col-span-4">WEIGHT (KG)</div>
                  <div className="col-span-4">REPS</div>
                  <div className="col-span-2 text-right">DONE</div>
                </div>

                {exItem.sets.map((set) => (
                  <div
                    key={set.id}
                    className={`grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl border text-xs transition-all ${
                      set.isCompleted
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-[var(--text-primary)]'
                        : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="col-span-2 font-black text-[var(--text-secondary)]">SET {set.setNumber}</div>

                    <div className="col-span-4">
                      <input
                        type="number"
                        value={set.weightKg}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setLocalSession((prev) => {
                            if (!prev) return null;
                            return {
                              ...prev,
                              exercises: prev.exercises.map((e) => ({
                                ...e,
                                sets: e.sets.map((s) => (s.id === set.id ? { ...s, weightKg: val } : s)),
                              })),
                            };
                          });
                          handleUpdateSetValues(set.id, val, set.reps);
                        }}
                        className="w-20 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#865BC4]"
                      />
                    </div>

                    <div className="col-span-4">
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setLocalSession((prev) => {
                            if (!prev) return null;
                            return {
                              ...prev,
                              exercises: prev.exercises.map((e) => ({
                                ...e,
                                sets: e.sets.map((s) => (s.id === set.id ? { ...s, reps: val } : s)),
                              })),
                            };
                          });
                          handleUpdateSetValues(set.id, set.weightKg, val);
                        }}
                        className="w-20 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-[#865BC4]"
                      />
                    </div>

                    <div className="col-span-2 text-right">
                      <button
                        onClick={() => handleToggleSet(set.id, set.weightKg, set.reps, set.isCompleted)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ml-auto ${
                          set.isCompleted
                            ? 'bg-emerald-600 text-white shadow-md'
                            : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[#865BC4]'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rendered Skip Exercise Secondary Action Button */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)] mt-3">
                {isSkipped ? (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-500/15 text-amber-600 border border-amber-500/30">
                    SKIPPED
                  </span>
                ) : (
                  <button
                    onClick={() => setSkippingExerciseId(exItem.id)}
                    className="px-4 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold flex items-center gap-2 border border-[var(--border-subtle)] transition-colors shadow-sm"
                  >
                    <SkipForward className="w-4 h-4 text-[var(--text-secondary)]" />
                    <span>Skip Exercise</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Skip Exercise Confirmation Modal */}
      {skippingExerciseId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-[var(--text-primary)]">Skip this exercise?</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                You can continue with the next exercise. This exercise will be marked as skipped.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setSkippingExerciseId(null)}
                className="py-2.5 rounded-xl font-bold bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] text-xs border border-[var(--border-subtle)]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSkip}
                className="py-2.5 rounded-xl font-extrabold bg-[#865BC4] hover:bg-[#7347B0] text-white text-xs shadow-lg shadow-[#865BC4]/30"
              >
                Skip Exercise
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
