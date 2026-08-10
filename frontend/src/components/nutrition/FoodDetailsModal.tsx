import React, { useEffect } from 'react';
import { Food } from '../../types/nutrition';
import { X, Check, Flame, ShieldCheck, Leaf, Plus, Sparkles } from 'lucide-react';

interface FoodDetailsModalProps {
  food: Food | null;
  isOpen: boolean;
  onClose: () => void;
  onLogFood: (food: Food) => void;
}

export const FoodDetailsModal: React.FC<FoodDetailsModalProps> = ({
  food,
  isOpen,
  onClose,
  onLogFood,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !food) return null;

  const benefitsList: string[] = Array.isArray(food.benefits)
    ? food.benefits.map((b) => (typeof b === 'string' ? b : b.benefit))
    : [];

  const isPackaged = ['Grains', 'Nuts & Spreads', 'Poultry & Dairy'].includes(food.category || '');

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
      {/* Centered Full-Screen SaaS Modal Overlay */}
      <div className="w-full max-w-[1150px] w-[calc(100%-24px)] sm:w-[calc(100%-48px)] max-h-[calc(100vh-48px)] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl flex flex-col justify-between overflow-y-auto custom-scrollbar relative">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-[var(--bg-card)]/95 backdrop-blur-md p-5 sm:p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-600/20 text-brand-400 border border-brand-500/30">
                {food.category || 'GENERAL'}
              </span>
              <span className="text-[11px] text-[var(--text-secondary)] font-semibold">
                Serving: {food.servingSize} {food.servingUnit}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-primary)] mt-1 tracking-tight">{food.name}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors border border-[var(--border-subtle)]"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2-Column Responsive SaaS Grid */}
        <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
          {/* LEFT COLUMN: Food Overview, Energy Output, Ingredients & Benefits */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Calorie Highlight */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-600/20 via-[var(--bg-surface)] to-[var(--bg-card)] border border-brand-500/30 shadow-md">
              <span className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase tracking-wider block mb-1">
                ENERGY OUTPUT
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-[var(--text-primary)] flex items-center gap-2">
                  <Flame className="w-6 h-6 text-accent-amber" />
                  {food.nutrition.calories}
                </span>
                <span className="text-sm font-bold text-[var(--text-secondary)]">kcal / {food.servingSize}{food.servingUnit}</span>
              </div>
            </div>

            {/* INGREDIENTS SECTION */}
            <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-accent-emerald" />
                  <span>Ingredients</span>
                </h3>
                {isPackaged && (
                  <span className="text-[10px] font-medium text-[var(--text-secondary)] italic">May vary by brand</span>
                )}
              </div>

              <div className="text-xs text-[var(--text-primary)] space-y-2 pt-1">
                {food.ingredients && food.ingredients.length > 0 ? (
                  food.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                      <span className="font-semibold text-[var(--text-primary)]">{ing.name}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                    <span className="font-semibold text-[var(--text-primary)]">{food.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* NUTRITION BENEFITS SECTION */}
            {benefitsList.length > 0 && (
              <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2.5">
                  <ShieldCheck className="w-4 h-4 text-brand-400" />
                  <span>Nutrition Benefits</span>
                </h3>

                <div className="space-y-2 text-xs pt-1">
                  {benefitsList.map((benefit, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-accent-emerald/20 border border-accent-emerald/40 text-accent-emerald flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="font-semibold text-[var(--text-primary)]">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Macro Fuel 2x2 Grid & Key Micronutrients Grid */}
          <div className="lg:col-span-7 space-y-6">
            {/* MACRO FUEL 2x2 GRID */}
            <div className="space-y-3 p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2.5">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span>Macro Fuel</span>
              </h3>

              <div className="grid grid-cols-2 gap-3.5 text-xs">
                <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] font-extrabold text-[var(--text-secondary)] block mb-1 uppercase">PROTEIN</span>
                  <span className="text-xl font-black text-[var(--text-primary)]">{food.nutrition.protein}g</span>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] font-extrabold text-[var(--text-secondary)] block mb-1 uppercase">CARBOHYDRATES</span>
                  <span className="text-xl font-black text-[var(--text-primary)]">{food.nutrition.carbs}g</span>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] font-extrabold text-[var(--text-secondary)] block mb-1 uppercase">HEALTHY FAT</span>
                  <span className="text-xl font-black text-[var(--text-primary)]">{food.nutrition.fat}g</span>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] font-extrabold text-[var(--text-secondary)] block mb-1 uppercase">DIETARY FIBER</span>
                  <span className="text-xl font-black text-accent-emerald">{food.nutrition.fiber || 0}g</span>
                </div>
              </div>
            </div>

            {/* KEY MICRONUTRIENTS GRID */}
            {food.nutrients && food.nutrients.length > 0 && (
              <div className="space-y-3 p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2.5">
                  Key Micronutrients
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  {food.nutrients.map((n, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-between">
                      <span className="font-semibold text-[var(--text-secondary)] truncate">{n.name}</span>
                      <span className="font-black text-brand-400 ml-1">{n.amount}{n.unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Footer Action */}
        <div className="sticky bottom-0 bg-[var(--bg-card)]/95 backdrop-blur-md p-4 sm:p-5 border-t border-[var(--border-subtle)] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs border border-[var(--border-subtle)] transition-colors"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              onLogFood(food);
            }}
            className="px-6 py-2.5 rounded-xl font-extrabold bg-brand-600 hover:bg-brand-500 text-white text-xs shadow-lg shadow-brand-600/30 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Food Item</span>
          </button>
        </div>
      </div>
    </div>
  );
};
