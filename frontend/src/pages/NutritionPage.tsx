import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { api } from '../services/api';
import {
  NutritionSummaryData,
  TodayMealsData,
  WaterSummaryData,
  WeeklyNutritionPoint,
  MealLog,
  Food,
} from '../types/nutrition';
import { MacroSummaryCards } from '../components/nutrition/MacroSummaryCards';
import { RemainingNutritionCard } from '../components/nutrition/RemainingNutritionCard';
import { SelectedFoodsSection } from '../components/nutrition/SelectedFoodsSection';
import { AddFoodModal } from '../components/nutrition/AddFoodModal';
import { WeeklyNutritionChart } from '../components/nutrition/WeeklyNutritionChart';
import { MacroDistribution } from '../components/nutrition/MacroDistribution';
import { LogMealModal } from '../components/nutrition/LogMealModal';
import { HydrationCard } from '../components/nutrition/HydrationCard';
import { AINutritionInsight } from '../components/nutrition/AINutritionInsight';
import { Plus, Apple } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NutritionPage: React.FC = () => {
  const [summary, setSummary] = useState<NutritionSummaryData | null>(null);
  const [todayData, setTodayData] = useState<TodayMealsData | null>(null);
  const [hydration, setHydration] = useState<WaterSummaryData | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyNutritionPoint[]>([]);

  const [loading, setLoading] = useState(true);

  // Modals & Panels
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  const [isLogEditModalOpen, setIsLogEditModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<MealLog | null>(null);
  const [preselectedFood, setPreselectedFood] = useState<Food | null>(null);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [summaryRes, todayRes, waterRes, weeklyRes] = await Promise.all([
        api.get('/nutrition/summary'),
        api.get('/nutrition/today'),
        api.get('/nutrition/water/today'),
        api.get('/nutrition/weekly'),
      ]);

      if (summaryRes.data?.success) setSummary(summaryRes.data.data);
      if (todayRes.data?.success) setTodayData(todayRes.data.data);
      if (waterRes.data?.success) setHydration(waterRes.data.data);
      if (weeklyRes.data?.success) {
        const payload = weeklyRes.data.data;
        const daysArr = Array.isArray(payload) ? payload : (payload.days || []);
        setWeeklyData(daysArr);
      }
    } catch (err: any) {
      console.error('Failed to load nutrition data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleOpenAddFoodModal = (food?: Food) => {
    setPreselectedFood(food || null);
    setIsAddFoodModalOpen(true);
  };

  const handleEditMeal = (meal: MealLog) => {
    setEditingMeal(meal);
    setIsLogEditModalOpen(true);
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      await api.delete(`/nutrition/meals/${id}`);
      loadAllData();
    } catch (e) {
      console.error('Failed to delete meal log:', e);
    }
  };

  return (
    <AppShell title="Nutrition & Macro Tracking">
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[var(--bg-main)] transition-colors duration-200">
        {/* Scrollable Main Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0 py-6 custom-scrollbar">
          {/* Reusable Common Parent Container */}
          <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6">
            
            {/* 1. Header & Primary Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--bg-card)] p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#865BC4]/15 text-[#865BC4] border border-[#865BC4]/30">
                    {currentDate}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-[var(--text-primary)] mt-1">Daily Macro & Nutrient Fuel</h2>
                <p className="text-xs text-slate-600 dark:text-[var(--text-secondary)] font-medium">
                  Track calorie targets, macronutrients, fiber, and food selection intake
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Link
                  to="/nutrition-foods"
                  className="px-4 py-2.5 rounded-xl font-bold bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Apple className="w-4 h-4 text-[#865BC4]" />
                  <span>Nutrition Foods</span>
                </Link>

                <button
                  onClick={() => handleOpenAddFoodModal()}
                  className="px-4 py-2.5 rounded-xl font-extrabold bg-[#865BC4] hover:bg-[#7347B0] text-white shadow-md shadow-[#865BC4]/20 text-xs flex items-center justify-center transition-all active:scale-95"
                >
                  <span>Add Food</span>
                </button>
              </div>
            </div>

            {/* 2. Daily Macro Fuel (Calories, Protein, Carbs, Healthy Fats, Dietary Fiber) */}
            <MacroSummaryCards summary={summary} loading={loading} />

            {/* 3. Remaining Nutrition Budget */}
            <RemainingNutritionCard summary={summary} loading={loading} />

            {/* 4. Selected Foods Section */}
            <SelectedFoodsSection
              todayData={todayData}
              loading={loading}
              onEditMeal={handleEditMeal}
              onDeleteMeal={handleDeleteMeal}
              onOpenAddModal={() => handleOpenAddFoodModal()}
            />

            {/* 5. 2-Column Analytics Grid (Weekly 7-Day Nutrition Chart + Macro Distribution) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WeeklyNutritionChart data={weeklyData} loading={loading} />
              <MacroDistribution todayData={todayData} loading={loading} />
            </div>

            {/* 6. Hydration Tracking & AI Insight */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HydrationCard
                hydration={hydration}
                loading={loading}
                onSuccess={loadAllData}
              />
              <AINutritionInsight />
            </div>
          </div>
        </div>
      </div>

      {/* Add Food Modal */}
      <AddFoodModal
        isOpen={isAddFoodModalOpen}
        onClose={() => setIsAddFoodModalOpen(false)}
        onSuccess={loadAllData}
        preselectedFood={preselectedFood}
      />

      {/* Edit Food Item Modal */}
      <LogMealModal
        isOpen={isLogEditModalOpen}
        onClose={() => setIsLogEditModalOpen(false)}
        onSuccess={loadAllData}
        editingMeal={editingMeal}
      />
    </AppShell>
  );
};
