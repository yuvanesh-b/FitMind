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
      <div className="p-12 rounded-2xl bg-surface-dark/70 border border-surface-border text-center space-y-4 max-w-xl mx-auto my-8">
        <div className="w-14 h-14 rounded-2xl bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center mx-auto shadow-lg">
          <Clock className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-white">No Active Workout Session</h3>
          <p className="text-xs text-slate-400 mt-1">Select a workout plan from "My Plans" to start logging sets and tracking performance.</p>
        </div>
        <button
          onClick={onGoToPlans}
          className="px-5 py-2.5 rounded-xl font-extrabold bg-brand-600 hover:bg-brand-500 text-white text-xs shadow-lg shadow-brand-600/30 inline-flex items-center gap-2"
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
        <div className="p-4 rounded-2xl bg-brand-600/25 border border-brand-500/50 backdrop-blur-md flex items-center justify-between shadow-xl text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-600 text-white animate-pulse">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-400">Rest Timer Active</span>
              <h4 className="text-xl font-black">{formatTimer(restSeconds)}</h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRestSeconds((prev) => (prev ? prev + 30 : 30))}
              className="px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-border text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+30s</span>
            </button>
            <button
              onClick={() => {
                setIsResting(false);
                setRestSeconds(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Skip Rest</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Session Header Bar */}
      <div className="p-5 sm:p-6 rounded-2xl bg-surface-dark border border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-accent-emerald/20 text-accent-emerald border border-accent-emerald/30 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
              IN PROGRESS
            </span>
            <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
              <span>Completed: <strong className="text-accent-emerald">{completedExercisesCount}</strong></span>
              <span>Skipped: <strong className="text-amber-400">{skippedExercisesCount}</strong></span>
              <span>Remaining: <strong className="text-white">{remainingExercisesCount}</strong></span>
            </div>
          </div>

          <h2 className="text-2xl font-black text-white">{localSession.title}</h2>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Elapsed Time</span>
            <span className="text-xl font-black text-brand-400 font-mono">{formatTimer(elapsedSeconds)}</span>
          </div>

          <button
            onClick={handleFinish}
            className="px-5 py-2.5 rounded-xl font-extrabold bg-accent-emerald hover:bg-emerald-600 text-white text-xs shadow-lg shadow-accent-emerald/20 flex items-center gap-1.5 transition-all"
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
            <div key={exItem.id} className="p-5 rounded-2xl bg-surface-dark border border-surface-border space-y-3">
              <div className="flex items-center justify-between border-b border-surface-border/50 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-white text-base">{exItem.exercise?.name || 'Exercise'}</h3>
                    {isSkipped && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        SKIPPED
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{exItem.exercise?.primaryMuscle || exItem.exercise?.category}</span>
                </div>
                <span className="text-xs font-bold text-brand-400 bg-brand-600/10 px-2.5 py-1 rounded-lg border border-brand-500/20">
                  {completedSets} / {exItem.sets.length} Sets
                </span>
              </div>

              {/* Set Table */}
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-2">
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
                        ? 'bg-accent-emerald/10 border-accent-emerald/30 text-white'
                        : 'bg-surface-elevated border-surface-border/60 text-slate-300'
                    }`}
                  >
                    <div className="col-span-2 font-black text-slate-400">SET {set.setNumber}</div>

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
                        className="w-20 bg-surface-dark border border-surface-border rounded-lg px-2 py-1 text-xs font-bold text-white focus:outline-none focus:border-brand-500"
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
                        className="w-20 bg-surface-dark border border-surface-border rounded-lg px-2 py-1 text-xs font-bold text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="col-span-2 text-right">
                      <button
                        onClick={() => handleToggleSet(set.id, set.weightKg, set.reps, set.isCompleted)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ml-auto ${
                          set.isCompleted
                            ? 'bg-accent-emerald text-white shadow-md'
                            : 'bg-surface-dark border border-surface-border text-slate-500 hover:text-white'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rendered Skip Exercise Secondary Action Button directly inside exercise card after all set rows */}
              <div className="flex items-center justify-between pt-3 border-t border-surface-border/50 mt-3">
                {isSkipped ? (
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    SKIPPED
                  </span>
                ) : (
                  <button
                    onClick={() => setSkippingExerciseId(exItem.id)}
                    className="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface-border text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 border border-surface-border transition-colors shadow-sm"
                  >
                    <SkipForward className="w-4 h-4 text-slate-400" />
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
          <div className="w-full max-w-sm bg-surface-dark border border-surface-border rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white">Skip this exercise?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                You can continue with the next exercise. This exercise will be marked as skipped.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setSkippingExerciseId(null)}
                className="py-2.5 rounded-xl font-bold bg-surface-elevated hover:bg-surface-border text-slate-300 text-xs border border-surface-border"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSkip}
                className="py-2.5 rounded-xl font-extrabold bg-brand-600 hover:bg-brand-500 text-white text-xs shadow-lg shadow-brand-600/30"
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
