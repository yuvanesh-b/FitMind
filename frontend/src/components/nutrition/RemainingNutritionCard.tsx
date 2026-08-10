import React from 'react';
import { NutritionSummaryData } from '../../types/nutrition';
import { Flame, Dumbbell, Zap, Shield, Sparkles } from 'lucide-react';

interface RemainingNutritionCardProps {
  summary: NutritionSummaryData | null;
  loading?: boolean;
}

export const RemainingNutritionCard: React.FC<RemainingNutritionCardProps> = ({ summary, loading }) => {
  if (loading || !summary) {
    return (
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] animate-pulse h-28" />
    );
  }

  const remainingCal = Math.max(0, summary.calories.target - summary.calories.consumed);
  const remainingProtein = Math.max(0, Number((summary.protein.target - summary.protein.consumed).toFixed(1)));
  const remainingCarbs = Math.max(0, Number((summary.carbs.target - summary.carbs.consumed).toFixed(1)));
  const remainingFat = Math.max(0, Number((summary.fat.target - summary.fat.consumed).toFixed(1)));
  const remainingFiber = Math.max(0, Number((summary.fiber.target - summary.fiber.consumed).toFixed(1)));

  return (
    <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[#865BC4]/40 shadow-md space-y-4 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#865BC4]" />
          <h3 className="text-lg font-black text-slate-900 dark:text-[var(--text-primary)] tracking-tight">Remaining Nutrition Budget</h3>
        </div>
        <span className="text-xs font-extrabold text-[#7347B0] dark:text-[#865BC4] bg-[#865BC4]/15 px-3 py-1 rounded-full border border-[#865BC4]/30">
          Target - Consumed
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 text-xs">
        <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center flex flex-col justify-between">
          <span className="text-[10px] font-extrabold uppercase text-slate-700 dark:text-[var(--text-secondary)] block mb-1">Calories Left</span>
          <span className="text-lg font-black text-slate-900 dark:text-[var(--text-primary)] flex items-center justify-center gap-1">
            <Flame className="w-4 h-4 text-amber-500" />
            {remainingCal} <span className="text-xs font-semibold text-slate-600 dark:text-[var(--text-secondary)]">kcal</span>
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center flex flex-col justify-between">
          <span className="text-[10px] font-extrabold uppercase text-slate-700 dark:text-[var(--text-secondary)] block mb-1">Protein Left</span>
          <span className="text-lg font-black text-emerald-700 dark:text-emerald-600">{remainingProtein}g</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center flex flex-col justify-between">
          <span className="text-[10px] font-extrabold uppercase text-slate-700 dark:text-[var(--text-secondary)] block mb-1">Carbs Left</span>
          <span className="text-lg font-black text-amber-700 dark:text-amber-600">{remainingCarbs}g</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center flex flex-col justify-between">
          <span className="text-[10px] font-extrabold uppercase text-slate-700 dark:text-[var(--text-secondary)] block mb-1">Fat Left</span>
          <span className="text-lg font-black text-[#7347B0] dark:text-[#865BC4]">{remainingFat}g</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center flex flex-col justify-between">
          <span className="text-[10px] font-extrabold uppercase text-slate-700 dark:text-[var(--text-secondary)] block mb-1">Fiber Left</span>
          <span className="text-lg font-black text-emerald-700 dark:text-emerald-600">{remainingFiber}g</span>
        </div>
      </div>
    </div>
  );
};
