import React, { useState, useEffect } from 'react';
import { Food } from '../../types/nutrition';
import { api } from '../../services/api';
import { X, Search, Plus, Loader2, ArrowLeft } from 'lucide-react';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedFood?: Food | null;
}

export const AddFoodModal: React.FC<AddFoodModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedFood,
}) => {
  const [step, setStep] = useState<'search' | 'quantity'>(preselectedFood ? 'quantity' : 'search');
  const [selectedFood, setSelectedFood] = useState<Food | null>(preselectedFood || null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(false);

  const [quantityNum, setQuantityNum] = useState<number>(200);
  const [servingUnit, setServingUnit] = useState<string>('g');
  const [mealType, setMealType] = useState<string>('Lunch');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (preselectedFood) {
      setSelectedFood(preselectedFood);
      setStep('quantity');
      setQuantityNum(preselectedFood.servingSize || 100);
      setServingUnit(preselectedFood.servingUnit || 'g');
    } else {
      setStep('search');
      setSelectedFood(null);
    }
  }, [preselectedFood, isOpen]);

  useEffect(() => {
    if (isOpen && step === 'search') {
      const fetchFoods = async () => {
        setLoadingFoods(true);
        try {
          const res = await api.get('/nutrition-foods');
          if (res.data.success) {
            setFoods(res.data.data);
          }
        } catch (e) {
          console.error('Failed to load foods for modal:', e);
        } finally {
          setLoadingFoods(false);
        }
      };
      fetchFoods();
    }
  }, [isOpen, step]);

  if (!isOpen) return null;

  const categories = ['ALL', 'Protein', 'Carbs', 'Fruits', 'Vegetables', 'Healthy Fats', 'Dairy'];

  const filteredFoods = foods.filter((f) => {
    const matchesCat =
      selectedCategory === 'ALL' ||
      (f.category || '').toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSelectFoodItem = (food: Food) => {
    setSelectedFood(food);
    setQuantityNum(food.servingSize || 100);
    setServingUnit(food.servingUnit || 'g');
    setStep('quantity');
  };

  const handleAddFoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood) return;

    setSubmitting(true);
    setError(null);

    const qtyStr = `${quantityNum}${servingUnit}`;
    const payload = {
      meal: mealType.toUpperCase(),
      mealType: mealType,
      foodName: selectedFood.name,
      quantity: quantityNum,
      unit: servingUnit,
      foodId: selectedFood.id,
      consumedAt: new Date().toISOString(),
      mealTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    try {
      const res = await api.post('/nutrition/logs', payload);
      if (res.data.success) {
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add food to log.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations for quantity preview
  const baseServing = selectedFood?.servingSize || 100;
  const multiplier = (servingUnit === 'g' || servingUnit === 'ml') ? (quantityNum / baseServing) : quantityNum;

  const calcCalories = selectedFood ? Math.round(selectedFood.nutrition.calories * multiplier) : 0;
  const calcProtein = selectedFood ? Number((selectedFood.nutrition.protein * multiplier).toFixed(1)) : 0;
  const calcCarbs = selectedFood ? Number((selectedFood.nutrition.carbs * multiplier).toFixed(1)) : 0;
  const calcFat = selectedFood ? Number((selectedFood.nutrition.fat * multiplier).toFixed(1)) : 0;
  const calcFiber = selectedFood ? Number(((selectedFood.nutrition.fiber || 0) * multiplier).toFixed(1)) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          {step === 'quantity' && !preselectedFood && (
            <button
              onClick={() => setStep('search')}
              className="p-2 rounded-xl bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#865BC4] dark:text-brand-400">
              {step === 'search' ? 'Step 1: Choose Food' : 'Step 2: Quantity & Meal Category'}
            </span>
            <h3 className="text-xl font-extrabold text-[var(--text-primary)]">
              {step === 'search' ? 'Add Food Selection' : `Add "${selectedFood?.name}"`}
            </h3>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-accent-rose/15 border border-accent-rose/30 text-accent-rose text-xs font-semibold">
            {error}
          </div>
        )}

        {/* STEP 1: FOOD SEARCH & SELECTION LIST */}
        {step === 'search' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food..."
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl pl-9 pr-3 py-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#865BC4]"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl font-bold transition-all whitespace-nowrap border ${
                    selectedCategory === cat
                      ? 'bg-[#865BC4] text-white border-[#865BC4]'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-subtle)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {loadingFoods ? (
              <div className="py-12 text-center text-[var(--text-secondary)] flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#865BC4] dark:text-brand-400" />
                <span className="text-xs font-bold">Loading foods...</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {filteredFoods.map((f) => (
                  <div
                    key={f.id}
                    className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between text-xs hover:border-[#865BC4]/40 transition-all shadow-sm"
                  >
                    <div>
                      <span className="font-extrabold text-[var(--text-primary)] text-sm block">{f.name}</span>
                      <span className="text-[11px] text-[var(--text-secondary)] font-medium">
                        {f.servingSize}{f.servingUnit} • P: {f.nutrition.protein}g | C: {f.nutrition.carbs}g | F: {f.nutrition.fat}g
                      </span>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <span className="font-black text-[#865BC4] dark:text-brand-400 text-sm">{f.nutrition.calories} kcal</span>
                      <button
                        onClick={() => handleSelectFoodItem(f)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#865BC4] hover:bg-[#7347B0] text-white font-extrabold text-xs shadow-sm transition-all"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: QUANTITY & MEAL TYPE FORM */}
        {step === 'quantity' && selectedFood && (
          <form onSubmit={handleAddFoodSubmit} className="space-y-5 pt-1">
            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[var(--text-primary)] text-base">{selectedFood.name}</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#865BC4]/15 text-[#7347B0] dark:text-brand-400 border border-[#865BC4]/30">
                  {selectedFood.category || 'General'}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                Base Serving Reference: {selectedFood.servingSize} {selectedFood.servingUnit} ({selectedFood.nutrition.calories} kcal)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--text-secondary)] mb-1">Quantity Amount *</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    required
                    min="1"
                    value={quantityNum}
                    onChange={(e) => setQuantityNum(parseFloat(e.target.value) || 100)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] font-bold focus:outline-none focus:border-[#865BC4] focus:ring-2 focus:ring-[#865BC4]/20 shadow-sm"
                  />
                  <span className="text-xs font-bold text-[var(--text-primary)] uppercase px-2">{servingUnit}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[var(--text-secondary)] mb-1">Meal Category *</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-xs text-[var(--text-primary)] font-extrabold focus:outline-none focus:border-[#865BC4] focus:ring-2 focus:ring-[#865BC4]/20 shadow-sm"
                >
                  <option value="Breakfast" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Breakfast</option>
                  <option value="Lunch" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Lunch</option>
                  <option value="Dinner" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Dinner</option>
                  <option value="Snack" className="bg-[var(--bg-card)] text-[var(--text-primary)]">Snack</option>
                </select>
              </div>
            </div>

            {/* Live Calculated Nutrition Preview */}
            <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[#865BC4]/30 space-y-2 text-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#865BC4] dark:text-brand-400 block">Calculated Nutrition Preview</span>
              <div className="grid grid-cols-5 gap-2 text-center">
                <div className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm">
                  <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase block">Calories</span>
                  <span className="font-extrabold text-rose-500">{calcCalories} kcal</span>
                </div>
                <div className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm">
                  <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase block">Protein</span>
                  <span className="font-extrabold text-emerald-500">{calcProtein}g</span>
                </div>
                <div className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm">
                  <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase block">Carbs</span>
                  <span className="font-extrabold text-amber-500">{calcCarbs}g</span>
                </div>
                <div className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm">
                  <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase block">Fat</span>
                  <span className="font-extrabold text-sky-500">{calcFat}g</span>
                </div>
                <div className="p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm">
                  <span className="text-[9px] text-[var(--text-secondary)] font-bold uppercase block">Fiber</span>
                  <span className="font-extrabold text-emerald-500">{calcFiber}g</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl font-bold bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs border border-[var(--border-subtle)]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl font-extrabold bg-[#865BC4] hover:bg-[#7347B0] text-white text-xs shadow-lg shadow-[#865BC4]/30 flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add to Nutrition Log</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
