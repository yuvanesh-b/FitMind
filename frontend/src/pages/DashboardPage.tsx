import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { SmartCoachInsight } from '../types/ai';
import { WorkoutSession } from '../types/workout';
import { Link, useNavigate } from 'react-router-dom';
import { WeeklyReportWidget } from '../components/dashboard/WeeklyReportWidget';
import {
  Bot,
  Dumbbell,
  Flame,
  Scale,
  TrendingUp,
  Play,
  ArrowRight,
  Activity,
  Plus,
  Compass,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [insight, setInsight] = useState<SmartCoachInsight | null>(null);
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [progressSummary, setProgressSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [insightRes, sessionsRes, progressRes] = await Promise.all([
          api.get('/ai/insight'),
          api.get('/workouts/sessions'),
          api.get('/progress'),
        ]);

        if (insightRes.data?.success) setInsight(insightRes.data.data);
        if (sessionsRes.data?.success) setRecentSessions(sessionsRes.data.data);
        if (progressRes.data?.success) setProgressSummary(progressRes.data.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleQuickStart = async () => {
    try {
      const res = await api.post('/workouts/sessions', {
        title: 'Lower Body & Core Hypertrophy',
        exerciseIds: [],
      });
      if (res.data?.success && res.data?.data?.id) {
        navigate(`/workouts/active/${res.data.data.id}`);
      } else {
        navigate('/workouts');
      }
    } catch (e) {
      navigate('/workouts');
    }
  };

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AppShell title="Dashboard">
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[var(--bg-main)] transition-colors duration-200">
        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto min-h-0 py-6 custom-scrollbar">
          {/* Reusable Common Parent Container (Strict 100% left/right edge alignment) */}
          <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6">
            {/* 1. Compact Dashboard Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
                  <span>{getTimeOfDayGreeting()}, {user?.name || 'Athlete'}</span>
                  <span className="text-2xl">👋</span>
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium mt-1">
                  Ready for today's training? Your AI coach recommendations are ready.
                </p>
              </div>

              <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-extrabold bg-[#865BC4]/15 text-[#865BC4] border border-[#865BC4]/30 whitespace-nowrap">
                {currentDateStr}
              </span>
            </div>

            {/* 2. Compact AI Coach Insight Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[#865BC4]/40 shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2 max-w-3xl">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#865BC4]/20 border border-[#865BC4]/30 flex items-center justify-center text-[#865BC4]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#865BC4]">
                    AI COACH INSIGHT
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <p className="text-xs sm:text-sm text-[var(--text-primary)] font-medium leading-relaxed">
                  {insight?.summary ||
                    'You are on track with your weekly goal. Today is a great opportunity for your lower-body session. Keep your intensity moderate and focus on controlled reps.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <Link
                  to="/ai-trainer"
                  className="px-4 py-2 rounded-xl font-bold bg-[#865BC4] hover:bg-[#7347B0] text-white text-xs shadow-md shadow-[#865BC4]/20 flex items-center gap-1.5 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask Coach</span>
                </Link>

                <button
                  onClick={handleQuickStart}
                  className="px-4 py-2 rounded-xl font-bold bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs flex items-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Workout</span>
                </button>
              </div>
            </div>

            {/* 3. Key Fitness Stats (EXACTLY 4 equal-width cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              {/* Card 1: Current Weight */}
              <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col justify-between shadow-sm hover:border-[#865BC4]/40 transition-all">
                <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Current Weight</span>
                  <Scale className="w-4 h-4 text-[#865BC4]" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] my-1">
                  {progressSummary?.currentWeight || user?.profile?.weightKg || 70}{' '}
                  <span className="text-xs font-normal text-[var(--text-secondary)]">kg</span>
                </p>
                <p className="text-xs text-emerald-600 font-semibold">
                  Target: {user?.profile?.targetWeightKg || 'Maintain'} kg
                </p>
              </div>

              {/* Card 2: Weekly Sessions */}
              <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col justify-between shadow-sm hover:border-[#865BC4]/40 transition-all">
                <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Weekly Sessions</span>
                  <Dumbbell className="w-4 h-4 text-[#865BC4]" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] my-1">
                  {progressSummary?.totalWorkouts || recentSessions.length || 0} / {user?.profile?.workoutFrequencyDays || 4}
                </p>
                <p className="text-xs text-emerald-600 font-semibold">Goal on track</p>
              </div>

              {/* Card 3: Training Volume */}
              <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col justify-between shadow-sm hover:border-[#865BC4]/40 transition-all">
                <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Training Volume</span>
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] my-1">
                  {(progressSummary?.totalVolumeKg || 1240).toLocaleString()}{' '}
                  <span className="text-xs font-normal text-[var(--text-secondary)]">kg</span>
                </p>
                <p className="text-xs text-emerald-600 font-semibold">+12% this week</p>
              </div>

              {/* Card 4: Active Streak */}
              <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col justify-between shadow-sm hover:border-[#865BC4]/40 transition-all">
                <div className="flex items-center justify-between text-[var(--text-secondary)] mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">Active Streak</span>
                  <Flame className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] my-1">
                  4 <span className="text-xs font-normal text-[var(--text-secondary)]">days</span>
                </p>
                <p className="text-xs text-amber-500 font-semibold">Consistency unlocked</p>
              </div>
            </div>

            {/* 4. Desktop 70% / 30% Main Content Grid: Today's Workout + Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Today's Workout (lg:col-span-8 ~67-70% width) */}
              <div className="lg:col-span-8 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-[var(--border-subtle)] pb-3">
                    <div>
                      <span className="text-[10px] font-extrabold text-[#865BC4] uppercase tracking-wider block">
                        TODAY'S WORKOUT
                      </span>
                      <h3 className="text-xl font-extrabold text-[var(--text-primary)] mt-0.5">Lower Body & Core Hypertrophy</h3>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#865BC4]/15 text-[#865BC4] border border-[#865BC4]/30">
                      45 min • Intermediate
                    </span>
                  </div>

                  {/* 3 Exercise Summary Rows */}
                  <div className="space-y-2.5 mb-6">
                    <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[var(--text-primary)] text-sm">Barbell Squat</span>
                      <span className="font-semibold text-[var(--text-secondary)]">4 sets × 8 reps</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[var(--text-primary)] text-sm">Romanian Deadlift</span>
                      <span className="font-semibold text-[var(--text-secondary)]">3 sets × 10 reps</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[var(--text-primary)] text-sm">Walking Lunges</span>
                      <span className="font-semibold text-[var(--text-secondary)]">3 sets × 12 reps</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleQuickStart}
                  className="w-full py-3.5 rounded-xl font-extrabold bg-[#865BC4] hover:bg-[#7347B0] text-white shadow-lg shadow-[#865BC4]/20 text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Workout Now</span>
                </button>
              </div>

              {/* Recent Activity (lg:col-span-4 ~30-33% width) */}
              <div className="lg:col-span-4 p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-[var(--border-subtle)] pb-3">
                    <h3 className="text-base font-extrabold text-[var(--text-primary)]">Recent Activity</h3>
                    <Link to="/workouts" className="text-xs font-bold text-[#865BC4] hover:underline flex items-center gap-1">
                      <span>View all</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {recentSessions.length === 0 ? (
                    <div className="py-8 text-center text-[var(--text-secondary)] text-xs">
                      <Activity className="w-8 h-8 mx-auto mb-2 opacity-50 text-[var(--text-secondary)]" />
                      <p className="font-bold text-[var(--text-primary)]">No workouts logged yet.</p>
                      <p className="text-[11px] text-[var(--text-secondary)] mt-1">Start your first workout to record history.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {recentSessions.slice(0, 3).map((session) => (
                        <div
                          key={session.id}
                          className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-bold text-[var(--text-primary)] text-xs">{session.title}</p>
                            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 font-medium">
                              {new Date(session.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {Math.round(session.durationSeconds / 60 || 45)} min
                            </p>
                          </div>
                          <span className="font-extrabold text-[#865BC4] text-xs">
                            {session.totalVolumeKg || 0} kg
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 5. Weekly Fitness Report Widget */}
            <WeeklyReportWidget />

            {/* 6. Quick Actions Bar */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
              <span className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-wider">
                Quick Actions
              </span>

              <div className="grid grid-cols-2 sm:flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={handleQuickStart}
                  className="px-3.5 py-2 rounded-xl bg-[#865BC4] hover:bg-[#7347B0] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Workout</span>
                </button>

                <Link
                  to="/ai-trainer"
                  className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] flex items-center justify-center gap-1.5 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-[#865BC4]" />
                  <span>Ask AI Coach</span>
                </Link>

                <Link
                  to="/nutrition"
                  className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] flex items-center justify-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Log Food</span>
                </Link>

                <Link
                  to="/progress"
                  className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] flex items-center justify-center gap-1.5 transition-all"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-500" />
                  <span>Track Progress</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
