import React, { useState } from 'react';
import { MealLog, TodayMealsData } from '../../types/nutrition';
import { MealCard } from './MealCard';
import { Utensils, Plus, AlertCircle, X } from 'lucide-react';

interface MealListProps {
  todayData: TodayMealsData | null;
  loading?: boolean;
  onOpenLogModal: (meal?: MealLog) => void;
  onDeleteMeal: (id: string) => void;
}

export const MealList: React.FC<MealListProps> = ({
  todayData,
  loading,
  onOpenLogModal,
  onDeleteMeal,
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (loading || !todayData) {
    return (
      <div className="p-6 rounded-2xl bg-surface-dark border border-surface-border space-y-4 animate-pulse">
        <div className="w-40 h-5 bg-surface-elevated rounded-md" />
        <div className="w-full h-16 bg-surface-elevated rounded-xl" />
        <div className="w-full h-16 bg-surface-elevated rounded-xl" />
      </div>
    );
  }

  const { logs } = todayData;

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  const handleDeleteConfirm = (id: string) => {
    onDeleteMeal(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="p-6 rounded-2xl bg-surface-dark border border-surface-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-600/10 text-brand-400 border border-brand-500/20">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Today's Meal Logs</h3>
            <p className="text-xs text-slate-400">Recorded nutrition breakdown for today</p>
          </div>
        </div>

        <button
          onClick={() => onOpenLogModal()}
          className="px-3 py-1.5 rounded-xl font-bold bg-brand-600 hover:bg-brand-500 text-white text-xs flex items-center gap-1.5 shadow-md shadow-brand-600/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Meal</span>
        </button>
      </div>

      {/* Delete Confirmation Banner */}
      {deleteConfirmId && (
        <div className="mb-4 p-3.5 rounded-xl bg-accent-rose/10 border border-accent-rose/30 flex items-center justify-between text-xs text-slate-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-accent-rose" />
            <span className="font-bold">Delete this meal record?</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeleteConfirmId(null)}
              className="px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-surface-border text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => handleDeleteConfirm(deleteConfirmId)}
              className="px-2.5 py-1 rounded-lg bg-accent-rose hover:bg-rose-600 text-white font-bold"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Empty Meal State */}
      {logs.length === 0 ? (
        <div className="p-8 rounded-xl bg-surface-elevated/40 border border-surface-border/50 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center text-slate-500 mx-auto">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-0.5">No meals logged today</h4>
            <p className="text-xs text-slate-400">Start tracking your nutrition by adding your first meal.</p>
          </div>
          <button
            onClick={() => onOpenLogModal()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center gap-1.5 mx-auto shadow-md shadow-brand-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Meal</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((meal) => (
            <MealCard
              key={meal.id}
              meal={meal}
              onEdit={(m) => onOpenLogModal(m)}
              onDelete={(id) => setDeleteConfirmId(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
