import React, { useState } from 'react';
import { WorkoutSession } from '../../types/workout';
import { Dumbbell, Calendar, Flame, TrendingUp, Eye, X } from 'lucide-react';

interface HistoryTabProps {
  sessions: WorkoutSession[];
  loading?: boolean;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ sessions, loading }) => {
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[var(--bg-surface)] rounded-2xl" />
          ))}
        </div>
        <div className="h-40 bg-[var(--bg-surface)] rounded-2xl" />
      </div>
    );
  }

  const completedSessions = sessions.filter((s) => s.status === 'COMPLETED');
  const totalVolume = completedSessions.reduce((acc, s) => acc + (s.totalVolumeKg || 0), 0);

  // Compute workouts completed this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const thisWeekCount = completedSessions.filter((s) => new Date(s.startedAt) >= oneWeekAgo).length;

  return (
    <div className="space-y-6">
      {/* 1. Workout History Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Total Workouts</span>
            <Dumbbell className="w-4 h-4 text-[#865BC4]" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">{completedSessions.length}</p>
          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Completed sessions</p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">This Week</span>
            <Calendar className="w-4 h-4 text-[#865BC4]" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">{thisWeekCount}</p>
          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">Sessions logged</p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Current Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">4 <span className="text-xs font-normal text-[var(--text-secondary)]">days</span></p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 font-semibold">Active consistency</p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm">
          <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Total Volume</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-[var(--text-primary)]">{totalVolume.toLocaleString()} <span className="text-xs font-normal text-[var(--text-secondary)]">kg</span></p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">Cumulative load</p>
        </div>
      </div>

      {/* 2. Workout History List */}
      {completedSessions.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center text-[var(--text-secondary)] text-xs shadow-sm">
          No completed workout history logged yet. Complete a workout session to see history records.
        </div>
      ) : (
        <div className="space-y-3">
          {completedSessions.map((session) => (
            <div
              key={session.id}
              className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[#865BC4]/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
            >
              <div>
                <span className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider block mb-0.5">
                  {new Date(session.startedAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <h4 className="font-extrabold text-[var(--text-primary)] text-base">{session.title}</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {session.exercises?.length || 0} exercises • {Math.round((session.durationSeconds || 0) / 60)} minutes
                </p>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <span className="text-base font-black text-[#865BC4] block">
                    {(session.totalVolumeKg || 0).toLocaleString()} kg
                  </span>
                  <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase">Training Volume</span>
                </div>

                <button
                  onClick={() => setSelectedSession(session)}
                  className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs flex items-center gap-1.5 border border-[var(--border-subtle)] transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedSession(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#865BC4]">Workout History Record</span>
              <h3 className="text-xl font-extrabold text-[var(--text-primary)]">{selectedSession.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Logged on {new Date(selectedSession.startedAt).toLocaleString()}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center text-xs">
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)] block">Duration</span>
                <span className="font-extrabold text-[var(--text-primary)]">{Math.round((selectedSession.durationSeconds || 0) / 60)} min</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)] block">Total Sets</span>
                <span className="font-extrabold text-[var(--text-primary)]">{selectedSession.totalSets || 0} sets</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[var(--text-secondary)] block">Total Volume</span>
                <span className="font-extrabold text-[#865BC4]">{(selectedSession.totalVolumeKg || 0).toLocaleString()} kg</span>
              </div>
            </div>

            {/* Exercise-by-Exercise Breakdown */}
            <div className="space-y-3 pt-2">
              {selectedSession.exercises?.map((exItem) => (
                <div key={exItem.id} className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2">
                  <span className="font-bold text-[var(--text-primary)] text-sm block">{exItem.exercise?.name || 'Exercise'}</span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    {exItem.sets?.map((set) => (
                      <div key={set.id} className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-between">
                        <span className="font-semibold text-[var(--text-secondary)]">Set {set.setNumber}</span>
                        <span className="font-bold text-[var(--text-primary)]">{set.weightKg}kg × {set.reps}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
