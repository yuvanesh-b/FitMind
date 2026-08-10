import React from 'react';
import { TodayMealsData } from '../../types/nutrition';
import { PieChart } from 'lucide-react';

interface MacroDistributionProps {
  todayData: TodayMealsData | null;
  loading?: boolean;
}

export const MacroDistribution: React.FC<MacroDistributionProps> = ({ todayData, loading }) => {
  if (loading || !todayData) {
    return (
      <div className="p-5 rounded-2xl bg-surface-dark border border-surface-border h-72 animate-pulse flex flex-col justify-between">
        <div className="w-40 h-5 bg-surface-elevated rounded-md" />
        <div className="w-32 h-32 rounded-full bg-surface-elevated mx-auto my-auto" />
      </div>
    );
  }

  const { totalCalories, totalProtein, totalCarbs, totalFat } = todayData;

  // Calorie breakdown (Protein 4 kcal/g, Carbs 4 kcal/g, Fat 9 kcal/g)
  const proteinCal = totalProtein * 4;
  const carbsCal = totalCarbs * 4;
  const fatCal = totalFat * 9;
  const grandTotalCal = proteinCal + carbsCal + fatCal || 1;

  const proteinPct = Math.round((proteinCal / grandTotalCal) * 100);
  const carbsPct = Math.round((carbsCal / grandTotalCal) * 100);
  const fatPct = Math.round((fatCal / grandTotalCal) * 100);

  return (
    <div className="p-5 rounded-2xl bg-surface-dark border border-surface-border flex flex-col justify-between h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-brand-600/10 text-brand-400 border border-brand-500/20">
          <PieChart className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Macro Distribution</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Caloric ratio from today's intake</p>
        </div>
      </div>

      {/* SVG Donut Chart */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-4 my-auto py-2">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            {/* Background Circle */}
            <path
              className="text-surface-elevated stroke-current"
              strokeWidth="4"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Protein Segment */}
            <path
              className="text-accent-emerald stroke-current transition-all duration-500"
              strokeDasharray={`${proteinPct}, 100`}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Carbs Segment */}
            <path
              className="text-accent-amber stroke-current transition-all duration-500"
              strokeDasharray={`${carbsPct}, 100`}
              strokeDashoffset={`-${proteinPct}`}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            {/* Fat Segment */}
            <path
              className="text-accent-cyan stroke-current transition-all duration-500"
              strokeDasharray={`${fatPct}, 100`}
              strokeDashoffset={`-${proteinPct + carbsPct}`}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-lg font-black text-slate-900 dark:text-white">{totalCalories}</span>
            <span className="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400">kcal</span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2.5 w-full sm:w-auto">
          <div className="flex items-center justify-between gap-6 text-xs p-2 rounded-xl bg-surface-elevated/60 border border-surface-border/40">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-emerald" />
              <span className="font-bold text-slate-700 dark:text-slate-300">Protein</span>
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white">{proteinPct}% ({totalProtein}g)</span>
          </div>

          <div className="flex items-center justify-between gap-6 text-xs p-2 rounded-xl bg-surface-elevated/60 border border-surface-border/40">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-amber" />
              <span className="font-bold text-slate-700 dark:text-slate-300">Carbs</span>
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white">{carbsPct}% ({totalCarbs}g)</span>
          </div>

          <div className="flex items-center justify-between gap-6 text-xs p-2 rounded-xl bg-surface-elevated/60 border border-surface-border/40">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent-cyan" />
              <span className="font-bold text-slate-700 dark:text-slate-300">Fat</span>
            </div>
            <span className="font-extrabold text-slate-900 dark:text-white">{fatPct}% ({totalFat}g)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
