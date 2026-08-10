import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { Food } from '../../types/nutrition';
import { Search, Loader2, Info, Plus } from 'lucide-react';

interface FoodSearchProps {
  onSelectFood: (food: Food) => void;
  onViewDetails?: (food: Food) => void;
  initialQuery?: string;
}

export const FoodSearch: React.FC<FoodSearchProps> = ({ onSelectFood, onViewDetails, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const handler = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get('/nutrition/foods/search', {
          params: { q: query.trim() },
        });
        if (res.data.success) {
          setResults(res.data.data);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Failed to search foods:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(handler);
  }, [query]);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
        Food Search / Item Name *
      </label>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          required
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          placeholder="Search database (e.g. Chicken, Oats, Eggs...)"
          className="w-full bg-surface-elevated border border-surface-border rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-colors"
        />
        {loading && (
          <Loader2 className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-400 animate-spin" />
        )}
      </div>

      {/* Autocomplete Dropdown Cards */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-surface-dark border border-surface-border rounded-xl shadow-2xl max-h-80 overflow-y-auto p-2 space-y-2">
          {results.map((food) => (
            <div
              key={food.id}
              className="p-3 rounded-xl bg-surface-elevated border border-surface-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-sm">{food.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-brand-600/20 text-brand-400 border border-brand-500/30">
                    {food.category || 'General'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-semibold block mt-0.5">
                  Base Serving: {food.servingSize}{food.servingUnit} • {food.nutrition?.calories || 0} kcal
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                  P: {food.nutrition?.protein || 0}g | C: {food.nutrition?.carbs || 0}g | F: {food.nutrition?.fat || 0}g | Fib: {food.nutrition?.fiber || 0}g
                </span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                {onViewDetails && (
                  <button
                    type="button"
                    onClick={() => onViewDetails(food)}
                    className="px-2.5 py-1.5 rounded-lg bg-surface-dark hover:bg-surface-border text-slate-300 text-[11px] font-bold border border-surface-border flex items-center gap-1 transition-colors"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span>View Details</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onSelectFood(food);
                    setQuery(food.name);
                    setIsOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Select</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
