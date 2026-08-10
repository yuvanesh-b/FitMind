import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { AITrainerPage } from '../pages/AITrainerPage';
import { WorkoutsPage } from '../pages/WorkoutsPage';
import { WorkoutPlanEditorPage } from '../pages/WorkoutPlanEditorPage';
import { ActiveWorkoutPage } from '../pages/ActiveWorkoutPage';
import { ExercisesPage } from '../pages/ExercisesPage';
import { ProgressPage } from '../pages/ProgressPage';
import { WeeklyReportsPage } from '../pages/WeeklyReportsPage';
import { NutritionPage } from '../pages/NutritionPage';
import { NutritionFoodsPage } from '../pages/NutritionFoodsPage';
import { ProfilePage } from '../pages/ProfilePage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/ai-trainer" element={<AITrainerPage />} />
        <Route path="/workouts" element={<WorkoutsPage />} />
        <Route path="/workout-plans" element={<Navigate to="/workouts" replace />} />
        <Route path="/workouts/new" element={<WorkoutPlanEditorPage />} />
        <Route path="/workouts/active/:sessionId" element={<ActiveWorkoutPage />} />
        <Route path="/exercises" element={<ExercisesPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/progress/weekly-reports" element={<WeeklyReportsPage />} />
        <Route path="/nutrition" element={<NutritionPage />} />
        <Route path="/nutrition-foods" element={<NutritionFoodsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
