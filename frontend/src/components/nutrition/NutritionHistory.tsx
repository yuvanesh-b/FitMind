import React, { useState, useEffect } from 'react';
import { NutritionHistoryData } from '../../types/nutrition';
import { api } from '../../services/api';
import { Calendar, TrendingUp } from 'lucide-react';

export const NutritionHistory: React.FC = () => {
  const [days, setDays] = useState<number>(30);
  const [historyData, setHistoryData] = useState<NutritionHistoryData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async (daysCount: number) => {
    setLoading(true);
    try {
      const res = await api.get('/nutrition/history', {
        params: { days: daysCount },
      });
      if (res.data.success) {
        setHistoryData(res.data.data);
      }
    } catch (e) {
      console.error('Failed to fetch nutrition history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(days);
  }, [days]);

  return (
    <div className="p-6 rounded-2xl bg-surface-dark border border-surface-border mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-600/10 text-brand-400 border border-brand-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Nutrition History & Averages</h3>
            <p className="text-xs text-slate-400">Historical performance metrics and goal consistency</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-surface-elevated p-1 rounded-xl border border-surface-border self-start sm:self-auto">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                days === d
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {loading || !historyData ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 rounded-xl bg-surface-elevated h-20" />
          ))}
        </div>
      ) : (
        <div>
          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
            <div className="p-4 rounded-xl bg-surface-elevated/60 border border-surface-border/50">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block mb-0.5">Avg Calories</span>
              <span className="text-lg font-black text-white">{historyData.averageCalories} <span className="text-xs font-normal text-slate-400">kcal/day</span></span>
            </div>

            <div className="p-4 rounded-xl bg-surface-elevated/60 border border-surface-border/50">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block mb-0.5">Avg Protein</span>
              <span className="text-lg font-black text-accent-emerald">{historyData.averageProtein} <span className="text-xs font-normal text-slate-400">g/day</span></span>
            </div>

            <div className="p-4 rounded-xl bg-surface-elevated/60 border border-surface-border/50">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block mb-0.5">Avg Carbs</span>
              <span className="text-lg font-black text-accent-amber">{historyData.averageCarbs} <span className="text-xs font-normal text-slate-400">g/day</span></span>
            </div>

            <div className="p-4 rounded-xl bg-surface-elevated/60 border border-surface-border/50">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 block mb-0.5">Avg Fat</span>
              <span className="text-lg font-black text-accent-cyan">{historyData.averageFat} <span className="text-xs font-normal text-slate-400">g/day</span></span>
            </div>

            <div className="p-4 rounded-xl bg-brand-600/15 border border-brand-500/30 col-span-2 sm:col-span-1">
              <span className="text-[10px] font-extrabold uppercase text-brand-400 block mb-0.5">Goal Completion</span>
              <span className="text-lg font-black text-brand-300">{historyData.goalCompletionPercentage}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
