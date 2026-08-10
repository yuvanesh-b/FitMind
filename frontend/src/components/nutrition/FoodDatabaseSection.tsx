import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Food } from '../../types/nutrition';
import { Search, Info, Plus, Loader2, RefreshCw, Database } from 'lucide-react';

interface FoodDatabaseSectionProps {
  onViewDetails: (food: Food) => void;
  onLogFood: (food: Food) => void;
}

export const FoodDatabaseSection: React.FC<FoodDatabaseSectionProps> = ({
  onViewDetails,
  onLogFood,
}) => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const fetchFoods = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/nutrition/foods');
      if (res.data.success) {
        setFoods(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load food database:', err);
      setError(err.response?.data?.message || 'Failed to load food database from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const categories = ['ALL', 'Protein', 'Carbs', 'Fruits', 'Vegetables', 'Healthy Fats', 'Dairy', 'Poultry', 'Seafood', 'Legumes', 'Grains', 'Nuts & Seeds'];

  const filteredFoods = foods.filter((food) => {
    const cat = (food.category || '').toLowerCase();
    const name = food.name.toLowerCase();
    const q = searchQuery.toLowerCase();

    let matchesCategory = selectedCategory === 'ALL';
    if (!matchesCategory) {
      const targetCat = selectedCategory.toLowerCase();
      if (targetCat === 'protein') {
        matchesCategory = ['poultry', 'seafood', 'dairy', 'plant protein', 'legumes'].some((c) => cat.includes(c));
      } else if (targetCat === 'carbs') {
        matchesCategory = ['grains', 'vegetables', 'fruits', 'legumes'].some((c) => cat.includes(c));
      } else if (targetCat === 'healthy fats') {
        matchesCategory = ['nuts', 'seeds', 'spreads', 'healthy fats'].some((c) => cat.includes(c));
      } else {
        matchesCategory = cat.includes(targetCat);
      }
    }

    const matchesSearch = name.includes(q) || cat.includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-surface-dark border border-surface-border space-y-4 shadow-sm">
      {/* Fixed Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border/50 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Database className="w-5 h-5 text-brand-400" />
            <h3 className="text-xl font-extrabold text-white tracking-tight">Food Database</h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-600/20 text-brand-400 border border-brand-500/30">
              {foods.length} Seeded Foods
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Explore verified nutrition profiles, ingredients, and benefits from MySQL
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search foods..."
            className="w-full bg-surface-elevated border border-surface-border rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>
      </div>

      {/* Fixed Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap border ${
              selectedCategory === cat
                ? 'bg-brand-600 text-white border-brand-500 shadow-md shadow-brand-600/20'
                : 'bg-surface-elevated text-slate-400 hover:text-white border-surface-border'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Internal Scrollable Food Grid Container (Fixed height ~3 rows with custom subtle dark scrollbar) */}
      <div className="max-h-[450px] sm:max-h-[500px] lg:max-h-[560px] overflow-y-auto pr-1 space-y-4 custom-scrollbar">
        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-surface-elevated/60 border border-surface-border" />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-6 rounded-2xl bg-surface-elevated/60 border border-accent-rose/30 text-center space-y-3">
            <p className="text-xs text-accent-rose font-semibold">{error}</p>
            <button
              onClick={fetchFoods}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold inline-flex items-center gap-2 shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        )}

        {/* Empty Filter State */}
        {!loading && !error && filteredFoods.length === 0 && (
          <div className="p-8 rounded-2xl bg-surface-elevated/40 text-center text-slate-400 text-xs space-y-1 my-6">
            <p className="font-bold text-white">No food items found matching "{searchQuery}".</p>
            <p className="text-[11px] text-slate-500">Try adjusting your category filter or search query.</p>
          </div>
        )}

        {/* 4-Column Responsive Compact Food Cards Grid */}
        {!loading && !error && filteredFoods.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredFoods.map((food) => (
              <div
                key={food.id}
                className="p-4 rounded-2xl bg-surface-elevated/70 border border-surface-border/70 hover:border-brand-500/40 transition-all flex flex-col justify-between shadow-sm group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-brand-600/20 text-brand-400 border border-brand-500/30">
                      {food.category || 'General'}
                    </span>
                    <span className="text-xs font-black text-white">{food.nutrition.calories} kcal</span>
                  </div>

                  <h4 className="font-extrabold text-white text-sm group-hover:text-brand-300 transition-colors line-clamp-1">
                    {food.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5 mb-2.5">
                    Serving: {food.servingSize} {food.servingUnit}
                  </p>

                  {/* Macro Grid Pills */}
                  <div className="grid grid-cols-4 gap-1 text-center text-[9px] font-bold text-slate-300 py-2 border-t border-surface-border/50">
                    <div className="p-1 rounded-md bg-surface-dark/60 border border-surface-border/40">
                      <span className="block text-[8px] text-slate-500 uppercase">Protein</span>
                      <span className="text-white font-black">{food.nutrition.protein}g</span>
                    </div>
                    <div className="p-1 rounded-md bg-surface-dark/60 border border-surface-border/40">
                      <span className="block text-[8px] text-slate-500 uppercase">Carbs</span>
                      <span className="text-white font-black">{food.nutrition.carbs}g</span>
                    </div>
                    <div className="p-1 rounded-md bg-surface-dark/60 border border-surface-border/40">
                      <span className="block text-[8px] text-slate-500 uppercase">Fat</span>
                      <span className="text-white font-black">{food.nutrition.fat}g</span>
                    </div>
                    <div className="p-1 rounded-md bg-surface-dark/60 border border-surface-border/40">
                      <span className="block text-[8px] text-slate-500 uppercase">Fiber</span>
                      <span className="text-accent-emerald font-black">{food.nutrition.fiber || 0}g</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-2.5 border-t border-surface-border/50 mt-2">
                  <button
                    onClick={() => onViewDetails(food)}
                    className="py-1.5 px-2 rounded-xl font-bold bg-surface-dark hover:bg-surface-border text-slate-300 text-[11px] border border-surface-border/80 flex items-center justify-center gap-1 transition-all"
                  >
                    <Info className="w-3 h-3 text-slate-400" />
                    <span>Details</span>
                  </button>

                  <button
                    onClick={() => onLogFood(food)}
                    className="py-1.5 px-2 rounded-xl font-extrabold bg-brand-600 hover:bg-brand-500 text-white text-[11px] flex items-center justify-center gap-1 shadow-md shadow-brand-600/20 transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
