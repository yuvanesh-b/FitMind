import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { api } from '../services/api';
import { Food } from '../types/nutrition';
import { AddFoodModal } from '../components/nutrition/AddFoodModal';
import { FoodDetailsModal } from '../components/nutrition/FoodDetailsModal';
import { Search, Info, Plus, RefreshCw, Database, Utensils } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NutritionFoodsPage: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modals
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  const [preselectedFood, setPreselectedFood] = useState<Food | null>(null);
  const [selectedFoodDetails, setSelectedFoodDetails] = useState<Food | null>(null);

  const fetchFoods = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (selectedCategory && selectedCategory !== 'ALL') params.category = selectedCategory;

      const res = await api.get('/nutrition-foods', { params });
      if (res.data?.success) {
        setFoods(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load food database:', err);
      setError(err.response?.data?.message || 'Failed to load nutrition foods from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, [selectedCategory]);

  // Debounced search backend query
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFoods();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOpenAddFoodModal = (food?: Food) => {
    setPreselectedFood(food || null);
    setIsAddFoodModalOpen(true);
  };

  const categories = ['ALL', 'Protein', 'Carbs', 'Fruits', 'Vegetables', 'Healthy Fats', 'Dairy', 'Poultry', 'Seafood', 'Legumes', 'Grains', 'Nuts & Seeds'];

  return (
    <AppShell title="Nutrition Foods">
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-[var(--bg-main)] transition-colors duration-200">
        {/* Scrollable Main Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0 py-6 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6">
            
            {/* Header & Primary Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[var(--bg-card)] p-4 sm:p-5 rounded-2xl border border-[var(--border-subtle)] shadow-sm">
              <div>
                <h2 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">Nutrition Foods</h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Explore foods, nutrition values, and add them to your daily nutrition plan.
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Link
                  to="/nutrition"
                  className="px-4 py-2.5 rounded-xl font-bold bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-subtle)] text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <Utensils className="w-4 h-4 text-[#865BC4]" />
                  <span>Go to Daily Tracking</span>
                </Link>

                <button
                  onClick={() => handleOpenAddFoodModal()}
                  className="px-4 py-2.5 rounded-xl font-extrabold bg-[#865BC4] hover:bg-[#7347B0] text-white shadow-md shadow-[#865BC4]/20 text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <span>Custom Log</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#865BC4]" />
                  <span className="text-sm font-bold text-[var(--text-primary)]">Food Catalog</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#865BC4]/15 text-[#865BC4] border border-[#865BC4]/30">
                    {foods.length} Verified Foods
                  </span>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search foods..."
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[#865BC4] transition-colors"
                  />
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap border ${
                      selectedCategory === cat
                        ? 'bg-[#865BC4] text-white border-[#865BC4] shadow-md shadow-[#865BC4]/20'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-subtle)]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Loading State */}
              {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse pt-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="h-44 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]" />
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && !loading && (
                <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-rose-500/30 text-center space-y-3">
                  <p className="text-xs text-rose-600 font-semibold">{error}</p>
                  <button
                    onClick={fetchFoods}
                    className="px-4 py-2 rounded-xl bg-[#865BC4] text-white text-xs font-bold inline-flex items-center gap-2 shadow-md"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Connection</span>
                  </button>
                </div>
              )}

              {/* Empty Search State */}
              {!loading && !error && foods.length === 0 && (
                <div className="p-8 rounded-2xl bg-[var(--bg-surface)] text-center text-[var(--text-secondary)] text-xs space-y-1 my-6">
                  <p className="font-bold text-[var(--text-primary)]">No food items found matching "{searchQuery}".</p>
                  <p className="text-[11px] text-[var(--text-secondary)]">Try adjusting your category filter or search query.</p>
                </div>
              )}

              {/* 4-Column Responsive Food Cards Grid */}
              {!loading && !error && foods.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                  {foods.map((food) => (
                    <div
                      key={food.id}
                      className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[#865BC4]/40 transition-all flex flex-col justify-between shadow-sm group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-[#865BC4]/15 text-[#865BC4] border border-[#865BC4]/30">
                            {food.category || 'General'}
                          </span>
                          <span className="text-xs font-black text-[var(--text-primary)]">{food.nutrition.calories} kcal</span>
                        </div>

                        <h4 className="font-extrabold text-[var(--text-primary)] text-sm group-hover:text-[#865BC4] transition-colors line-clamp-1">
                          {food.name}
                        </h4>
                        <p className="text-[10px] text-[var(--text-secondary)] font-medium mt-0.5 mb-2.5">
                          Serving: {food.servingSize} {food.servingUnit}
                        </p>

                        {/* Macro Grid Pills */}
                        <div className="grid grid-cols-4 gap-1 text-center text-[9px] font-bold text-[var(--text-secondary)] py-2 border-t border-[var(--border-subtle)]">
                          <div className="p-1 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                            <span className="block text-[8px] text-[var(--text-secondary)] uppercase">Protein</span>
                            <span className="text-[var(--text-primary)] font-black">{food.nutrition.protein}g</span>
                          </div>
                          <div className="p-1 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                            <span className="block text-[8px] text-[var(--text-secondary)] uppercase">Carbs</span>
                            <span className="text-[var(--text-primary)] font-black">{food.nutrition.carbs}g</span>
                          </div>
                          <div className="p-1 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                            <span className="block text-[8px] text-[var(--text-secondary)] uppercase">Fat</span>
                            <span className="text-[var(--text-primary)] font-black">{food.nutrition.fat}g</span>
                          </div>
                          <div className="p-1 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                            <span className="block text-[8px] text-[var(--text-secondary)] uppercase">Fiber</span>
                            <span className="text-emerald-600 font-black">{food.nutrition.fiber || 0}g</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-1.5 pt-2.5 border-t border-[var(--border-subtle)] mt-2">
                        <button
                          onClick={() => setSelectedFoodDetails(food)}
                          className="py-1.5 px-2 rounded-xl font-bold bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] text-[11px] border border-[var(--border-subtle)] flex items-center justify-center gap-1 transition-all"
                        >
                          <Info className="w-3 h-3 text-[var(--text-secondary)]" />
                          <span>View Details</span>
                        </button>

                        <button
                          onClick={() => handleOpenAddFoodModal(food)}
                          className="py-1.5 px-2 rounded-xl font-extrabold bg-[#865BC4] hover:bg-[#7347B0] text-white text-[11px] flex items-center justify-center gap-1 shadow-md shadow-[#865BC4]/20 transition-all"
                        >
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Food Modal */}
      <AddFoodModal
        isOpen={isAddFoodModalOpen}
        onClose={() => setIsAddFoodModalOpen(false)}
        onSuccess={fetchFoods}
        preselectedFood={preselectedFood}
      />

      {/* Food Details Side Panel / Modal */}
      <FoodDetailsModal
        food={selectedFoodDetails}
        isOpen={Boolean(selectedFoodDetails)}
        onClose={() => setSelectedFoodDetails(null)}
        onLogFood={(food) => handleOpenAddFoodModal(food)}
      />
    </AppShell>
  );
};
