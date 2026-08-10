import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { WeeklyReportData } from '../../types/report';
import { FileText, Sparkles, ArrowRight, Award } from 'lucide-react';

export const WeeklyReportWidget: React.FC = () => {
  const [report, setReport] = useState<WeeklyReportData | null>(null);

  useEffect(() => {
    const fetchLatestReport = async () => {
      try {
        const res = await api.get('/reports/weekly');
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setReport(res.data.data[0]);
        }
      } catch (e) {
        // Silently handle if no report generated yet
      }
    };
    fetchLatestReport();
  }, []);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-200">
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#865BC4]/15 border border-[#865BC4]/30 text-[#865BC4] flex items-center justify-center flex-shrink-0">
          <Award className="w-5 h-5" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#865BC4]">
              WEEKLY FITNESS REPORT
            </span>
            {report && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                {report.workoutSummary.completedWorkouts} / {report.workoutSummary.targetWorkouts} Workouts ({report.workoutSummary.consistencyPct}%)
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)] mt-0.5">
            {report ? report.periodLabel : 'AI Performance & 6-Day Adaptive Plan'}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)] font-medium line-clamp-1 mt-0.5">
            {report ? report.aiInsight : 'Get a comprehensive review of your previous 6 days and an adaptive workout schedule for next week.'}
          </p>
        </div>
      </div>

      <Link
        to="/progress/weekly-reports"
        className="px-4 py-2 rounded-xl bg-[#865BC4] hover:bg-[#7347B0] text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all self-end sm:self-center flex-shrink-0"
      >
        <FileText className="w-3.5 h-3.5" />
        <span>View Report</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
};
