import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Exercise } from '../../types/workout';
import { X, Trash2, Loader2 } from 'lucide-react';

interface CustomPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CustomPlanModal: React.FC<CustomPlanModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.get('/exercises').then((res) => {
        if (res.data.success) setAvailableExercises(res.data.data);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddExercise = (exerciseId: string) => {
    if (!selectedExerciseIds.includes(exerciseId)) {
      setSelectedExerciseIds([...selectedExerciseIds, exerciseId]);
    }
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setSelectedExerciseIds(selectedExerciseIds.filter((id) => id !== exerciseId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a plan name.');
      return;
    }
    if (selectedExerciseIds.length === 0) {
      setError('Please select at least one exercise.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      name,
      description,
      days: [
        {
          dayName: 'Day 1 — Main Session',
          targetMuscles: 'Full Body',
          exercises: selectedExerciseIds.map((exId, idx) => ({
            exerciseId: exId,
            order: idx + 1,
            targetSets: 3,
            targetReps: 10,
            restSeconds: 60,
          })),
        },
      ],
    };

    try {
      const res = await api.post('/workouts/plans', payload);
      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create custom plan.');
    } finally {
      setLoading(false);
    }
  };  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-400">Custom Plan Builder</span>
          <h3 className="text-xl font-extrabold text-[var(--text-primary)]">Create Custom Workout Plan</h3>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-accent-rose/15 border border-accent-rose/30 text-accent-rose text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Plan Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 4-Day Push Pull Legs Split"
              className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-brand-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Plan description, targets, and notes..."
              className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">
              Select Exercises ({selectedExerciseIds.length} added)
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) handleAddExercise(e.target.value);
              }}
              defaultValue=""
              className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-brand-500 mb-3"
            >
              <option value="" disabled className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                Choose an exercise from Exercise Library
              </option>
              {availableExercises.map((ex) => (
                <option key={ex.id} value={ex.id} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                  {ex.name} ({ex.category})
                </option>
              ))}
            </select>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {selectedExerciseIds.map((exId, idx) => {
                const ex = availableExercises.find((e) => e.id === exId);
                return (
                  <div
                    key={exId}
                    className="p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-[var(--text-primary)]">
                      {idx + 1}. {ex?.name || 'Exercise'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveExercise(exId)}
                      className="p-1 rounded text-[var(--text-secondary)] hover:text-accent-rose"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-extrabold bg-brand-600 hover:bg-brand-500 text-white text-xs shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center disabled:opacity-50 mt-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Plan...</span>
              </div>
            ) : (
              <span>Save Workout Plan</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
