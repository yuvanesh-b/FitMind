import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { api } from '../services/api';
import { WorkoutPlan, WorkoutSession } from '../types/workout';
import { MyPlansTab } from '../components/workouts/MyPlansTab';
import { ActiveWorkoutTab } from '../components/workouts/ActiveWorkoutTab';
import { HistoryTab } from '../components/workouts/HistoryTab';
import { GenerateAiWorkoutModal } from '../components/workouts/GenerateAiWorkoutModal';
import { CustomPlanModal } from '../components/workouts/CustomPlanModal';
import { ViewPlanModal } from '../components/workouts/ViewPlanModal';
import { WorkoutSummaryModal } from '../components/workouts/WorkoutSummaryModal';
import { Dumbbell, Activity, Calendar } from 'lucide-react';

export const WorkoutsPage: React.FC = () => {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);

  const [activeTab, setActiveTab] = useState<'plans' | 'active' | 'history'>('plans');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [selectedPlanForView, setSelectedPlanForView] = useState<WorkoutPlan | null>(null);
  const [finishedSummary, setFinishedSummary] = useState<any | null>(null);

  const loadWorkoutData = async () => {
    setLoading(true);
    try {
      const [plansRes, sessionsRes, activeRes] = await Promise.all([
        api.get('/workouts/plans'),
        api.get('/workouts/sessions'),
        api.get('/workouts/sessions/active'),
      ]);

      if (plansRes.data.success) setPlans(plansRes.data.data);
      if (sessionsRes.data.success) setSessions(sessionsRes.data.data);
      if (activeRes.data.success) setActiveSession(activeRes.data.data);
    } catch (e) {
      console.error('Failed to load workout data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkoutData();
  }, []);

  const handleStartPlan = async (plan: WorkoutPlan) => {
    try {
      const exerciseIds = plan.days?.flatMap((d) => d.exercises.map((ex) => ex.exerciseId)) || [];
      const res = await api.post('/workouts/sessions', {
        planId: plan.id,
        title: plan.name,
        exerciseIds,
      });

      if (res.data.success) {
        setActiveSession(res.data.data);
        setActiveTab('active');
      }
    } catch (e) {
      console.error('Failed to start plan session:', e);
    }
  };

  const handleFinishWorkout = (summary: any) => {
    setFinishedSummary(summary);
    setActiveSession(null);
    loadWorkoutData();
  };

  return (
    <AppShell title="Workouts">
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[var(--bg-main)] transition-colors duration-200">
        {/* Main Scroll Container */}
        <div className="flex-1 overflow-y-auto min-h-0 py-6 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6">
            
            {/* Action Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--bg-card)] p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
              <div>
                <h2 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">Workouts</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Plan, train, and track your progress</p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={() => setIsAiModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl font-extrabold bg-[#865BC4] hover:bg-[#7347B0] text-white shadow-md shadow-[#865BC4]/20 text-xs flex items-center gap-2 transition-all active:scale-95"
                >
                  <Dumbbell className="w-4 h-4" />
                  <span>Generate AI Workout</span>
                </button>

                <button
                  onClick={() => setIsCustomModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl font-semibold bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs flex items-center justify-center transition-all"
                >
                  <span>New Custom Plan</span>
                </button>
              </div>
            </div>

            {/* 3 Main Tabs: [ My Plans ] [ Active Workout ] [ History ] */}
            <div className="flex border-b border-[var(--border-subtle)]">
              <button
                onClick={() => setActiveTab('plans')}
                className={`pb-3 px-5 font-extrabold text-xs sm:text-sm transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === 'plans'
                    ? 'border-[#865BC4] text-[#865BC4]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>My Plans ({plans.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('active')}
                className={`pb-3 px-5 font-extrabold text-xs sm:text-sm transition-all border-b-2 flex items-center gap-2 relative ${
                  activeTab === 'active'
                    ? 'border-[#865BC4] text-[#865BC4]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Active Workout</span>
                {activeSession && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`pb-3 px-5 font-extrabold text-xs sm:text-sm transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === 'history'
                    ? 'border-[#865BC4] text-[#865BC4]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Dumbbell className="w-4 h-4" />
                <span>History ({sessions.filter((s) => s.status === 'COMPLETED').length})</span>
              </button>
            </div>

            {/* Tab Content Rendering */}
            {activeTab === 'plans' && (
              <MyPlansTab
                plans={plans}
                activeSession={activeSession}
                loading={loading}
                onStartPlan={handleStartPlan}
                onViewPlan={(plan) => setSelectedPlanForView(plan)}
                onContinueActiveWorkout={() => setActiveTab('active')}
                onOpenAiModal={() => setIsAiModalOpen(true)}
                onOpenCustomModal={() => setIsCustomModalOpen(true)}
              />
            )}

            {activeTab === 'active' && (
              <ActiveWorkoutTab
                session={activeSession}
                onFinishWorkout={handleFinishWorkout}
                onGoToPlans={() => setActiveTab('plans')}
              />
            )}

            {activeTab === 'history' && (
              <HistoryTab sessions={sessions} loading={loading} />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <GenerateAiWorkoutModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSuccess={loadWorkoutData}
      />

      <CustomPlanModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSuccess={loadWorkoutData}
      />

      <ViewPlanModal
        plan={selectedPlanForView}
        isOpen={Boolean(selectedPlanForView)}
        onClose={() => setSelectedPlanForView(null)}
        onStartPlan={handleStartPlan}
      />

      <WorkoutSummaryModal
        isOpen={Boolean(finishedSummary)}
        onClose={() => setFinishedSummary(null)}
        summary={finishedSummary}
      />
    </AppShell>
  );
};
