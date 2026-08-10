import React, { useState, useEffect } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { api } from '../services/api';
import { WeeklyReportData } from '../types/report';
import {
  FileText,
  Download,
  Plus,
  Loader2,
  Calendar,
  Sparkles,
  Check,
  X,
  TrendingUp,
  Dumbbell,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Flame,
  Eye,
} from 'lucide-react';

export const WeeklyReportsPage: React.FC = () => {
  const [reports, setReports] = useState<WeeklyReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<WeeklyReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/reports/weekly');
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch weekly reports:', err);
      setError(err.response?.data?.message || 'Failed to load weekly reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await api.post('/reports/weekly/generate');
      if (res.data.success) {
        await fetchReports();
        setSelectedReport(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate weekly report.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPdf = async (reportId: string, periodLabel: string) => {
    if (downloadingId) return;
    setDownloadingId(reportId);
    setError(null);
    try {
      const response = await api.get(`/reports/weekly/${reportId}/pdf`, {
        responseType: 'blob',
      });

      if (response.data.type === 'application/json') {
        const text = await response.data.text();
        let errMsg = 'Unable to generate the PDF right now. Please try again.';
        try {
          const jsonErr = JSON.parse(text);
          if (jsonErr?.message) errMsg = jsonErr.message;
        } catch (_) {}
        console.error('PDF generation error from backend:', text);
        setError(errMsg);
        return;
      }

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const cleanPeriod = (periodLabel || '').replace(/\s+/g, '_').replace(/–|-/g, 'to');
      link.setAttribute('download', `FitMind_Weekly_Report_${cleanPeriod}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (e: any) {
      console.error('Failed to download PDF:', e);
      let errMsg = 'Unable to generate the PDF right now. Please try again.';
      if (e?.response?.data instanceof Blob && e.response.data.type === 'application/json') {
        try {
          const text = await e.response.data.text();
          const jsonErr = JSON.parse(text);
          if (jsonErr?.message) errMsg = jsonErr.message;
        } catch (_) {}
      } else if (e?.response?.data?.message) {
        errMsg = e.response.data.message;
      }
      setError(errMsg);
    } finally {
      setDownloadingId(null);
    }
  };

  const latestReport = reports.length > 0 ? reports[0] : null;

  return (
    <AppShell title="Weekly Fitness Reports">
      <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto min-h-0 py-6 custom-scrollbar">
          <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6">
            {/* Header & Primary Generator Action Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-dark/50 p-5 rounded-2xl border border-surface-border">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Weekly Fitness Reports</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                  Previous 6 days activity analysis + Next 6 days personalized workout & recovery plan
                </p>
              </div>

              <button
                onClick={handleGenerateReport}
                disabled={generating}
                className="px-5 py-2.5 rounded-xl font-extrabold bg-brand-600 hover:bg-brand-500 text-white text-xs shadow-lg shadow-brand-600/30 transition-all disabled:opacity-50"
              >
                {generating ? 'Analyzing 6 Days Data...' : 'Current Week Report'}
              </button>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-surface-dark border border-accent-rose/30 text-xs text-slate-300">
                <span className="text-accent-rose font-bold">{error}</span>
              </div>
            )}

            {/* CURRENT WEEK REPORT BANNER */}
            {latestReport && (
              <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-md space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#865BC4] dark:text-brand-400" />
                      <span className="text-xs font-black uppercase text-[#7347B0] dark:text-brand-400 tracking-wider">CURRENT WEEK REPORT</span>
                    </div>
                    <h3 className="text-xl font-black text-[var(--text-primary)] mt-0.5">{latestReport.periodLabel}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedReport(latestReport)}
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Full Report</span>
                    </button>

                    <button
                      onClick={() => handleDownloadPdf(latestReport.id, latestReport.periodLabel)}
                      className="px-4 py-2 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] flex items-center gap-1.5 transition-all"
                    >
                      <Download className="w-4 h-4 text-[#865BC4] dark:text-brand-400" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>

                {/* Metrics Summary Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
                    <span className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase block mb-1">Workouts</span>
                    <span className="text-lg font-black text-[var(--text-primary)]">
                      {latestReport.workoutSummary.completedWorkouts} / {latestReport.workoutSummary.targetWorkouts}
                    </span>
                    <span className="text-[10px] text-accent-emerald block font-bold mt-0.5">
                      {latestReport.workoutSummary.consistencyPct}% consistency
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
                    <span className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase block mb-1">Training Time</span>
                    <span className="text-lg font-black text-[var(--text-primary)]">
                      {Math.floor(latestReport.workoutSummary.totalTrainingTimeMinutes / 60)}h {latestReport.workoutSummary.totalTrainingTimeMinutes % 60}m
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
                    <span className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase block mb-1">Total Volume</span>
                    <span className="text-lg font-black text-[var(--text-primary)]">
                      {latestReport.workoutSummary.totalVolumeKg.toLocaleString()} kg
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
                    <span className="text-[10px] font-extrabold text-[var(--text-secondary)] uppercase block mb-1">Weight Progress</span>
                    <span className="text-lg font-black text-[var(--text-primary)]">
                      {latestReport.progressSummary.startWeightKg} → {latestReport.progressSummary.currentWeightKg} kg
                    </span>
                  </div>
                </div>

                {/* AI Insight Highlight */}
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[#865BC4]/30 text-xs flex items-start gap-2.5 shadow-sm">
                  <Sparkles className="w-4 h-4 text-[#865BC4] dark:text-brand-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[var(--text-primary)] font-medium leading-relaxed italic">
                    "{latestReport.aiInsight}"
                  </p>
                </div>
              </div>
            )}

            {/* PREVIOUS REPORTS HISTORY LIST */}
            <div className="p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4 shadow-sm">
              <h3 className="text-lg font-extrabold text-[var(--text-primary)] tracking-tight">Previous Weekly Reports</h3>

              {loading ? (
                <div className="py-12 text-center text-[var(--text-secondary)] flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
                  <span className="text-xs font-bold">Loading weekly reports...</span>
                </div>
              ) : reports.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[var(--bg-surface)] text-center text-xs space-y-2 max-w-lg mx-auto">
                  <FileText className="w-8 h-8 text-[var(--text-secondary)] mx-auto opacity-60 mb-2" />
                  <p className="font-extrabold text-[var(--text-primary)] text-base">No report generated yet.</p>
                  <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed">
                    Generate your current week report to view your workout summary, progress insights, and personalized recommendations.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs hover:border-[#865BC4]/40 transition-all shadow-sm"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-[var(--text-primary)] text-sm">{report.periodLabel}</h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#865BC4]/15 text-[#7347B0] dark:text-brand-400 border border-[#865BC4]/30">
                            {report.workoutSummary.completedWorkouts} / {report.workoutSummary.targetWorkouts} Workouts
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-1 font-medium">
                          Training Time: {Math.floor(report.workoutSummary.totalTrainingTimeMinutes / 60)}h {report.workoutSummary.totalTrainingTimeMinutes % 60}m • Volume: {report.workoutSummary.totalVolumeKg.toLocaleString()} kg
                        </p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold text-xs border border-[var(--border-subtle)] flex items-center gap-1.5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#865BC4] dark:text-brand-400" />
                          <span>View Report</span>
                        </button>

                        <button
                          onClick={() => handleDownloadPdf(report.id, report.periodLabel)}
                          disabled={downloadingId === report.id}
                          className="px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
                        >
                          {downloadingId === report.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Downloading...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>PDF</span>
                            </>
                          )}
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

      {/* FULL 9-SECTION REPORT MODAL OVERLAY */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-[1150px] w-[calc(100%-24px)] sm:w-[calc(100%-48px)] max-h-[calc(100vh-48px)] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl flex flex-col justify-between overflow-y-auto custom-scrollbar relative">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[var(--bg-card)]/95 backdrop-blur-md p-5 sm:p-6 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#865BC4]/15 text-[#7347B0] dark:text-brand-400 border border-[#865BC4]/30">
                  {selectedReport.periodLabel}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] mt-1">Weekly Fitness Report</h3>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 rounded-xl bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 text-xs overflow-y-auto">
              {/* SECTION 1: REPORT SUMMARY HIGHLIGHT */}
              <div className="p-5 rounded-2xl bg-[#865BC4]/10 border border-[#865BC4]/30 space-y-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#865BC4] dark:text-brand-400 block">AI Executive Summary</span>
                <p className="text-sm font-bold text-[var(--text-primary)] leading-relaxed">{selectedReport.aiInsight}</p>
              </div>

              {/* SECTION 2: WORKOUT METRICS GRID */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-secondary)] font-extrabold uppercase block mb-1">WORKOUTS</span>
                  <span className="text-lg font-black text-[var(--text-primary)]">{selectedReport.workoutSummary.completedWorkouts} / {selectedReport.workoutSummary.targetWorkouts}</span>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-secondary)] font-extrabold uppercase block mb-1">CONSISTENCY</span>
                  <span className="text-lg font-black text-emerald-500">{selectedReport.workoutSummary.consistencyPct}%</span>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-secondary)] font-extrabold uppercase block mb-1">TRAINING TIME</span>
                  <span className="text-lg font-black text-[var(--text-primary)]">{Math.floor(selectedReport.workoutSummary.totalTrainingTimeMinutes / 60)}h {selectedReport.workoutSummary.totalTrainingTimeMinutes % 60}m</span>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <span className="text-[10px] text-[var(--text-secondary)] font-extrabold uppercase block mb-1">TOTAL VOLUME</span>
                  <span className="text-lg font-black text-[#865BC4] dark:text-brand-400">{selectedReport.workoutSummary.totalVolumeKg.toLocaleString()} kg</span>
                </div>
              </div>

              {/* SECTION 3: PREVIOUS 6 DAYS ACTIVITY TABLE */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">2. Previous 6 Days Activity Log</h3>
                <div className="space-y-2">
                  {selectedReport.workoutSummary.dayByDay?.map((day, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                      <div>
                        <span className="font-extrabold text-[var(--text-primary)] text-sm block">{day.dayName}</span>
                        <span className="text-[11px] text-[var(--text-secondary)] font-medium">{day.title}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[var(--text-primary)] block">{day.durationMin > 0 ? `${day.durationMin} min` : 'Rest Day'}</span>
                        <span className={`text-[10px] font-extrabold uppercase ${day.status === 'COMPLETED' ? 'text-emerald-500' : day.status === 'MISSED' ? 'text-rose-500' : 'text-slate-400'}`}>
                          {day.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 4: NUTRITION & PROGRESS SUMMARY */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedReport.nutritionSummary ? (
                  <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2 shadow-sm">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">3. Nutrition Averages</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-[var(--text-secondary)] block">Calories:</span><span className="font-extrabold text-[var(--text-primary)]">{selectedReport.nutritionSummary.avgCalories} kcal</span></div>
                      <div><span className="text-[var(--text-secondary)] block">Protein:</span><span className="font-extrabold text-emerald-500">{selectedReport.nutritionSummary.avgProteinG}g</span></div>
                      <div><span className="text-[var(--text-secondary)] block">Carbs:</span><span className="font-extrabold text-amber-500">{selectedReport.nutritionSummary.avgCarbsG}g</span></div>
                      <div><span className="text-[var(--text-secondary)] block">Fat:</span><span className="font-extrabold text-sky-500">{selectedReport.nutritionSummary.avgFatG}g</span></div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2 shadow-sm">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">3. Nutrition Summary</h3>
                    <p className="text-xs text-[var(--text-secondary)]">No detailed nutrition logs recorded for this period.</p>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2 shadow-sm">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">4. Weight Progress</h3>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Starting Weight:</span><span className="font-bold text-[var(--text-primary)]">{selectedReport.progressSummary?.startWeightKg || 70} kg</span></div>
                    <div className="flex justify-between"><span className="text-[var(--text-secondary)]">Current Weight:</span><span className="font-bold text-[var(--text-primary)]">{selectedReport.progressSummary?.currentWeightKg || 70} kg</span></div>
                    <div className="flex justify-between border-t border-[var(--border-subtle)] pt-1"><span className="text-[var(--text-secondary)] font-bold">Net Change:</span><span className="font-extrabold text-[#865BC4] dark:text-brand-400">{selectedReport.progressSummary?.weightChangeKg >= 0 ? '+' : ''}{selectedReport.progressSummary?.weightChangeKg || 0} kg</span></div>
                  </div>
                </div>
              </div>

              {/* SECTION 5: AI WHAT WENT WELL */}
              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-emerald-500/30 space-y-2 shadow-sm">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">5. What Went Well</h3>
                <div className="space-y-1 text-xs text-[var(--text-primary)] font-medium">
                  {selectedReport.aiAnalysis?.whatWentWell?.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 6: AI NEEDS IMPROVEMENT */}
              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-rose-500/30 space-y-2 shadow-sm">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-500">6. Needs Improvement</h3>
                <div className="space-y-1 text-xs text-[var(--text-primary)] font-medium">
                  {selectedReport.aiAnalysis?.needsImprovement?.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 7: NEXT 6 DAYS PLAN */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">7. Next 6 Days Personalized AI Schedule</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedReport.nextWeekPlan?.map((plan, i) => (
                    <div key={i} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#865BC4] dark:text-brand-400 uppercase">{plan.dayName}</span>
                        <span className="text-[10px] font-bold text-[var(--text-secondary)]">{plan.durationMin} min</span>
                      </div>
                      <h4 className="font-extrabold text-[var(--text-primary)] text-sm">{plan.workoutTitle}</h4>
                      <p className="text-[11px] text-[var(--text-secondary)] font-medium">Focus: {plan.focus}</p>
                      <div className="pt-2 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-primary)] font-medium space-y-0.5">
                        {plan.exercises?.map((ex, exIdx) => (
                          <div key={exIdx}>• {ex}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION 8: NEXT 6 DAYS GOALS */}
              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2 shadow-sm">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-secondary)]">8. Next 6 Days Action Goals</h3>
                <div className="space-y-1.5">
                  {selectedReport.nextWeekGoals?.map((goal, i) => (
                    <div key={i} className="flex items-center gap-2 text-[var(--text-primary)] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#865BC4] dark:bg-brand-400" />
                      <span>{goal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-[var(--bg-card)]/95 backdrop-blur-md p-4 sm:p-5 border-t border-[var(--border-subtle)] flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2.5 rounded-xl font-bold bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] text-[var(--text-primary)] text-xs border border-[var(--border-subtle)]"
              >
                Close
              </button>

              <button
                onClick={() => handleDownloadPdf(selectedReport.id, selectedReport.periodLabel)}
                disabled={downloadingId === selectedReport.id}
                className="px-6 py-2.5 rounded-xl font-extrabold bg-brand-600 hover:bg-brand-500 text-white text-xs shadow-lg shadow-brand-600/30 flex items-center gap-2 disabled:opacity-50"
              >
                {downloadingId === selectedReport.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download PDF Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
};
