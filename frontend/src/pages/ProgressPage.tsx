import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { api } from '../services/api';
import { ProgressSummary } from '../types/progress';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
import { Scale, TrendingUp, Plus, Dumbbell, Award, X } from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weightKg, setWeightKg] = useState('');
  const [chestCm, setChestCm] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [armsCm, setArmsCm] = useState('');
  const [bodyFat, setBodyFat] = useState('');

  const loadProgress = async () => {
    try {
      const res = await api.get('/progress');
      if (res.data.success) {
        setProgress(res.data.data);
      }
    } catch (e) {
      console.error('Failed to load progress:', e);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const handleAddMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg) return;

    try {
      await api.post('/progress/measurements', {
        weightKg: Number(weightKg),
        chestCm: chestCm ? Number(chestCm) : undefined,
        waistCm: waistCm ? Number(waistCm) : undefined,
        armsCm: armsCm ? Number(armsCm) : undefined,
        bodyFatPercentage: bodyFat ? Number(bodyFat) : undefined,
      });
      setIsModalOpen(false);
      loadProgress();
    } catch (err) {
      console.error('Failed to add measurement:', err);
    }
  };

  // Format Recharts Data
  const weightChartData = progress?.measurements.map((m) => ({
    date: new Date(m.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: m.weightKg,
  })) || [];

  const volumeChartData = progress?.recentSessions.map((s) => ({
    date: new Date(s.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: s.totalVolumeKg,
  })) || [];

  return (
    <AppShell title="Progress & Analytics">
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[var(--bg-main)] transition-colors duration-200">
        <div className="flex-1 overflow-y-auto min-h-0 py-6 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6">
            
            {/* Header & Action CTAs */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--bg-card)] p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
              <div>
                <h2 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">Body Metrics & Strength Progression</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Track bodyweight trends, total volume load, and measurement changes</p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Link
                  to="/progress/weekly-reports"
                  className="px-4 py-2.5 rounded-xl font-bold bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[#865BC4] border border-[#865BC4]/30 text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Award className="w-4 h-4 text-[#865BC4]" />
                  <span>AI Weekly Reports</span>
                </Link>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl font-bold bg-[#865BC4] hover:bg-[#7347B0] text-white shadow-md shadow-[#865BC4]/20 text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Measurements</span>
                </button>
              </div>
            </div>

            {/* Stats Cards (4 Columns Desktop, 2 Medium, 1 Small with 24px gap) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Current Weight</span>
                <p className="text-2xl font-extrabold text-[var(--text-primary)] mt-2">{progress?.currentWeight || 70} <span className="text-sm font-normal text-[var(--text-secondary)]">kg</span></p>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Starting Weight</span>
                <p className="text-2xl font-extrabold text-[var(--text-primary)] mt-2">{progress?.startingWeight || 70} <span className="text-sm font-normal text-[var(--text-secondary)]">kg</span></p>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Total Sessions</span>
                <p className="text-2xl font-extrabold text-[var(--text-primary)] mt-2">{progress?.totalWorkouts || 0}</p>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Volume Loaded</span>
                <p className="text-2xl font-extrabold text-[var(--text-primary)] mt-2">{(progress?.totalVolumeKg || 0).toLocaleString()} <span className="text-sm font-normal text-[var(--text-secondary)]">kg</span></p>
              </div>
            </div>

            {/* Charts Grid (2 Columns Desktop, 1 Column Small with 24px gap) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weight Chart */}
              <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] min-w-0 shadow-sm">
                <h3 className="font-bold text-[var(--text-primary)] text-base mb-4">Bodyweight Trend (kg)</h3>
                <div className="h-64 w-full min-w-0">
                  {weightChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                        <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={11} />
                        <YAxis stroke="var(--text-secondary)" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                        <Line type="monotone" dataKey="weight" stroke="#865BC4" strokeWidth={3} dot={{ fill: '#865BC4' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[var(--text-secondary)] text-xs">No weight records logged yet.</div>
                  )}
                </div>
              </div>

              {/* Volume Chart */}
              <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] min-w-0 shadow-sm">
                <h3 className="font-bold text-[var(--text-primary)] text-base mb-4">Workout Volume Load (kg)</h3>
                <div className="h-64 w-full min-w-0">
                  {volumeChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={volumeChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                        <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={11} />
                        <YAxis stroke="var(--text-secondary)" fontSize={11} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                        <Bar dataKey="volume" fill="#865BC4" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[var(--text-secondary)] text-xs">No workout volume history logged yet.</div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Log Measurement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl space-y-4 relative text-[var(--text-primary)]">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 rounded-xl bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-[var(--text-primary)]">Log Body Measurements</h3>

            <form onSubmit={handleAddMeasurement} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Bodyweight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  placeholder="72.5"
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#865BC4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Chest (cm)</label>
                  <input
                    type="number"
                    value={chestCm}
                    onChange={(e) => setChestCm(e.target.value)}
                    placeholder="98"
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#865BC4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Waist (cm)</label>
                  <input
                    type="number"
                    value={waistCm}
                    onChange={(e) => setWaistCm(e.target.value)}
                    placeholder="80"
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[#865BC4]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold bg-[#865BC4] hover:bg-[#7347B0] text-white text-xs shadow-md shadow-[#865BC4]/20 transition-all mt-2"
              >
                Save Record
              </button>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
};
