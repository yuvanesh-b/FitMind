import React from 'react';
import { MicronutrientSummaryItem } from '../../types/nutrition';
import { ShieldCheck, Info } from 'lucide-react';

interface MicronutrientDashboardProps {
  micronutrients: MicronutrientSummaryItem[];
  loading?: boolean;
}

export const MicronutrientDashboard: React.FC<MicronutrientDashboardProps> = ({
  micronutrients,
  loading,
}) => {
  if (loading || !micronutrients || micronutrients.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-surface-dark border border-surface-border animate-pulse space-y-4">
        <div className="w-48 h-5 bg-surface-elevated rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 bg-surface-elevated rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-surface-dark border border-surface-border mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-600/10 text-brand-400 border border-brand-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Micronutrient Overview</h3>
            <p className="text-xs text-slate-400">
              Daily logged intake vs general dietary reference values (reference only)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold bg-surface-elevated px-3 py-1.5 rounded-xl border border-surface-border self-start sm:self-auto">
          <Info className="w-3.5 h-3.5" />
          <span>Non-medical reference values</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {micronutrients.map((item) => {
          const isTargetReached = item.percentage >= 100;
          return (
            <div
              key={item.name}
              className="p-3.5 rounded-xl bg-surface-elevated/50 border border-surface-border/50 hover:border-brand-500/30 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-white text-xs">{item.name}</span>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                    isTargetReached
                      ? 'text-accent-emerald bg-accent-emerald/10 border-accent-emerald/30'
                      : 'text-brand-400 bg-brand-500/10 border-brand-500/30'
                  }`}
                >
                  {item.percentage}%
                </span>
              </div>

              <div className="flex items-baseline justify-between text-xs text-slate-400 mb-2">
                <span className="font-extrabold text-white text-sm">
                  {item.amount} <span className="text-xs font-normal text-slate-400">{item.unit}</span>
                </span>
                <span className="text-[11px]">
                  ref: {item.referenceTarget} {item.unit}
                </span>
              </div>

              <div className="w-full h-1.5 bg-surface-elevated rounded-full overflow-hidden p-0.5 border border-surface-border/40">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isTargetReached ? 'bg-accent-emerald' : 'bg-brand-500'
                  }`}
                  style={{ width: `${Math.min(100, item.percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
