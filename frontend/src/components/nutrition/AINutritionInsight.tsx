import React, { useState, useEffect } from 'react';
import { AINutritionInsightData } from '../../types/nutrition';
import { api } from '../../services/api';
import { Utensils, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AINutritionInsight: React.FC = () => {
  const navigate = useNavigate();
  const [insightData, setInsightData] = useState<AINutritionInsightData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchInsight = async () => {
    setLoading(true);
    try {
      const res = await api.get('/nutrition/ai-insight');
      if (res.data.success) {
        setInsightData(res.data.data);
      }
    } catch (e) {
      setInsightData({
        available: false,
        insight: 'AI insights are temporarily unavailable. Your nutrition tracking is still working normally.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, []);

  if (loading) {
    return (
      <div className="p-5 rounded-2xl bg-surface-dark border border-surface-border h-full animate-pulse flex flex-col justify-between space-y-3">
        <div className="w-36 h-5 bg-surface-elevated rounded-md" />
        <div className="w-full h-16 bg-surface-elevated rounded-xl" />
        <div className="w-32 h-8 bg-surface-elevated rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-surface-dark border border-brand-500/30 flex flex-col justify-between h-full relative overflow-hidden group hover:border-brand-500/50 transition-all shadow-md">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600/10 rounded-full blur-2xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-600/20 text-brand-400 border border-brand-500/30">
              <Utensils className="w-4 h-4 text-[#865BC4]" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-1.5">
                <span>AI Nutrition Insight</span>
                <Sparkles className="w-3.5 h-3.5 text-[#865BC4] dark:text-brand-400" />
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Groq Agent personalized macro feedback</p>
            </div>
          </div>

          <button
            onClick={fetchInsight}
            className="p-1.5 rounded-lg bg-surface-elevated text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            title="Refresh AI Insight"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-surface-elevated/70 border border-slate-200 dark:border-surface-border/60 text-xs text-slate-800 dark:text-slate-300 font-medium leading-relaxed mb-3">
          {insightData?.insight || 'Analyze your daily meal logs for customized macro coaching advice.'}
        </div>

        {insightData?.actionableSuggestion && (
          <div className="p-3 rounded-xl bg-[#865BC4]/10 border border-[#865BC4]/30 text-[11px] text-[#623999] dark:text-brand-300 font-semibold mb-3">
            <span className="font-extrabold uppercase text-[#865BC4] dark:text-brand-400 block mb-0.5">Recommendation:</span>
            {insightData.actionableSuggestion}
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-surface-border/40">
        <button
          onClick={() => navigate('/ai-trainer')}
          className="w-full py-2.5 px-4 rounded-xl font-bold bg-brand-600 hover:bg-brand-500 text-white text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-600/25"
        >
          <Utensils className="w-4 h-4" />
          <span>Ask AI Trainer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
