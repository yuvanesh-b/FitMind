import React from 'react';
import { NutritionSummaryData } from '../../types/nutrition';
import { Leaf, Cookie, Zap } from 'lucide-react';

interface AdditionalDailyNutritionProps {
  summary: NutritionSummaryData | null;
  loading?: boolean;
}

export const AdditionalDailyNutrition: React.FC<AdditionalDailyNutritionProps> = ({ summary, loading }) => {
  if (loading || !summary) return null;

  const items = [
    {
      label: 'Dietary Fiber',
      consumed: `${summary.fiber.consumed}g`,
      target: `${summary.fiber.target}g target`,
      pct: summary.fiber.percentage,
      icon: Leaf,
      badgeColor: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30',
      barColor: 'bg-emerald-400',
    },
    {
      label: 'Total Sugar',
      consumed: `${summary.sugar.consumed}g`,
      target: `${summary.sugar.target}g max target`,
      pct: summary.sugar.percentage,
      icon: Cookie,
      badgeColor: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
      barColor: 'bg-amber-400',
    },
    {
      label: 'Sodium Intake',
      consumed: `${summary.sodium.consumed.toLocaleString()}mg`,
      target: `${summary.sodium.target.toLocaleString()}mg ref target`,
      pct: summary.sodium.percentage,
      icon: Zap,
      badgeColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30',
      barColor: 'bg-cyan-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="p-4 rounded-2xl bg-surface-dark border border-surface-border flex items-center justify-between gap-3 shadow-sm"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-bold text-slate-300">{item.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-white">{item.consumed}</span>
                <span className="text-[11px] text-slate-400 font-medium">/ {item.target}</span>
              </div>
            </div>

            <div className="w-20 space-y-1 text-right">
              <span className={`px-2 py-0.5 rounded-md border text-[10px] font-extrabold ${item.badgeColor}`}>
                {item.pct}%
              </span>
              <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.barColor}`}
                  style={{ width: `${Math.min(100, item.pct)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
