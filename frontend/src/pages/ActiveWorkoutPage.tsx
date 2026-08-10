import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { WorkoutSession, WorkoutSessionExercise } from '../types/workout';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  Check,
  SkipForward,
  Play,
  Dumbbell,
  Flame,
  Activity,
  Trophy,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export const ActiveWorkoutPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Skipped Exercises State
  const [skippedExerciseIds, setSkippedExerciseIds] = useState<Set<string>>(new Set());

  // Rest Timer State
  const [restSeconds, setRestSeconds] = useState<number | null>(null);
  const [isResting, setIsResting] = useState(false);

  // Modals
  const [isFinishConfirmOpen, setIsFinishConfirmOpen] = useState(false);
  const [isSkipConfirmOpen, setIsSkipConfirmOpen] = useState(false);
  const [completedSummary, setCompletedSummary] = useState<any | null>(null);

  // Load Session on Mount
  useEffect(() => {
    const loadSessionData = async () => {
      setLoading(true);
      try {
        let res;
        if (sessionId && sessionId !== 'active') {
          res = await api.get(`/workouts/sessions/${sessionId}`);
        } else {
          res = await api.get('/workouts/sessions/active');
        }

        if (res.data.success && res.data.data) {
          const sessData: WorkoutSession = res.data.data;
          setSession(sessData);

          // Find first uncompleted and unskipped exercise
          const firstUncompletedIdx = sessData.exercises?.findIndex((ex) =>
            ex.sets?.some((s) => !s.isCompleted)
          );
          if (firstUncompletedIdx !== undefined && firstUncompletedIdx >= 0) {
            setCurrentExerciseIndex(firstUncompletedIdx);
          }
        } else {
          setSession(null);
        }
      } catch (err: any) {
        console.error('Failed to load active workout session:', err);
        setError('Unable to load active workout session.');
      } finally {
        setLoading(false);
      }
    };

    loadSessionData();
  }, [sessionId]);

  // Accurate Elapsed Timer from backend startedAt timestamp
  useEffect(() => {
    if (!session?.startedAt || completedSummary) return;

    const calculateElapsed = () => {
      const startMs = new Date(session.startedAt).getTime();
      const nowMs = Date.now();
      setElapsedSeconds(Math.max(0, Math.floor((nowMs - startMs) / 1000)));
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000);
    return () => clearInterval(interval);
  }, [session, completedSummary]);

  // Rest Timer Countdown
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

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleSet = async (
    setId: string,
    currentWeight: number,
    currentReps: number,
    isCompletedStatus: boolean
  ) => {
    const nextStatus = !isCompletedStatus;

    // Optimistic UI Update
    setSession((prev) => {
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

      if (nextStatus) {
        // Start 90s Rest Timer
        setRestSeconds(90);
        setIsResting(true);
      }
    } catch (e) {
      console.error('Failed to save set completion status:', e);
    }
  };

  const handleUpdateSetValues = async (setId: string, weightKg: number, reps: number) => {
    setSession((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        exercises: prev.exercises.map((ex) => ({
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, weightKg, reps } : s)),
        })),
      };
    });

    try {
      await api.put(`/workouts/sets/${setId}`, { weightKg, reps });
    } catch (e) {
      console.error('Failed to update set values:', e);
    }
  };

  const handleSkipExercise = () => {
    if (!session) return;
    const currentEx = session.exercises[currentExerciseIndex];
    if (currentEx) {
      setSkippedExerciseIds((prev) => new Set(prev).add(currentEx.id));
    }
    setIsSkipConfirmOpen(false);

    // Move to next exercise if available
    if (currentExerciseIndex < session.exercises.length - 1) {
      setCurrentExerciseIndex((prev) => prev + 1);
    }
  };

  const handleConfirmFinish = async () => {
    if (!session) return;
    setIsFinishConfirmOpen(false);

    try {
      const res = await api.put(`/workouts/sessions/${session.id}/complete`, {
        durationSeconds: elapsedSeconds,
      });

      const finishedData = res.data.data;
      setCompletedSummary({
        title: session.title,
        durationMinutes: Math.max(1, Math.round(elapsedSeconds / 60)),
        exercisesCount: session.exercises.length,
        setsCount: finishedData.totalSets || 0,
        totalVolumeKg: finishedData.totalVolumeKg || 0,
        estimatedCalories: finishedData.caloriesBurned || 250,
        exercises: session.exercises,
      });
    } catch (e) {
      console.error('Failed to complete session:', e);
    }
  };

  const handleQuickStartNewSession = async () => {
    try {
      const res = await api.post('/workouts/sessions', {
        title: 'Lower Body Power & Core',
        exerciseIds: [],
      });
      if (res.data.success) {
        navigate(`/workouts/active/${res.data.data.id}`);
        window.location.reload();
      }
    } catch (e) {
      navigate('/workouts');
    }
  };

  // Render Loading State
  if (loading) {
    return (
      <div className="h-screen w-screen bg-background-dark flex flex-col items-center justify-center space-y-4 text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 animate-pulse">
          <Activity className="w-6 h-6" />
        </div>
        <p className="text-xs font-semibold">Loading active workout session...</p>
      </div>
    );
  }

  // Render Completed Summary View
  if (completedSummary) {
    return (
      <div className="h-screen w-screen bg-background-dark overflow-y-auto p-6 flex flex-col items-center justify-center text-slate-100 font-sans">
        <div className="w-full max-w-xl bg-surface-dark border border-brand-500/40 rounded-3xl p-8 shadow-2xl space-y-6 text-center relative my-auto">
          <div className="w-20 h-20 rounded-3xl bg-brand-600/20 border border-brand-500/40 text-brand-400 flex items-center justify-center mx-auto shadow-xl shadow-brand-600/30">
            <Trophy className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-400">WORKOUT COMPLETE</span>
            <h2 className="text-3xl font-black text-white mt-1">{completedSummary.title}</h2>
            <p className="text-xs text-slate-400 mt-1">Outstanding training session! All data persisted to database history.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-surface-elevated/70 border border-surface-border text-center">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Duration</span>
              <span className="text-xl font-black text-white flex items-center justify-center gap-1">
                <Clock className="w-4 h-4 text-brand-400" />
                {completedSummary.durationMinutes} min
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-elevated/70 border border-surface-border text-center">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Training Volume</span>
              <span className="text-xl font-black text-accent-emerald flex items-center justify-center gap-1">
                <Dumbbell className="w-4 h-4" />
                {completedSummary.totalVolumeKg.toLocaleString()} kg
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-elevated/70 border border-surface-border text-center">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Total Sets</span>
              <span className="text-xl font-black text-white">{completedSummary.setsCount} sets</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-elevated/70 border border-surface-border text-center">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Est. Calories</span>
              <span className="text-xl font-black text-accent-amber flex items-center justify-center gap-1">
                <Flame className="w-4 h-4" />
                {completedSummary.estimatedCalories} kcal
              </span>
            </div>
          </div>

          {/* Exercise Performance Breakdown */}
          <div className="space-y-2 text-left pt-2 border-t border-surface-border/50 max-h-48 overflow-y-auto pr-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">Performance Summary</span>
            {completedSummary.exercises?.map((ex: WorkoutSessionExercise) => {
              const isSkipped = skippedExerciseIds.has(ex.id);
              const completedCount = ex.sets?.filter((s) => s.isCompleted).length || 0;
              const exVol = ex.sets?.reduce((acc, s) => acc + (s.isCompleted ? s.weightKg * s.reps : 0), 0) || 0;
              return (
                <div key={ex.id} className="p-3 rounded-xl bg-surface-elevated/50 border border-surface-border/50 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white block">{ex.exercise?.name}</span>
                      {isSkipped && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          SKIPPED
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {isSkipped ? 'Skipped by user' : `${completedCount} sets completed`}
                    </span>
                  </div>
                  <span className="font-extrabold text-brand-400">{exVol.toLocaleString()} kg</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => navigate('/workouts')}
              className="w-full py-3.5 rounded-xl font-extrabold bg-brand-600 hover:bg-brand-500 text-white text-xs shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Back to Workouts Hub</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render No Active Workout State
  if (!session || !session.exercises || session.exercises.length === 0) {
    return (
      <div className="h-screen w-screen bg-background-dark flex items-center justify-center p-4 text-slate-100 font-sans">
        <div className="p-8 rounded-3xl bg-surface-dark border border-surface-border text-center space-y-4 max-w-md w-full shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-brand-600/20 text-brand-400 border border-brand-500/30 flex items-center justify-center mx-auto shadow-lg">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">No Active Workout Running</h3>
            <p className="text-xs text-slate-400 mt-1">Start a recommended session or select a plan from your Workouts Hub.</p>
          </div>
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={handleQuickStartNewSession}
              className="w-full py-3 rounded-xl font-extrabold bg-brand-600 hover:bg-brand-500 text-white text-xs shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Recommended Workout</span>
            </button>
            <button
              onClick={() => navigate('/workouts')}
              className="w-full py-3 rounded-xl font-bold bg-surface-elevated hover:bg-surface-border text-slate-300 text-xs border border-surface-border"
            >
              Back to Workouts Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculated Summary Metrics with Skipped Exercise Support
  const totalExercises = session.exercises.length;
  const currentExercise = session.exercises[currentExerciseIndex] || session.exercises[0];

  let completedExercisesCount = 0;
  let skippedExercisesCount = skippedExerciseIds.size;
  let totalSetsCount = 0;
  let completedSetsCount = 0;
  let currentVolumeKg = 0;

  session.exercises.forEach((ex) => {
    const isSkipped = skippedExerciseIds.has(ex.id);
    const isExDone = !isSkipped && ex.sets?.length > 0 && ex.sets.every((s) => s.isCompleted);
    if (isExDone) completedExercisesCount++;

    ex.sets?.forEach((s) => {
      totalSetsCount++;
      if (s.isCompleted) {
        completedSetsCount++;
        currentVolumeKg += s.weightKg * s.reps;
      }
    });
  });

  const remainingExercisesCount = Math.max(0, totalExercises - completedExercisesCount - skippedExercisesCount);
  const progressPercent = Math.round((completedSetsCount / (totalSetsCount || 1)) * 100);
  const durationMin = Math.max(1, Math.round(elapsedSeconds / 60));
  const estimatedCalories = Math.round(durationMin * 7.5);
  const isCurrentExerciseSkipped = currentExercise ? skippedExerciseIds.has(currentExercise.id) : false;

  return (
    <div className="h-screen w-screen bg-background-dark text-slate-100 flex flex-col font-sans select-none overflow-hidden">
      {/* 1. Fixed Top Header */}
      <header className="h-16 bg-surface-dark/95 backdrop-blur-md border-b border-surface-border px-4 lg:px-8 flex items-center justify-between flex-shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/workouts')}
            className="p-2 rounded-xl bg-surface-elevated hover:bg-surface-border text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-extrabold text-white text-sm sm:text-base tracking-tight truncate max-w-[200px] sm:max-w-md">
              {session.title}
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] text-brand-400 font-extrabold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
              <span>Active Tracker</span>
            </div>
          </div>
        </div>

        {/* Dynamic Timer */}
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600/15 border border-brand-500/30 text-brand-400 font-mono font-extrabold text-sm sm:text-base">
          <Clock className="w-4 h-4 text-brand-400" />
          <span>{formatTimer(elapsedSeconds)}</span>
        </div>

        {/* Finish Workout Green Button */}
        <button
          onClick={() => setIsFinishConfirmOpen(true)}
          className="px-4 py-2 rounded-xl font-extrabold bg-accent-emerald hover:bg-emerald-600 text-white text-xs shadow-lg shadow-emerald-600/20 transition-all active:scale-95 flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Finish Workout</span>
        </button>
      </header>

      {/* Floating Rest Timer Pill */}
      {isResting && restSeconds !== null && (
        <div className="bg-brand-600 text-white px-4 lg:px-8 py-2.5 flex items-center justify-between shadow-xl flex-shrink-0 z-20 border-b border-brand-500/40 animate-fadeIn">
          <div className="flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-wider">
            <Clock className="w-4 h-4 animate-pulse text-white" />
            <span>Rest Interval: <span className="font-mono text-sm">{formatTimer(restSeconds)}</span></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRestSeconds((prev) => (prev ? prev + 30 : 30))}
              className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-extrabold transition-colors"
            >
              +30s
            </button>
            <button
              onClick={() => setRestSeconds((prev) => (prev && prev > 30 ? prev - 30 : 5))}
              className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-extrabold transition-colors"
            >
              -30s
            </button>
            <button
              onClick={() => {
                setIsResting(false);
                setRestSeconds(null);
              }}
              className="px-3 py-1 rounded-lg bg-white text-brand-700 hover:bg-slate-100 text-xs font-extrabold shadow-sm transition-colors"
            >
              Skip Rest
            </button>
          </div>
        </div>
      )}

      {/* 2. Main Scrollable Content Area */}
      <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6 pb-20">
        {/* Workout Progress Bar Card */}
        <div className="p-5 rounded-2xl bg-surface-dark border border-surface-border space-y-3 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Workout Progress</span>
              <h3 className="text-base font-extrabold text-white">
                {completedExercisesCount} / {totalExercises} Exercises Done
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
              <span>Completed: <strong className="text-accent-emerald">{completedExercisesCount}</strong></span>
              <span>Skipped: <strong className="text-amber-400">{skippedExercisesCount}</strong></span>
              <span>Remaining: <strong className="text-white">{remainingExercisesCount}</strong></span>
              <span>Duration: <strong className="text-white">{durationMin} min</strong></span>
              <span>Calories: <strong className="text-accent-amber">{estimatedCalories} kcal</strong></span>
            </div>
          </div>

          <div className="w-full h-2.5 bg-surface-elevated rounded-full overflow-hidden border border-surface-border/50">
            <div
              className="h-full bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(5, progressPercent)}%` }}
            />
          </div>
        </div>

        {/* 3. Main 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)] gap-6 items-start">
          {/* LEFT COLUMN: Current Exercise & Set Tracker */}
          <div className="space-y-6">
            {/* Current Exercise Card */}
            <div className="p-6 rounded-2xl bg-surface-dark border border-brand-500/30 space-y-4 relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-600/20 text-brand-400 border border-brand-500/30">
                    CURRENT EXERCISE #{currentExerciseIndex + 1}
                  </span>
                  {isCurrentExerciseSkipped && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      SKIPPED
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsSkipConfirmOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-surface-elevated hover:bg-surface-border text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 border border-surface-border transition-colors"
                  >
                    <SkipForward className="w-3.5 h-3.5 text-slate-400" />
                    <span>Skip Exercise</span>
                  </button>

                  {currentExerciseIndex < totalExercises - 1 && (
                    <button
                      onClick={() => setCurrentExerciseIndex((prev) => Math.min(totalExercises - 1, prev + 1))}
                      className="px-3 py-1.5 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 text-brand-400 text-xs font-bold flex items-center gap-1 border border-brand-500/30 transition-colors"
                    >
                      <span>Next Exercise</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {currentExercise?.exercise?.name || 'Exercise'}
                </h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase bg-surface-elevated text-brand-400 border border-surface-border">
                    {currentExercise?.exercise?.primaryMuscle || currentExercise?.exercise?.muscleGroup || 'Full Body'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-surface-elevated text-slate-300 border border-surface-border">
                    Equipment: {currentExercise?.exercise?.equipment || 'Barbell'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-surface-elevated text-slate-300 border border-surface-border">
                    Difficulty: {currentExercise?.exercise?.difficulty || 'Intermediate'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-surface-border/50">
                <div className="p-3 rounded-xl bg-surface-elevated/60 border border-surface-border/60">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Target</span>
                  <span className="font-extrabold text-white text-sm">
                    {currentExercise?.sets?.length || 3} Sets × 10 Reps
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-elevated/60 border border-surface-border/60">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Rest Interval</span>
                  <span className="font-extrabold text-brand-400 text-sm">90 sec</span>
                </div>
              </div>
            </div>

            {/* Set Tracker Table */}
            <div className="p-6 rounded-2xl bg-surface-dark border border-surface-border space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-surface-border/50 pb-3">
                <h3 className="font-extrabold text-white text-base">Set Tracker</h3>
                <span className="text-xs font-bold text-brand-400 bg-brand-600/10 px-3 py-1 rounded-full border border-brand-500/20">
                  {currentExercise?.sets?.filter((s) => s.isCompleted).length || 0} / {currentExercise?.sets?.length || 0} Completed
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3">
                  <span className="col-span-2">SET</span>
                  <span className="col-span-3">PREVIOUS</span>
                  <span className="col-span-3">WEIGHT (KG)</span>
                  <span className="col-span-2">REPS</span>
                  <span className="col-span-2 text-right">STATUS</span>
                </div>

                {currentExercise?.sets?.map((set) => (
                  <div
                    key={set.id}
                    className={`grid grid-cols-12 gap-2 items-center p-3 rounded-xl border text-xs transition-all ${
                      set.isCompleted
                        ? 'bg-accent-emerald/10 border-accent-emerald/30 text-white'
                        : 'bg-surface-elevated border-surface-border/60 text-slate-200'
                    }`}
                  >
                    <span className="col-span-2 font-black text-slate-400 text-xs">SET {set.setNumber}</span>

                    <span className="col-span-3 text-slate-400 font-medium text-[11px]">
                      {set.previousWeightKg ? `${set.previousWeightKg}kg × ${set.previousReps}` : '60kg × 10'}
                    </span>

                    <div className="col-span-3">
                      <input
                        type="number"
                        value={set.weightKg}
                        onChange={(e) => handleUpdateSetValues(set.id, parseFloat(e.target.value) || 0, set.reps)}
                        className="w-full bg-surface-dark border border-surface-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => handleUpdateSetValues(set.id, set.weightKg, parseInt(e.target.value) || 0)}
                        className="w-full bg-surface-dark border border-surface-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="col-span-2 text-right">
                      <button
                        onClick={() => handleToggleSet(set.id, set.weightKg, set.reps, set.isCompleted)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1 ml-auto ${
                          set.isCompleted
                            ? 'bg-accent-emerald text-white shadow-md'
                            : 'bg-brand-600 hover:bg-brand-500 text-white shadow-sm'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{set.isCompleted ? 'Done' : 'Complete'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Secondary Skip Exercise Action Button Below Sets */}
              <div className="flex items-center justify-between pt-4 border-t border-surface-border/50 mt-4">
                <button
                  onClick={() => setIsSkipConfirmOpen(true)}
                  className="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface-border text-slate-300 text-xs font-semibold flex items-center gap-2 border border-surface-border transition-colors"
                >
                  <SkipForward className="w-4 h-4 text-slate-400" />
                  <span>Skip Exercise</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Today's Exercises, Summary & AI Coach Tip */}
          <div className="space-y-6">
            {/* Today's Exercises Panel */}
            <div className="p-6 rounded-2xl bg-surface-dark border border-surface-border space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-surface-border/50 pb-3">
                <h3 className="font-extrabold text-white text-base">Today's Exercises</h3>
                <span className="text-xs text-slate-400 font-semibold">{totalExercises} Total</span>
              </div>

              <div className="space-y-2">
                {session.exercises.map((exItem, idx) => {
                  const isSkipped = skippedExerciseIds.has(exItem.id);
                  const isDone = !isSkipped && exItem.sets?.length > 0 && exItem.sets.every((s) => s.isCompleted);
                  const isCurrent = idx === currentExerciseIndex;

                  return (
                    <button
                      key={exItem.id}
                      onClick={() => setCurrentExerciseIndex(idx)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                        isCurrent
                          ? 'bg-brand-600/15 border-brand-500 text-white shadow-md'
                          : isSkipped
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                          : isDone
                          ? 'bg-accent-emerald/10 border-accent-emerald/30 text-slate-300'
                          : 'bg-surface-elevated/60 border-surface-border/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="font-bold">
                          {isSkipped ? '⤸' : isDone ? '✓' : isCurrent ? '●' : '○'}
                        </span>
                        <span className="font-bold truncate">{exItem.exercise?.name || `Exercise ${idx + 1}`}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isSkipped && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            SKIPPED
                          </span>
                        )}
                        <span className="text-[11px] font-semibold flex-shrink-0 text-slate-400">
                          {exItem.sets?.length || 3} sets
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Compact Workout Summary */}
            <div className="p-6 rounded-2xl bg-surface-dark border border-surface-border space-y-3 shadow-sm">
              <h3 className="font-extrabold text-white text-sm uppercase tracking-wider text-slate-400">
                Session Metrics
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-surface-elevated/60 border border-surface-border/60">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Total Volume</span>
                  <span className="font-black text-accent-emerald text-base">{currentVolumeKg.toLocaleString()} kg</span>
                </div>

                <div className="p-3 rounded-xl bg-surface-elevated/60 border border-surface-border/60">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Sets Completed</span>
                  <span className="font-black text-white text-base">{completedSetsCount} / {totalSetsCount}</span>
                </div>
              </div>
            </div>

            {/* AI Coach Tip Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-surface-dark via-surface-elevated to-brand-600/10 border border-brand-500/30 space-y-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-[#865BC4]" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#7347B0] dark:text-brand-400">INTELLIGENT COACH TIP</span>
              </div>

              <p className="text-slate-300 text-xs leading-relaxed font-normal">
                You've completed {completedSetsCount} sets so far! Keep rest intervals around 90 seconds before starting your next heavy compound movement.
              </p>

              <Link
                to="/ai-trainer"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-brand-400 hover:text-brand-300 pt-1"
              >
                <span>Ask AI Coach</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modals */}
      {/* 1. Finish Confirmation Modal */}
      {isFinishConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-surface-dark border border-surface-border rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-accent-emerald/20 border border-accent-emerald/30 text-accent-emerald flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white">Finish Workout?</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                You have completed {completedExercisesCount} of {totalExercises} exercises ({completedSetsCount} sets total).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setIsFinishConfirmOpen(false)}
                className="py-2.5 rounded-xl font-bold bg-surface-elevated hover:bg-surface-border text-slate-300 text-xs border border-surface-border"
              >
                Continue Training
              </button>
              <button
                onClick={handleConfirmFinish}
                className="py-2.5 rounded-xl font-extrabold bg-accent-emerald hover:bg-emerald-600 text-white text-xs shadow-lg shadow-emerald-600/20"
              >
                Finish & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Skip Exercise Confirmation Modal */}
      {isSkipConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-surface-dark border border-surface-border rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-xl bg-accent-amber/20 border border-accent-amber/30 text-accent-amber flex items-center justify-center mx-auto">
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
                onClick={() => setIsSkipConfirmOpen(false)}
                className="py-2.5 rounded-xl font-bold bg-surface-elevated hover:bg-surface-border text-slate-300 text-xs border border-surface-border"
              >
                Cancel
              </button>
              <button
                onClick={handleSkipExercise}
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
