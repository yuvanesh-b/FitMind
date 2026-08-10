import React, { useState } from 'react';
import { api } from '../../services/api';
import { X, Dumbbell, Sparkles, Loader2, Check } from 'lucide-react';

interface GenerateAiWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const GenerateAiWorkoutModal: React.FC<GenerateAiWorkoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [goal, setGoal] = useState('MUSCLE_GAIN');
  const [experience, setExperience] = useState('INTERMEDIATE');
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [durationMin, setDurationMin] = useState(45);
  const [equipment, setEquipment] = useState('FULL_GYM');
  const [focusMuscle, setFocusMuscle] = useState('FULL_BODY');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/workouts/ai-generate', {
        goal,
        experience,
        daysPerWeek: Number(daysPerWeek),
        durationMin: Number(durationMin),
        equipment,
        focusMuscle,
      });

      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate AI workout plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30">
            <Dumbbell className="w-6 h-6 text-[#865BC4]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7347B0] dark:text-brand-400">Intelligent Workout Coach</span>
            </div>
            <h3 className="text-xl font-extrabold text-[var(--text-primary)]">Generate Workout Plan</h3>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-accent-rose/15 border border-accent-rose/30 text-accent-rose text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Goal */}
          <div>
            <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Fitness Goal</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'MUSCLE_GAIN', label: 'Muscle Gain' },
                { id: 'WEIGHT_LOSS', label: 'Weight Loss' },
                { id: 'STRENGTH', label: 'Strength' },
                { id: 'GENERAL_FITNESS', label: 'General Fitness' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setGoal(item.id)}
                  className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all ${
                    goal === item.id
                      ? 'bg-brand-600/20 border-brand-500 text-[var(--text-primary)]'
                      : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Experience & Days per week */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Experience Level</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-brand-500"
              >
                <option value="BEGINNER" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Beginner</option>
                <option value="INTERMEDIATE" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Intermediate</option>
                <option value="ADVANCED" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Days Per Week</label>
              <select
                value={daysPerWeek}
                onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-brand-500"
              >
                <option value={2} className="bg-[var(--bg-card)] text-[var(--text-primary)]">2 Days / Week</option>
                <option value={3} className="bg-[var(--bg-card)] text-[var(--text-primary)]">3 Days / Week</option>
                <option value={4} className="bg-[var(--bg-card)] text-[var(--text-primary)]">4 Days / Week</option>
                <option value={5} className="bg-[var(--bg-card)] text-[var(--text-primary)]">5 Days / Week</option>
                <option value={6} className="bg-[var(--bg-card)] text-[var(--text-primary)]">6 Days / Week</option>
              </select>
            </div>
          </div>

          {/* Duration & Equipment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Workout Duration</label>
              <select
                value={durationMin}
                onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-brand-500"
              >
                <option value={20} className="bg-[var(--bg-card)] text-[var(--text-primary)]">20 min</option>
                <option value={30} className="bg-[var(--bg-card)] text-[var(--text-primary)]">30 min</option>
                <option value={45} className="bg-[var(--bg-card)] text-[var(--text-primary)]">45 min</option>
                <option value={60} className="bg-[var(--bg-card)] text-[var(--text-primary)]">60 min</option>
                <option value={90} className="bg-[var(--bg-card)] text-[var(--text-primary)]">90 min</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Available Equipment</label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-brand-500"
              >
                <option value="BODYWEIGHT" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Bodyweight Only</option>
                <option value="DUMBBELL" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Dumbbells</option>
                <option value="BARBELL" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Barbell</option>
                <option value="FULL_GYM" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Full Gym Setup</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-extrabold bg-brand-600 hover:bg-brand-500 text-white text-xs shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating AI Plan...</span>
              </>
            ) : (
              <>
                <Dumbbell className="w-4 h-4" />
                <span>Generate Workout Plan</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
