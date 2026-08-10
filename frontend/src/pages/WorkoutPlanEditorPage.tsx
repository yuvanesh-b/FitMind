import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { api } from '../services/api';
import { Exercise } from '../types/workout';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft, Dumbbell } from 'lucide-react';

export const WorkoutPlanEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await api.get('/exercises');
        if (res.data.success) {
          setAllExercises(res.data.data);
        }
      } catch (e) {
        console.error('Failed to load exercises:', e);
      }
    };
    fetchExercises();
  }, []);

  const handleToggleExercise = (id: string) => {
    setSelectedExerciseIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || selectedExerciseIds.length === 0) return;

    setLoading(true);
    try {
      await api.post('/workouts/plans', {
        name,
        description,
        days: [
          {
            dayName: 'Day 1',
            targetMuscles: 'Full Body',
            exercises: selectedExerciseIds.map((id, idx) => ({
              exerciseId: id,
              order: idx + 1,
              targetSets: 3,
              targetReps: 10,
              restSeconds: 60,
            })),
          },
        ],
      });
      navigate('/workouts');
    } catch (err) {
      console.error('Failed to save plan:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="New Workout Plan">
      <form onSubmit={handleSavePlan} className="max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => navigate('/workouts')} className="flex items-center gap-2 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Workouts</span>
          </button>

          <button
            type="submit"
            disabled={loading || !name || selectedExerciseIds.length === 0}
            className="px-5 py-2.5 rounded-xl font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/30 text-xs flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Save Plan</span>
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-surface-dark border border-surface-border space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Plan Title
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Upper Body Hypertrophy"
              className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe goals, target muscle split, or frequency..."
              className="w-full bg-surface-elevated border border-surface-border rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Exercise Selection Grid */}
        <div className="p-6 rounded-2xl bg-surface-dark border border-surface-border">
          <h3 className="font-bold text-white text-base mb-4">Select Exercises ({selectedExerciseIds.length} chosen)</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
            {allExercises.map((ex) => {
              const isSelected = selectedExerciseIds.includes(ex.id);
              return (
                <div
                  key={ex.id}
                  onClick={() => handleToggleExercise(ex.id)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                    isSelected
                      ? 'bg-brand-600/20 border-brand-500 text-white'
                      : 'bg-surface-elevated border-surface-border text-slate-400 hover:text-white'
                  }`}
                >
                  <div>
                    <p className="font-bold text-white">{ex.name}</p>
                    <p className="text-[10px] text-slate-400">{ex.muscleGroup} • {ex.equipment}</p>
                  </div>
                  {isSelected && <span className="text-brand-500 font-bold">✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      </form>
    </AppShell>
  );
};
