import React, { useState } from 'react';
import { WaterSummaryData } from '../../types/nutrition';
import { api } from '../../services/api';
import { Droplet, Plus, Loader2 } from 'lucide-react';

interface HydrationCardProps {
  hydration: WaterSummaryData | null;
  loading?: boolean;
  onSuccess: () => void;
}

export const HydrationCard: React.FC<HydrationCardProps> = ({
  hydration,
  loading,
  onSuccess,
}) => {
  const [addingAmount, setAddingAmount] = useState<number | null>(null);

  const handleAddWater = async (amountMl: number) => {
    setAddingAmount(amountMl);
    try {
      await api.post('/nutrition/water', { amountMl });
      onSuccess();
    } catch (e) {
      console.error('Failed to log water:', e);
    } finally {
      setAddingAmount(null);
    }
  };

  if (loading || !hydration) {
    return (
      <div className="p-5 rounded-2xl bg-surface-dark border border-surface-border h-full animate-pulse flex flex-col justify-between">
        <div className="w-32 h-5 bg-surface-elevated rounded-md" />
        <div className="w-48 h-8 bg-surface-elevated rounded-lg" />
        <div className="w-full h-2 bg-surface-elevated rounded-full" />
      </div>
    );
  }

  const { consumedLiters, targetLiters, percentage } = hydration;

  return (
    <div className="p-5 rounded-2xl bg-surface-dark border border-surface-border flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30">
              <Droplet className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Hydration Tracking</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Daily water intake optimization</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#865BC4]/15 text-[#7347B0] dark:text-accent-cyan border border-[#865BC4]/30">
            {percentage}% Goal
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 my-3">
          <span className="text-3xl font-black text-slate-900 dark:text-white">{consumedLiters}L</span>
          <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">/ {targetLiters}L target</span>
        </div>

        <div className="w-full h-2.5 bg-surface-elevated rounded-full overflow-hidden p-0.5 border border-surface-border/50 mb-4">
          <div
            className="h-full bg-accent-cyan rounded-full transition-all duration-500 shadow-sm shadow-accent-cyan/40"
            style={{ width: `${Math.min(100, percentage)}%` }}
          />
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="pt-3 border-t border-surface-border/50">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#865BC4] dark:text-slate-400 block mb-2">
          Quick Log Water
        </span>
        <div className="grid grid-cols-3 gap-2">
          {[250, 500, 750].map((amount) => (
            <button
              key={amount}
              disabled={addingAmount === amount}
              onClick={() => handleAddWater(amount)}
              className="py-2 px-2 rounded-xl bg-white dark:bg-surface-elevated hover:bg-slate-100 dark:hover:bg-surface-border text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1 border border-slate-300 dark:border-surface-border transition-all active:scale-95 disabled:opacity-50"
            >
              {addingAmount === amount ? (
                <Loader2 className="w-3 h-3 animate-spin text-accent-cyan" />
              ) : (
                <Plus className="w-3 h-3 text-accent-cyan" />
              )}
              <span>+{amount}ml</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
