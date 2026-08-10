import React from 'react';
import { NutritionSummaryData } from '../../types/nutrition';
import { Flame, Dumbbell, Wheat, Droplet, Leaf } from 'lucide-react';

interface MacroSummaryCardsProps {
  summary: NutritionSummaryData | null;
  loading?: boolean;
}

export const MacroSummaryCards: React.FC<MacroSummaryCardsProps> = ({ summary, loading }) => {
  if (loading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] animate-pulse space-y-3 shadow-sm">
            <div className="w-24 h-4 bg-[var(--bg-surface)] rounded-md" />
            <div className="w-32 h-7 bg-[var(--bg-surface)] rounded-lg" />
            <div className="w-full h-2 bg-[var(--bg-surface)] rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'CALORIES',
      consumed: summary.calories.consumed.toLocaleString(),
      target: summary.calories.target.toLocaleString(),
      unit: 'kcal',
      percentage: summary.calories.percentage,
      icon: Flame,
      colorClass: 'bg-[#865BC4]',
      badgeClass: 'text-[#865BC4] bg-[#865BC4]/15 border-[#865BC4]/30',
    },
    {
      label: 'PROTEIN',
      consumed: summary.protein.consumed,
      target: summary.protein.target,
      unit: 'g',
      percentage: summary.protein.percentage,
      icon: Dumbbell,
      colorClass: 'bg-emerald-500',
      badgeClass: 'text-emerald-600 bg-emerald-500/15 border-emerald-500/30',
    },
    {
      label: 'CARBOHYDRATES',
      consumed: summary.carbs.consumed,
      target: summary.carbs.target,
      unit: 'g',
      percentage: summary.carbs.percentage,
      icon: Wheat,
      colorClass: 'bg-amber-500',
      badgeClass: 'text-amber-600 bg-amber-500/15 border-amber-500/30',
    },
    {
      label: 'HEALTHY FATS',
      consumed: summary.fat.consumed,
      target: summary.fat.target,
      unit: 'g',
      percentage: summary.fat.percentage,
      icon: Droplet,
      colorClass: 'bg-[#865BC4]',
      badgeClass: 'text-[#865BC4] bg-[#865BC4]/15 border-[#865BC4]/30',
    },
    {
      label: 'DIETARY FIBER',
      consumed: summary.fiber.consumed,
      target: summary.fiber.target,
      unit: 'g',
      percentage: summary.fiber.percentage,
      icon: Leaf,
      colorClass: 'bg-emerald-500',
      badgeClass: 'text-emerald-600 bg-emerald-500/15 border-emerald-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[#865BC4]/40 transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-[var(--text-secondary)]">
                  {card.label}
                </span>
                <div className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 ${card.badgeClass}`}>
                  <Icon className="w-3.5 h-3.5" />
                  <span className="font-bold">{card.percentage}%</span>
                </div>
              </div>

              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-black text-slate-900 dark:text-[var(--text-primary)]">{card.consumed}</span>
                <span className="text-xs text-slate-600 dark:text-[var(--text-secondary)] font-semibold">/ {card.target} {card.unit}</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full h-2 bg-[var(--bg-surface)] rounded-full overflow-hidden p-0.5 border border-[var(--border-subtle)]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${card.colorClass}`}
                  style={{ width: `${Math.min(100, card.percentage)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
