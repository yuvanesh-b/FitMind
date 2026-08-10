import React, { useState, useEffect } from 'react';
import { MealLog, Food } from '../../types/nutrition';
import { FoodSearch } from './FoodSearch';
import { FoodDetailsModal } from './FoodDetailsModal';
import { api } from '../../services/api';
import { X, Plus, Edit2, Loader2 } from 'lucide-react';

interface LogMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingMeal?: MealLog | null;
}

export const LogMealModal: React.FC<LogMealModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingMeal,
}) => {
  const [mealType, setMealType] = useState('Breakfast');
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('100g');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [selectedFoodDetails, setSelectedFoodDetails] = useState<Food | null>(null);

  const [calories, setCalories] = useState<number | string>('');
  const [proteinG, setProteinG] = useState<number | string>('');
  const [carbsG, setCarbsG] = useState<number | string>('');
  const [fatG, setFatG] = useState<number | string>('');
  const [fiberG, setFiberG] = useState<number | string>('');
  const [sugarG, setSugarG] = useState<number | string>('');
  const [sodiumMg, setSodiumMg] = useState<number | string>('');
  const [mealTime, setMealTime] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingMeal) {
      setMealType(editingMeal.mealType || 'Breakfast');
      setFoodName(editingMeal.foodName || '');
      setQuantity(editingMeal.quantity || '1 serving');
      setCalories(editingMeal.calories ?? '');
      setProteinG(editingMeal.proteinG ?? '');
      setCarbsG(editingMeal.carbsG ?? '');
      setFatG(editingMeal.fatG ?? '');
      setFiberG(editingMeal.fiberG ?? '');
      setSugarG(editingMeal.sugarG ?? '');
      setSodiumMg(editingMeal.sodiumMg ?? '');
      setMealTime(editingMeal.mealTime || '');
    } else {
      setMealType('Breakfast');
      setFoodName('');
      setQuantity('100g');
      setCalories('');
      setProteinG('');
      setCarbsG('');
      setFatG('');
      setFiberG('');
      setSugarG('');
      setSodiumMg('');
      setMealTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      setSelectedFood(null);
    }
    setError(null);
  }, [editingMeal, isOpen]);

  // Recalculate scaled nutrition values whenever selected food or quantity string changes
  const applyQuantityScaling = (qtyStr: string, food: Food | null) => {
    if (!food) return;
    const baseServing = food.servingSize || 100;
    const match = qtyStr.match(/([\d.]+)/);
    const numVal = match ? parseFloat(match[1]) : 1;
    const multiplier = (qtyStr.toLowerCase().includes('g') || qtyStr.toLowerCase().includes('ml'))
      ? numVal / baseServing
      : numVal;

    setCalories(Math.round(food.nutrition.calories * multiplier));
    setProteinG(Number((food.nutrition.protein * multiplier).toFixed(1)));
    setCarbsG(Number((food.nutrition.carbs * multiplier).toFixed(1)));
    setFatG(Number((food.nutrition.fat * multiplier).toFixed(1)));
    setFiberG(Number((food.nutrition.fiber * multiplier).toFixed(1)));
    setSugarG(Number((food.nutrition.sugar * multiplier).toFixed(1)));
    setSodiumMg(Number((food.nutrition.sodium * multiplier).toFixed(1)));
  };

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    setFoodName(food.name);
    const initQty = `${food.servingSize}${food.servingUnit}`;
    setQuantity(initQty);
    applyQuantityScaling(initQty, food);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuantity(val);
    if (selectedFood) {
      applyQuantityScaling(val, selectedFood);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName || calories === '') {
      setError('Please provide food name and calories.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      mealType,
      foodName,
      quantity,
      calories: Number(calories) || 0,
      proteinG: Number(proteinG) || 0,
      carbsG: Number(carbsG) || 0,
      fatG: Number(fatG) || 0,
      fiberG: Number(fiberG) || 0,
      sugarG: Number(sugarG) || 0,
      sodiumMg: Number(sodiumMg) || 0,
      mealTime: mealTime || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      foodId: selectedFood?.id,
    };

    try {
      if (editingMeal) {
        await api.put(`/nutrition/meals/${editingMeal.id}`, payload);
      } else {
        await api.post('/nutrition/meals', payload);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save meal log.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-400">
            {editingMeal ? 'Edit Existing Record' : 'Log Nutrition Intake'}
          </span>
          <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
            {editingMeal ? `Edit "${editingMeal.foodName}"` : 'Add Meal Entry'}
          </h3>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-accent-rose/15 border border-accent-rose/30 text-accent-rose text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Meal Category</label>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-brand-500 font-semibold"
              >
                <option value="Breakfast" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Breakfast</option>
                <option value="Lunch" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Lunch</option>
                <option value="Dinner" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Dinner</option>
                <option value="Snack" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Snack</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">Time</label>
              <input
                type="text"
                value={mealTime}
                onChange={(e) => setMealTime(e.target.value)}
                placeholder="e.g. 08:30 AM"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <FoodSearch
            onSelectFood={handleSelectFood}
            onViewDetails={(food) => setSelectedFoodDetails(food)}
            initialQuery={foodName}
          />

          <div>
            <label className="block text-xs font-semibold uppercase text-[var(--text-secondary)] mb-1">
              Quantity / Portion (e.g. 200g, 2 eggs, 250ml)
            </label>
            <input
              type="text"
              value={quantity}
              onChange={handleQuantityChange}
              placeholder="e.g. 200g"
              className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-brand-500 font-bold"
            />
            {selectedFood && (
              <span className="text-[10px] text-brand-400 mt-1 block">
                Proportional multiplier active (Base: {selectedFood.servingSize}{selectedFood.servingUnit})
              </span>
            )}
          </div>

          {/* Macro Inputs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold uppercase text-[var(--text-secondary)] mb-1">Calories *</label>
              <input
                type="number"
                required
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="kcal"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-brand-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-accent-emerald mb-1">Protein (g)</label>
              <input
                type="number"
                step="0.1"
                value={proteinG}
                onChange={(e) => setProteinG(e.target.value)}
                placeholder="g"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-accent-amber mb-1">Carbs (g)</label>
              <input
                type="number"
                step="0.1"
                value={carbsG}
                onChange={(e) => setCarbsG(e.target.value)}
                placeholder="g"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase text-accent-cyan mb-1">Fat (g)</label>
              <input
                type="number"
                step="0.1"
                value={fatG}
                onChange={(e) => setFatG(e.target.value)}
                placeholder="g"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Micro Inputs */}
          <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-[var(--border-subtle)]">
            <div>
              <label className="block text-[10px] font-semibold uppercase text-emerald-400 mb-1">Fiber (g)</label>
              <input
                type="number"
                step="0.1"
                value={fiberG}
                onChange={(e) => setFiberG(e.target.value)}
                placeholder="g"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase text-amber-400 mb-1">Sugar (g)</label>
              <input
                type="number"
                step="0.1"
                value={sugarG}
                onChange={(e) => setSugarG(e.target.value)}
                placeholder="g"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase text-cyan-400 mb-1">Sodium (mg)</label>
              <input
                type="number"
                step="0.1"
                value={sodiumMg}
                onChange={(e) => setSodiumMg(e.target.value)}
                placeholder="mg"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold bg-brand-600 hover:bg-brand-500 text-white text-xs shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Meal Record...</span>
              </>
            ) : (
              <>
                {editingMeal ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{editingMeal ? 'Update Meal Entry' : 'Add Meal to Log'}</span>
              </>
            )}
          </button>
        </form>
      </div>

      <FoodDetailsModal
        food={selectedFoodDetails}
        isOpen={Boolean(selectedFoodDetails)}
        onClose={() => setSelectedFoodDetails(null)}
        onLogFood={(food) => handleSelectFood(food)}
      />
    </div>
  );
};
