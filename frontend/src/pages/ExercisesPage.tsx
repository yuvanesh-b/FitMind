import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { api } from '../services/api';
import { Exercise, WorkoutPlan } from '../types/workout';
import { Search, Info, X, Dumbbell, Plus, RefreshCw, AlertCircle, CheckCircle2, Clock, ShieldAlert, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ExercisesPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null);
  const [addToWorkoutExercise, setAddToWorkoutExercise] = useState<Exercise | null>(null);
  const [userPlans, setUserPlans] = useState<WorkoutPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('NEW');
  const [targetSets, setTargetSets] = useState(3);
  const [targetReps, setTargetReps] = useState(10);
  const [weightKg, setWeightKg] = useState(50);
  const [restSeconds, setRestSeconds] = useState(60);
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  const categories = [
    { label: 'All Muscles', value: '' },
    { label: 'Chest', value: 'CHEST' },
    { label: 'Back', value: 'BACK' },
    { label: 'Shoulders', value: 'SHOULDERS' },
    { label: 'Biceps', value: 'BICEPS' },
    { label: 'Triceps', value: 'TRICEPS' },
    { label: 'Quads', value: 'QUADS' },
    { label: 'Hamstrings', value: 'HAMSTRINGS' },
    { label: 'Glutes', value: 'GLUTES' },
    { label: 'Core', value: 'CORE' },
    { label: 'Cardio', value: 'CARDIO' },
    { label: 'Full Body', value: 'FULL_BODY' },
  ];

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch exercises from REST API
  const fetchExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/exercises', {
        params: {
          search: debouncedSearch || undefined,
          muscle: selectedMuscle || undefined,
          difficulty: selectedDifficulty || undefined,
          equipment: selectedEquipment || undefined,
          limit: 100,
        },
      });

      if (res.data.success) {
        setExercises(res.data.data);
      } else {
        setError('Failed to fetch exercises.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExercises();
  }, [debouncedSearch, selectedMuscle, selectedDifficulty, selectedEquipment]);

  // Fetch user plans when opening Add To Workout Modal
  const openAddToWorkoutModal = async (ex: Exercise) => {
    setAddToWorkoutExercise(ex);
    setTargetSets(ex.setsRecommendation || 3);
    setRestSeconds(ex.restSeconds || 60);
    try {
      const res = await api.get('/workouts/plans');
      if (res.data.success) {
        setUserPlans(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load user workout plans:', e);
    }
  };

  const handleSaveToWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addToWorkoutExercise) return;

    setAddLoading(true);
    setAddSuccess(false);

    try {
      if (selectedPlanId === 'NEW') {
        await api.post('/workouts/plans', {
          name: `${addToWorkoutExercise.name} Session`,
          description: `Custom workout containing ${addToWorkoutExercise.name}`,
          days: [
            {
              dayName: 'Day 1',
              targetMuscles: addToWorkoutExercise.muscleGroup,
              exercises: [
                {
                  exerciseId: addToWorkoutExercise.id,
                  order: 1,
                  targetSets,
                  targetReps,
                  restSeconds,
                },
              ],
            },
          ],
        });
      } else {
        const res = await api.post('/workouts/sessions', {
          planId: selectedPlanId,
          title: `${addToWorkoutExercise.name} Workout`,
          exerciseIds: [addToWorkoutExercise.id],
        });
        if (res.data.success) {
          navigate(`/workouts/active/${res.data.data.id}`);
          return;
        }
      }

      setAddSuccess(true);
      setTimeout(() => {
        setAddSuccess(false);
        setAddToWorkoutExercise(null);
      }, 1500);
    } catch (err) {
      console.error('Failed to add exercise to workout:', err);
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <AppShell title="Exercise Library">
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[var(--bg-main)] transition-colors duration-200">
        {/* Scrollable Main Area Container */}
        <div className="flex-1 overflow-y-auto min-h-0 py-6 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6">
            
            {/* 1. Header & Search Bar Box */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--bg-card)] p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
              <div>
                <h2 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">Comprehensive Exercise Database</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Explore 100+ verified exercises with target muscle groups, equipment guides, and workout integration
                </p>
              </div>

              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exercises by name..."
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#865BC4] transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Category Filter Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map((cat) => {
                const isActive = selectedMuscle === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedMuscle(cat.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-150 border ${
                      isActive
                        ? 'bg-[#865BC4] text-white border-[#865BC4] shadow-sm shadow-[#865BC4]/20'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* 3. Loading Skeleton */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 space-y-4 animate-pulse shadow-sm">
                    <div className="w-3/4 h-6 bg-[var(--bg-surface)] rounded-lg" />
                    <div className="w-1/2 h-4 bg-[var(--bg-surface)] rounded-full" />
                    <div className="w-full h-12 bg-[var(--bg-surface)] rounded-xl" />
                    <div className="w-full h-10 bg-[var(--bg-surface)] rounded-xl" />
                  </div>
                ))}
              </div>
            )}

            {/* 4. Error State */}
            {!loading && error && (
              <div className="p-8 rounded-2xl bg-[var(--bg-card)] border border-rose-500/30 text-center space-y-4 max-w-md mx-auto my-8 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-rose-500/15 text-rose-600 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">Failed to Load Exercises</h3>
                  <p className="text-xs text-[var(--text-secondary)]">{error}</p>
                </div>
                <button
                  onClick={fetchExercises}
                  className="px-5 py-2.5 rounded-xl font-bold bg-[#865BC4] hover:bg-[#7347B0] text-white text-xs flex items-center justify-center gap-2 mx-auto shadow-md shadow-[#865BC4]/20 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Connection</span>
                </button>
              </div>
            )}

            {/* 5. Empty State */}
            {!loading && !error && exercises.length === 0 && (
              <div className="p-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center space-y-3 max-w-md mx-auto my-8 shadow-sm">
                <Dumbbell className="w-12 h-12 text-[var(--text-secondary)] mx-auto opacity-50" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">No exercises found</h3>
                <p className="text-xs text-[var(--text-secondary)]">No exercises match your current search or muscle category filter.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedMuscle('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)]"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* 6. Exercise Grid */}
            {!loading && !error && exercises.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exercises.map((ex) => (
                  <div
                    key={ex.id}
                    className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[#865BC4]/40 transition-all duration-200 p-5 flex flex-col justify-between group shadow-sm"
                  >
                    <div>
                      {/* Exercise Name */}
                      <h3 className="text-lg font-extrabold uppercase text-[var(--text-primary)] tracking-tight leading-snug break-words mb-2 group-hover:text-[#865BC4] transition-colors">
                        {ex.name}
                      </h3>

                      {/* Muscle Group • Equipment • Difficulty */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px] font-bold text-[#865BC4]">
                        <span className="px-2 py-0.5 rounded-full bg-[#865BC4]/15 text-[#865BC4] border border-[#865BC4]/30 uppercase tracking-wider">
                          {ex.muscleGroup}
                        </span>
                        <span className="text-[var(--text-secondary)]">•</span>
                        <span className="text-[var(--text-primary)]">{ex.equipment}</span>
                        <span className="text-[var(--text-secondary)]">•</span>
                        <span className="text-[var(--text-secondary)]">{ex.difficulty}</span>
                      </div>

                      {/* Sets × Reps & Rest Time */}
                      <div className="px-3 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] mb-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {ex.setsRecommendation || 3} Sets × {ex.repsRecommendation || '8-12'} Reps
                        </span>
                        <span className="text-[11px] font-medium text-[var(--text-secondary)] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#865BC4]" />
                          {ex.restSeconds || 60}s rest
                        </span>
                      </div>

                      {/* Short Description */}
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4 line-clamp-2">
                        {ex.description}
                      </p>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-subtle)] mt-auto">
                      <button
                        onClick={() => setDetailExercise(ex)}
                        className="flex-1 py-2 px-3 rounded-xl font-semibold bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] text-xs flex items-center justify-center gap-1.5 transition-colors border border-[var(--border-subtle)]"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={() => openAddToWorkoutModal(ex)}
                        className="py-2 px-3 rounded-xl font-bold bg-[#865BC4] hover:bg-[#7347B0] text-white text-xs flex items-center gap-1 transition-all shadow-md shadow-[#865BC4]/20"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Exercise Details Modal */}
      {detailExercise && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto text-[var(--text-primary)]">
            <button
              onClick={() => setDetailExercise(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Title & Badges */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#865BC4]/15 text-[#865BC4] border border-[#865BC4]/30">
                  {detailExercise.muscleGroup}
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
                  {detailExercise.equipment}
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                  {detailExercise.difficulty}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[var(--text-primary)]">{detailExercise.name}</h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">{detailExercise.description}</p>
            </div>

            {/* Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)] block mb-0.5">Primary Muscle</span>
                <span className="font-bold text-[var(--text-primary)]">{detailExercise.primaryMuscle || detailExercise.muscleGroup}</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)] block mb-0.5">Equipment</span>
                <span className="font-bold text-[var(--text-primary)]">{detailExercise.equipment}</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)] block mb-0.5">Recommended</span>
                <span className="font-bold text-[var(--text-primary)]">{detailExercise.setsRecommendation} Sets × {detailExercise.repsRecommendation} Reps</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)] block mb-0.5">Rest Period</span>
                <span className="font-bold text-[var(--text-primary)]">{detailExercise.restSeconds} seconds</span>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2">Step-by-Step Instructions</h4>
              <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-subtle)] whitespace-pre-line">
                {detailExercise.instructions}
              </p>
            </div>

            {/* Modal Footer Action */}
            <div className="pt-2">
              <button
                onClick={() => {
                  const ex = detailExercise;
                  setDetailExercise(null);
                  openAddToWorkoutModal(ex);
                }}
                className="w-full py-3.5 rounded-xl font-extrabold bg-[#865BC4] hover:bg-[#7347B0] text-white text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-[#865BC4]/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Workout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add To Workout Modal */}
      {addToWorkoutExercise && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl space-y-4 relative text-[var(--text-primary)]">
            <button
              onClick={() => setAddToWorkoutExercise(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#865BC4]">Save to Workout Plan</span>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Add "{addToWorkoutExercise.name}" to Workout</h3>
            </div>

            {addSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 text-center text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Exercise saved to your workout!</span>
              </div>
            ) : (
              <form onSubmit={handleSaveToWorkout} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Workout Plan / Action</label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#865BC4]"
                  >
                    <option value="NEW">+ Create New Plan with this exercise</option>
                    {userPlans.map((p) => (
                      <option key={p.id} value={p.id}>Start Active Session ({p.name})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Target Sets</label>
                    <input
                      type="number"
                      required
                      value={targetSets}
                      onChange={(e) => setTargetSets(Number(e.target.value))}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#865BC4]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Target Reps</label>
                    <input
                      type="number"
                      required
                      value={targetReps}
                      onChange={(e) => setTargetReps(Number(e.target.value))}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#865BC4]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#865BC4]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Rest Time (sec)</label>
                    <input
                      type="number"
                      value={restSeconds}
                      onChange={(e) => setRestSeconds(Number(e.target.value))}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[#865BC4]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={addLoading}
                  className="w-full py-3 rounded-xl font-bold bg-[#865BC4] hover:bg-[#7347B0] text-white text-xs shadow-md shadow-[#865BC4]/20 transition-all disabled:opacity-50 mt-2"
                >
                  {addLoading ? 'Saving to Database...' : 'Save to Workout'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </AppShell>
  );
};
