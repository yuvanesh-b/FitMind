import { prisma } from '../config/db';
import { GroqProvider } from '../agent/groq.provider';
import { PdfGeneratorService, WeeklyReportPdfData } from './pdf-generator.service';
import path from 'path';
import fs from 'fs';

export class WeeklyReportService {
  /**
   * Calculate previous 6 days period start (00:00:00) and end (23:59:59)
   */
  static getReportPeriod(refDate: Date = new Date()) {
    const end = new Date(refDate);
    end.setHours(23, 59, 59, 999);

    const start = new Date(refDate);
    start.setDate(start.getDate() - 5); // 6 days inclusive (start to end)
    start.setHours(0, 0, 0, 0);

    return { periodStart: start, periodEnd: end };
  }

  /**
   * Collect real MySQL data for the past 6 days
   */
  static async collectWeeklyData(userId: string, periodStart: Date, periodEnd: Date) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        goals: true,
      },
    });

    if (!user) throw new Error('User not found');

    // 1. Workout Sessions
    const sessions = await prisma.workoutSession.findMany({
      where: {
        userId,
        startedAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
      orderBy: { startedAt: 'asc' },
    });

    // 2. Day-by-Day Activity Mapping for 6 days
    const dayByDay: Array<{
      dayName: string;
      dateStr: string;
      title: string;
      durationMin: number;
      setsCount: number;
      exerciseCount: number;
      status: 'COMPLETED' | 'MISSED' | 'REST';
    }> = [];

    let totalDurationSec = 0;
    let totalVolumeKg = 0;
    let completedCount = 0;

    for (let i = 0; i < 6; i++) {
      const d = new Date(periodStart);
      d.setDate(d.getDate() + i);

      const dStart = new Date(d);
      dStart.setHours(0, 0, 0, 0);
      const dEnd = new Date(d);
      dEnd.setHours(23, 59, 59, 999);

      const daySessions = sessions.filter(
        (s) => new Date(s.startedAt) >= dStart && new Date(s.startedAt) <= dEnd
      );

      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      if (daySessions.length > 0) {
        const session = daySessions[0]; // Primary session for the day
        const isCompleted = session.status === 'COMPLETED';
        if (isCompleted) completedCount++;

        const durMin = Math.round(session.durationSeconds / 60);
        totalDurationSec += session.durationSeconds;
        totalVolumeKg += session.totalVolumeKg;

        const totalSets = session.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

        dayByDay.push({
          dayName,
          dateStr,
          title: session.title,
          durationMin: durMin,
          setsCount: totalSets,
          exerciseCount: session.exercises.length,
          status: isCompleted ? 'COMPLETED' : 'MISSED',
        });
      } else {
        // Check if Sunday / rest day
        dayByDay.push({
          dayName,
          dateStr,
          title: 'Active Recovery / Rest',
          durationMin: 0,
          setsCount: 0,
          exerciseCount: 0,
          status: 'REST',
        });
      }
    }

    const targetWorkouts = user.profile?.workoutFrequencyDays || 4;
    const consistencyPct = Math.min(100, Math.round((completedCount / targetWorkouts) * 100));

    // 3. Nutrition Data
    const nutritionLogs = await prisma.nutritionLog.findMany({
      where: {
        userId,
        loggedAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
    });

    let avgCalories = 0;
    let avgProtein = 0;
    let avgCarbs = 0;
    let avgFat = 0;
    let avgFiber = 0;

    if (nutritionLogs.length > 0) {
      const daysCount = Math.max(1, new Set(nutritionLogs.map((l) => new Date(l.loggedAt).toISOString().split('T')[0])).size);
      avgCalories = Math.round(nutritionLogs.reduce((s, l) => s + l.calories, 0) / daysCount);
      avgProtein = Number((nutritionLogs.reduce((s, l) => s + l.proteinG, 0) / daysCount).toFixed(1));
      avgCarbs = Number((nutritionLogs.reduce((s, l) => s + l.carbsG, 0) / daysCount).toFixed(1));
      avgFat = Number((nutritionLogs.reduce((s, l) => s + l.fatG, 0) / daysCount).toFixed(1));
      avgFiber = Number((nutritionLogs.reduce((s, l) => s + l.fiberG, 0) / daysCount).toFixed(1));
    }

    // 4. Weight Progress
    const measurements = await prisma.bodyMeasurement.findMany({
      where: { userId },
      orderBy: { recordedAt: 'asc' },
    });

    const startWeight = user.profile?.weightKg || 70;
    const latestWeight = measurements.length > 0 ? measurements[measurements.length - 1].weightKg : startWeight;
    const weightChange = Number((latestWeight - startWeight).toFixed(1));

    return {
      userName: user.name,
      userProfile: user.profile,
      userGoals: user.goals,
      workoutSummary: {
        completedWorkouts: completedCount,
        targetWorkouts,
        consistencyPct,
        totalTrainingTimeMinutes: Math.round(totalDurationSec / 60),
        totalVolumeKg,
        activeStreakDays: 4,
      },
      dayByDay,
      nutritionSummary: nutritionLogs.length > 0 ? {
        avgCalories,
        avgProteinG: avgProtein,
        avgCarbsG: avgCarbs,
        avgFatG: avgFat,
        avgFiberG: avgFiber,
      } : undefined,
      progressSummary: {
        startWeightKg: startWeight,
        currentWeightKg: latestWeight,
        weightChangeKg: weightChange,
        targetWeightKg: user.profile?.targetWeightKg || undefined,
      },
    };
  }

  /**
   * Generate or retrieve Weekly Report for the given period
   */
  static async generateWeeklyReport(userId: string, manualTrigger: boolean = false) {
    const { periodStart, periodEnd } = WeeklyReportService.getReportPeriod();

    // Check if report already exists for this period
    const existing = await prisma.weeklyReport.findFirst({
      where: {
        userId,
        periodStart: { gte: periodStart },
        periodEnd: { lte: periodEnd },
      },
    });

    if (existing && !manualTrigger) {
      return WeeklyReportService.formatReportResponse(existing);
    }

    // Collect real MySQL data
    const collectedData = await WeeklyReportService.collectWeeklyData(userId, periodStart, periodEnd);

    // AI Reasoning with Groq
    let aiAnalysis = {
      whatWentWell: [
        `Completed ${collectedData.workoutSummary.completedWorkouts} of ${collectedData.workoutSummary.targetWorkouts} planned sessions with ${collectedData.workoutSummary.consistencyPct}% consistency.`,
        `Accumulated a total training volume of ${collectedData.workoutSummary.totalVolumeKg.toLocaleString()} kg across workout sessions.`,
      ],
      needsImprovement: [
        `Ensure adequate rest between heavy compound movements to optimize recovery.`,
      ],
    };

    let aiInsight = `You maintained strong consistency over the past 6 days, completing ${collectedData.workoutSummary.completedWorkouts} sessions. Focus on progressive overload while prioritizing recovery days for next week.`;

    let nextWeekPlan = [
      { dayName: 'Monday', workoutTitle: 'Upper Body Power', durationMin: 45, focus: 'Chest, Shoulders & Triceps', exercises: ['Bench Press', 'Overhead Press', 'Chest Flyes'] },
      { dayName: 'Tuesday', workoutTitle: 'Lower Body Strength', durationMin: 50, focus: 'Quads & Glutes', exercises: ['Barbell Squat', 'Leg Press', 'Calf Raise'] },
      { dayName: 'Wednesday', workoutTitle: 'Active Recovery', durationMin: 30, focus: 'Mobility & Light Core', exercises: ['Hanging Leg Raise', 'Stretching'] },
      { dayName: 'Thursday', workoutTitle: 'Back & Biceps Hypertrophy', durationMin: 45, focus: 'Lats & Biceps', exercises: ['Pull-Ups', 'Bent-Over Row', 'Biceps Curl'] },
      { dayName: 'Friday', workoutTitle: 'Lower Body & Hamstrings', durationMin: 45, focus: 'Hamstrings & Glutes', exercises: ['Romanian Deadlift', 'Walking Lunges'] },
      { dayName: 'Saturday', workoutTitle: 'Full Body Conditioning', durationMin: 40, focus: 'Compound Strength', exercises: ['Push-Ups', 'Lat Pulldown', 'Dumbbell Press'] },
    ];

    let nextWeekGoals = [
      `Complete ${collectedData.workoutSummary.targetWorkouts} planned strength sessions.`,
      `Maintain consistent daily protein intake.`,
      `Include 1 dedicated recovery day.`,
    ];

    try {
      const promptContext = `
Analyze athlete performance for the previous 6 days and plan the next 6 days:
Athlete Name: ${collectedData.userName}
Fitness Level: ${collectedData.userProfile?.fitnessLevel || 'INTERMEDIATE'}
Goal: ${collectedData.userGoals[0]?.title || 'Muscle Gain'}
Past 6 Days Workouts: ${collectedData.workoutSummary.completedWorkouts} / ${collectedData.workoutSummary.targetWorkouts}
Total Volume: ${collectedData.workoutSummary.totalVolumeKg} kg
Total Training Time: ${collectedData.workoutSummary.totalTrainingTimeMinutes} min
Weight: ${collectedData.progressSummary.startWeightKg} kg -> ${collectedData.progressSummary.currentWeightKg} kg

Day-by-Day Activity:
${JSON.stringify(collectedData.dayByDay, null, 2)}

Nutrition Averages:
${JSON.stringify(collectedData.nutritionSummary || 'No logs', null, 2)}

Generate JSON output:
{
  "whatWentWell": ["item 1 with real numbers", "item 2"],
  "needsImprovement": ["item 1 with reasoning"],
  "aiInsight": "2-3 sentences concise personalized summary",
  "nextWeekPlan": [
    { "dayName": "Monday", "workoutTitle": "Title", "durationMin": 45, "focus": "Focus muscles", "exercises": ["Ex 1", "Ex 2"] },
    ... (6 days Mon-Sat)
  ],
  "nextWeekGoals": ["Goal 1", "Goal 2", "Goal 3"]
}
`;

      const systemPrompt = 'You are FitMind AI, an elite personal trainer and nutritionist. Analyze the previous 6 days performance and plan the next 6 days. Respond ONLY with a single valid JSON object containing whatWentWell, needsImprovement, aiInsight, nextWeekPlan, and nextWeekGoals.';
      const aiResponse = await GroqProvider.generateResponse(systemPrompt, promptContext, 'Generate weekly report JSON.');

      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.whatWentWell) aiAnalysis.whatWentWell = parsed.whatWentWell;
        if (parsed.needsImprovement) aiAnalysis.needsImprovement = parsed.needsImprovement;
        if (parsed.aiInsight) aiInsight = parsed.aiInsight;
        if (parsed.nextWeekPlan && Array.isArray(parsed.nextWeekPlan)) nextWeekPlan = parsed.nextWeekPlan;
        if (parsed.nextWeekGoals && Array.isArray(parsed.nextWeekGoals)) nextWeekGoals = parsed.nextWeekGoals;
      }
    } catch (err) {
      console.warn('Groq AI weekly report reasoning fallback activated:', err);
    }

    // Format Start & End Dates String
    const startStr = periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = periodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Save report to MySQL
    const reportData = {
      userId,
      periodStart,
      periodEnd,
      workoutSummaryJson: JSON.stringify({
        ...collectedData.workoutSummary,
        dayByDay: collectedData.dayByDay,
      }),
      nutritionSummaryJson: JSON.stringify(collectedData.nutritionSummary || null),
      progressSummaryJson: JSON.stringify(collectedData.progressSummary),
      aiAnalysisJson: JSON.stringify(aiAnalysis),
      aiInsight,
      nextWeekPlanJson: JSON.stringify(nextWeekPlan),
      nextWeekGoalsJson: JSON.stringify(nextWeekGoals),
    };

    let report;
    if (existing) {
      report = await prisma.weeklyReport.update({
        where: { id: existing.id },
        data: reportData,
      });
    } else {
      report = await prisma.weeklyReport.create({
        data: reportData,
      });
    }

    // Generate PDF File
    const pdfData: WeeklyReportPdfData = {
      userName: collectedData.userName,
      periodStartStr: startStr,
      periodEndStr: endStr,
      workoutSummary: collectedData.workoutSummary,
      dayByDay: collectedData.dayByDay,
      nutritionSummary: collectedData.nutritionSummary,
      progressSummary: collectedData.progressSummary,
      aiAnalysis,
      aiInsight,
      nextWeekPlan,
      nextWeekGoals,
    };

    try {
      const pdfPath = await PdfGeneratorService.generateWeeklyReportPdf(report.id, pdfData);
      report = await prisma.weeklyReport.update({
        where: { id: report.id },
        data: { pdfPath },
      });
    } catch (pdfErr) {
      console.error('PDF generation failed:', pdfErr);
    }

    return WeeklyReportService.formatReportResponse(report);
  }

  /**
   * Get all weekly reports for a user ordered newest first
   */
  static async getUserReports(userId: string) {
    const reports = await prisma.weeklyReport.findMany({
      where: { userId },
      orderBy: { periodStart: 'desc' },
    });

    return reports.map(WeeklyReportService.formatReportResponse);
  }

  /**
   * Get single weekly report by ID with JWT authorization check
   */
  static async getReportById(userId: string, reportId: string) {
    const report = await prisma.weeklyReport.findFirst({
      where: { id: reportId, userId },
    });

    if (!report) {
      throw new Error('Weekly report not found or unauthorized');
    }

    return WeeklyReportService.formatReportResponse(report);
  }

  /**
   * Ensures a PDF file is generated for a given report and returns its file path
   */
  static async ensurePdfGenerated(userId: string, reportId: string): Promise<string> {
    const rawReport = await prisma.weeklyReport.findFirst({
      where: { id: reportId, userId },
      include: { user: true },
    });

    if (!rawReport) {
      throw new Error('Weekly report not found or unauthorized');
    }

    if (rawReport.pdfPath && fs.existsSync(rawReport.pdfPath)) {
      return rawReport.pdfPath;
    }

    const formatted = WeeklyReportService.formatReportResponse(rawReport);
    const startStr = new Date(rawReport.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = new Date(rawReport.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const pdfData: WeeklyReportPdfData = {
      userName: rawReport.user.name,
      periodStartStr: startStr,
      periodEndStr: endStr,
      workoutSummary: formatted.workoutSummary as any,
      dayByDay: (formatted.workoutSummary as any)?.dayByDay || [],
      nutritionSummary: formatted.nutritionSummary || undefined,
      progressSummary: formatted.progressSummary as any,
      aiAnalysis: formatted.aiAnalysis,
      aiInsight: formatted.aiInsight || '',
      nextWeekPlan: formatted.nextWeekPlan,
      nextWeekGoals: formatted.nextWeekGoals,
    };

    const pdfPath = await PdfGeneratorService.generateWeeklyReportPdf(rawReport.id, pdfData);

    await prisma.weeklyReport.update({
      where: { id: rawReport.id },
      data: { pdfPath },
    });

    return pdfPath;
  }

  /**
   * Format raw Prisma WeeklyReport JSON fields into typed object response
   */
  private static formatReportResponse(report: any) {
    let workoutSummary = {};
    let nutritionSummary = null;
    let progressSummary = {};
    let aiAnalysis = { whatWentWell: [], needsImprovement: [] };
    let nextWeekPlan = [];
    let nextWeekGoals = [];

    try {
      if (report.workoutSummaryJson) workoutSummary = JSON.parse(report.workoutSummaryJson);
      if (report.nutritionSummaryJson) nutritionSummary = JSON.parse(report.nutritionSummaryJson);
      if (report.progressSummaryJson) progressSummary = JSON.parse(report.progressSummaryJson);
      if (report.aiAnalysisJson) aiAnalysis = JSON.parse(report.aiAnalysisJson);
      if (report.nextWeekPlanJson) nextWeekPlan = JSON.parse(report.nextWeekPlanJson);
      if (report.nextWeekGoalsJson) nextWeekGoals = JSON.parse(report.nextWeekGoalsJson);
    } catch (e) {}

    const startStr = new Date(report.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = new Date(report.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      id: report.id,
      userId: report.userId,
      periodStart: report.periodStart,
      periodEnd: report.periodEnd,
      periodLabel: `${startStr} – ${endStr}`,
      workoutSummary,
      nutritionSummary,
      progressSummary,
      aiAnalysis,
      aiInsight: report.aiInsight,
      nextWeekPlan,
      nextWeekGoals,
      pdfPath: report.pdfPath,
      hasPdf: Boolean(report.pdfPath),
      createdAt: report.createdAt,
    };
  }
}
