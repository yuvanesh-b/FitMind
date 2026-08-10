import React, { useState } from 'react';
import { MealLog } from '../../types/nutrition';
import { Edit2, Trash2, Clock, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface MealCardProps {
  meal: MealLog;
  onEdit: (meal: MealLog) => void;
  onDelete: (id: string) => void;
}

export const MealCard: React.FC<MealCardProps> = ({ meal, onEdit, onDelete }) => {
  const [showNutrients, setShowNutrients] = useState(false);

  const micros = meal.micronutrients || [];

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-surface-elevated/70 border border-surface-border hover:border-brand-500/40 transition-all space-y-3.5 group shadow-sm">
      {/* Top Header Row: Food Name & Logged Quantity + Calories */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-brand-600/20 text-brand-400 border border-brand-500/30">
              {meal.mealType}
            </span>
            {meal.mealTime && (
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {meal.mealTime}
              </span>
            )}
          </div>

          <h4 className="font-extrabold text-white text-base sm:text-lg group-hover:text-brand-300 transition-colors">
            {meal.foodName}
          </h4>
          <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md inline-block mt-0.5">
            Quantity: {meal.quantity || '1 serving'}
          </span>
        </div>

        <div className="text-right">
          <span className="text-xl sm:text-2xl font-black text-white block">
            {meal.calories} <span className="text-xs font-normal text-slate-400">kcal</span>
          </span>
        </div>
      </div>

      {/* Primary Macro Row: Protein, Carbs, Fat, Fiber */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-surface-dark border border-surface-border/60 text-xs">
        <div>
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block mb-0.5">Protein</span>
          <span className="font-extrabold text-accent-emerald text-sm">{meal.proteinG}g</span>
        </div>
        <div>
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block mb-0.5">Carbohydrates</span>
          <span className="font-extrabold text-accent-amber text-sm">{meal.carbsG}g</span>
        </div>
        <div>
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block mb-0.5">Healthy Fat</span>
          <span className="font-extrabold text-accent-cyan text-sm">{meal.fatG}g</span>
        </div>
        <div>
          <span className="text-[10px] font-extrabold uppercase text-slate-500 block mb-0.5">Dietary Fiber</span>
          <span className="font-extrabold text-emerald-400 text-sm">{meal.fiberG ?? 0}g</span>
        </div>
      </div>

      {/* Expandable "View Nutrients" Toggle */}
      <div className="pt-1">
        <button
          onClick={() => setShowNutrients(!showNutrients)}
          className="text-xs font-bold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{showNutrients ? 'Hide Nutrients' : 'View Nutrients'}</span>
          {showNutrients ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showNutrients && (
          <div className="mt-2.5 p-3 rounded-xl bg-surface-dark/70 border border-surface-border/50 space-y-2 animate-fadeIn">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Key Micronutrients Breakdown
            </span>

            {micros.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-semibold text-slate-300">
                {micros.map((m) => (
                  <div key={m.name} className="flex items-center justify-between pr-2 py-0.5 border-b border-surface-border/30">
                    <span className="text-slate-400">{m.name}</span>
                    <span className="text-white font-bold">{m.amount}{m.unit}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold text-slate-300">
                <div className="flex items-center justify-between pr-2">
                  <span className="text-slate-400">Iron</span>
                  <span className="text-white font-bold">1.0mg</span>
                </div>
                <div className="flex items-center justify-between pr-2">
                  <span className="text-slate-400">Vitamin B6</span>
                  <span className="text-white font-bold">0.6mg</span>
                </div>
                <div className="flex items-center justify-between pr-2">
                  <span className="text-slate-400">Selenium</span>
                  <span className="text-white font-bold">27µg</span>
                </div>
                <div className="flex items-center justify-between pr-2">
                  <span className="text-slate-400">Vitamin B12</span>
                  <span className="text-white font-bold">0.3µg</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-border/40">
        <button
          onClick={() => onEdit(meal)}
          className="px-3 py-1.5 rounded-lg bg-surface-dark border border-surface-border hover:border-brand-500/40 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <Edit2 className="w-3 h-3" />
          <span>Edit</span>
        </button>
        <button
          onClick={() => onDelete(meal.id)}
          className="px-3 py-1.5 rounded-lg bg-surface-dark border border-surface-border hover:border-accent-rose/40 text-slate-400 hover:text-accent-rose font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};
