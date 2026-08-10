import React from 'react';
import { MealLog, TodayMealsData } from '../../types/nutrition';
import { Utensils, Edit2, Trash2, Clock, Flame, ChevronRight, Plus } from 'lucide-react';

interface SelectedFoodsSectionProps {
  todayData: TodayMealsData | null;
  loading?: boolean;
  onEditMeal: (meal: MealLog) => void;
  onDeleteMeal: (id: string) => void;
  onOpenAddModal: () => void;
}

export const SelectedFoodsSection: React.FC<SelectedFoodsSectionProps> = ({
  todayData,
  loading,
  onEditMeal,
  onDeleteMeal,
  onOpenAddModal,
}) => {
  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4 animate-pulse shadow-sm">
        <div className="h-6 w-48 bg-[var(--bg-surface)] rounded-lg" />
        <div className="h-24 bg-[var(--bg-surface)] rounded-xl" />
      </div>
    );
  }

  const logs = todayData?.logs || [];

  // Group logs by meal type
  const mealCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
  const groupedMeals = mealCategories.map((type) => {
    const items = logs.filter((log) => (log.mealType || 'Snack').toLowerCase() === type.toLowerCase());
    const totalCal = items.reduce((sum, item) => sum + item.calories, 0);
    const totalProt = Number(items.reduce((sum, item) => sum + item.proteinG, 0).toFixed(1));
    return {
      type,
      items,
      totalCal,
      totalProt,
    };
  });

  const hasAnyFoods = logs.length > 0;

  return (
    <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-6 shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-[var(--text-primary)] tracking-tight flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[#865BC4]" />
            <span>Selected Foods</span>
          </h3>
          <p className="text-xs text-slate-600 dark:text-[var(--text-secondary)] font-medium mt-0.5">
            Today's active food items contributing to your daily nutrition targets
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2 rounded-xl font-extrabold bg-[#865BC4] hover:bg-[#7347B0] text-white text-xs shadow-md shadow-[#865BC4]/20 flex items-center justify-center transition-all"
        >
          <span>Add Food</span>
        </button>
      </div>

      {!hasAnyFoods ? (
        <div className="p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center space-y-3">
          <Utensils className="w-8 h-8 text-[var(--text-secondary)] mx-auto opacity-50" />
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-[var(--text-primary)]">No foods selected for today yet</h4>
            <p className="text-xs text-slate-600 dark:text-[var(--text-secondary)] font-medium mt-1">
              Select foods from the Food Database below or click "Add Food" to begin your daily log.
            </p>
          </div>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl bg-[#865BC4] hover:bg-[#7347B0] text-white text-xs font-extrabold shadow-md inline-flex items-center justify-center"
          >
            <span>Add Food</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedMeals.map(
            (group) =>
              group.items.length > 0 && (
                <div key={group.type} className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-[#865BC4]">
                        {group.type}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                        {group.items.length} {group.items.length === 1 ? 'food' : 'foods'}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[var(--text-secondary)]">
                      {group.totalCal} kcal • {group.totalProt}g protein
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {group.items.map((meal) => (
                      <div
                        key={meal.id}
                        className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all hover:border-[#865BC4]/40"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-[var(--text-primary)] text-sm">{meal.foodName}</h4>
                            <span className="text-xs font-bold text-[#865BC4] bg-[#865BC4]/15 px-2 py-0.5 rounded-md border border-[#865BC4]/30">
                              {meal.quantity}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] mt-1 font-medium">
                            {meal.mealTime && <span className="mr-2">Logged at {meal.mealTime}</span>}
                            P: <strong className="text-[var(--text-primary)]">{meal.proteinG}g</strong> | Carbs: <strong className="text-[var(--text-primary)]">{meal.carbsG}g</strong> | Fat: <strong className="text-[var(--text-primary)]">{meal.fatG}g</strong> | Fiber: <strong className="text-emerald-600">{meal.fiberG || 0}g</strong>
                          </p>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[var(--border-subtle)] pt-2 sm:pt-0">
                          <span className="font-black text-[var(--text-primary)] text-sm sm:text-base flex items-center gap-1">
                            <Flame className="w-4 h-4 text-amber-500" />
                            {meal.calories} kcal
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onEditMeal(meal)}
                              className="p-2 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-subtle)] transition-colors text-xs flex items-center gap-1 font-bold"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>

                            <button
                              onClick={() => onDeleteMeal(meal.id)}
                              className="p-2 rounded-lg bg-[var(--bg-card)] hover:bg-rose-500/10 text-rose-600 border border-[var(--border-subtle)] transition-colors text-xs flex items-center gap-1 font-bold"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
          )}
        </div>
      )}
    </div>
  );
};
