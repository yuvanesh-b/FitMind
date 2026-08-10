import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Save, User, Scale, Flame, Shield, Award, CheckCircle } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [age, setAge] = useState(user?.profile?.age || 25);
  const [gender, setGender] = useState(user?.profile?.gender || 'MALE');
  const [heightCm, setHeightCm] = useState(user?.profile?.heightCm || 175);
  const [weightKg, setWeightKg] = useState(user?.profile?.weightKg || 70);
  const [targetWeightKg, setTargetWeightKg] = useState(user?.profile?.targetWeightKg || 68);
  const [fitnessLevel, setFitnessLevel] = useState(user?.profile?.fitnessLevel || 'INTERMEDIATE');
  const [workoutFrequencyDays, setWorkoutFrequencyDays] = useState(user?.profile?.workoutFrequencyDays || 4);
  const [preferredDurationMin, setPreferredDurationMin] = useState(user?.profile?.preferredDurationMin || 45);
  const [availableEquipment, setAvailableEquipment] = useState(user?.profile?.availableEquipment || 'FULL_GYM');
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user?.profile) {
      setAge(user.profile.age);
      setGender(user.profile.gender);
      setHeightCm(user.profile.heightCm);
      setWeightKg(user.profile.weightKg);
      if (user.profile.targetWeightKg) setTargetWeightKg(user.profile.targetWeightKg);
      setFitnessLevel(user.profile.fitnessLevel);
      setWorkoutFrequencyDays(user.profile.workoutFrequencyDays);
      setPreferredDurationMin(user.profile.preferredDurationMin);
      setAvailableEquipment(user.profile.availableEquipment);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSavedSuccess(false);

    try {
      await api.put('/profile', {
        age: Number(age),
        gender,
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        targetWeightKg: Number(targetWeightKg),
        fitnessLevel,
        workoutFrequencyDays: Number(workoutFrequencyDays),
        preferredDurationMin: Number(preferredDurationMin),
        availableEquipment,
      });
      await refreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Profile & Training Preferences">
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[var(--bg-main)] transition-colors duration-200">
        <div className="flex-1 overflow-y-auto min-h-0 py-6 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
              <div className="flex items-center justify-between bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">{user?.name}</h2>
                  <p className="text-xs text-[var(--text-secondary)]">{user?.email}</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl font-bold bg-[#865BC4] hover:bg-[#7347B0] text-white shadow-md shadow-[#865BC4]/20 text-xs flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  {savedSuccess ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Save className="w-4 h-4" />}
                  <span>{savedSuccess ? 'Saved!' : 'Save Changes'}</span>
                </button>
              </div>

              {/* Physical Stats Grid */}
              <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4 shadow-sm">
                <h3 className="font-bold text-[var(--text-primary)] text-base border-b border-[var(--border-subtle)] pb-3">Physical Metrics</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#865BC4]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={heightCm}
                      onChange={(e) => setHeightCm(Number(e.target.value))}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#865BC4]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Current Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#865BC4]"
                    />
                  </div>
                </div>
              </div>

              {/* Training Preferences Grid */}
              <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4 shadow-sm">
                <h3 className="font-bold text-[var(--text-primary)] text-base border-b border-[var(--border-subtle)] pb-3">AI Training Configuration</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Fitness Experience Level</label>
                    <select
                      value={fitnessLevel}
                      onChange={(e) => setFitnessLevel(e.target.value)}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#865BC4]"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Weekly Frequency Target</label>
                    <select
                      value={workoutFrequencyDays}
                      onChange={(e) => setWorkoutFrequencyDays(Number(e.target.value))}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#865BC4]"
                    >
                      <option value={3}>3 Days / Week</option>
                      <option value={4}>4 Days / Week</option>
                      <option value={5}>5 Days / Week</option>
                      <option value={6}>6 Days / Week</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Available Equipment</label>
                    <select
                      value={availableEquipment}
                      onChange={(e) => setAvailableEquipment(e.target.value)}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#865BC4]"
                    >
                      <option value="FULL_GYM">Full Gym Setup</option>
                      <option value="DUMBBELL">Dumbbells Only</option>
                      <option value="BODYWEIGHT">Bodyweight / No Equipment</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Session Duration Target</label>
                    <select
                      value={preferredDurationMin}
                      onChange={(e) => setPreferredDurationMin(Number(e.target.value))}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#865BC4]"
                    >
                      <option value={30}>30 Minutes</option>
                      <option value={45}>45 Minutes</option>
                      <option value={60}>60 Minutes</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
