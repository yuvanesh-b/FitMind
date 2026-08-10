import React, { useState } from 'react';
import { WeeklyNutritionPoint } from '../../types/nutrition';
import { BarChart3 } from 'lucide-react';

interface WeeklyNutritionChartProps {
  data: WeeklyNutritionPoint[];
  loading?: boolean;
}

export const WeeklyNutritionChart: React.FC<WeeklyNutritionChartProps> = ({ data, loading }) => {
  const [metric, setMetric] = useState<'calories' | 'protein' | 'carbs' | 'fat'>('calories');

  if (loading) {
    return (
      <div className="p-5 rounded-2xl bg-surface-dark border border-surface-border h-72 animate-pulse flex flex-col justify-between">
        <div className="w-44 h-5 bg-surface-elevated rounded-md" />
        <div className="w-full h-44 bg-surface-elevated rounded-xl" />
      </div>
    );
  }

  const metricLabels = {
    calories: { label: 'Calories', unit: 'kcal', color: 'bg-brand-500', max: 3500 },
    protein: { label: 'Protein', unit: 'g', color: 'bg-accent-emerald', max: 220 },
    carbs: { label: 'Carbs', unit: 'g', color: 'bg-accent-amber', max: 400 },
    fat: { label: 'Fat', unit: 'g', color: 'bg-accent-cyan', max: 120 },
  };

  const currentMetric = metricLabels[metric];
  const values = data.map((d) => d[metric] || 0);
  const maxValue = Math.max(...values, currentMetric.max / 2, 10);

  return (
    <div className="p-5 rounded-2xl bg-surface-dark border border-surface-border flex flex-col justify-between h-full">
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-600/10 text-brand-400 border border-brand-500/20">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Weekly Nutrition Overview</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">7-day trend analysis from logged meals</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-surface-elevated p-1 rounded-xl border border-surface-border self-start sm:self-auto">
          {(['calories', 'protein', 'carbs', 'fat'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold capitalize transition-all ${
                metric === m
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {m === 'calories' ? 'Cal' : m}
            </button>
          ))}
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div className="flex-1 min-h-[160px] flex items-end justify-between gap-2 sm:gap-4 pt-4 border-t border-surface-border/50">
        {data.map((point) => {
          const val = point[metric] || 0;
          const heightPercent = Math.min(100, Math.max(8, Math.round((val / maxValue) * 100)));

          return (
            <div key={point.date} className="flex-1 flex flex-col items-center gap-2 group relative">
              {/* Tooltip */}
              <div className="absolute -top-8 bg-surface-elevated text-white text-[10px] font-bold px-2 py-0.5 rounded-md border border-surface-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                {val} {currentMetric.unit}
              </div>

              {/* Bar */}
              <div className="w-full max-w-[36px] bg-surface-elevated/60 rounded-t-lg h-36 flex items-end overflow-hidden p-0.5">
                <div
                  className={`w-full rounded-t-md transition-all duration-500 group-hover:opacity-90 ${currentMetric.color}`}
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              {/* Day Label */}
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {point.dayName}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
