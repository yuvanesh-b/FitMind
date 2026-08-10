import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export interface WeeklyReportPdfData {
  userName: string;
  periodStartStr: string;
  periodEndStr: string;
  workoutSummary: {
    completedWorkouts: number;
    targetWorkouts: number;
    consistencyPct: number;
    totalTrainingTimeMinutes: number;
    totalVolumeKg: number;
    activeStreakDays: number;
  };
  dayByDay: Array<{
    dayName: string;
    dateStr: string;
    title: string;
    durationMin: number;
    setsCount: number;
    exerciseCount: number;
    status: 'COMPLETED' | 'MISSED' | 'REST';
  }>;
  nutritionSummary?: {
    avgCalories: number;
    avgProteinG: number;
    avgCarbsG: number;
    avgFatG: number;
    avgFiberG: number;
  };
  progressSummary: {
    startWeightKg: number;
    currentWeightKg: number;
    weightChangeKg: number;
    targetWeightKg?: number;
  };
  aiAnalysis: {
    whatWentWell: string[];
    needsImprovement: string[];
  };
  aiInsight: string;
  nextWeekPlan: Array<{
    dayName: string;
    workoutTitle: string;
    durationMin: number;
    focus: string;
    exercises: string[];
  }>;
  nextWeekGoals: string[];
}

export class PdfGeneratorService {
  /**
   * Generates a PDF file for the weekly report and returns the file path
   */
  static async generateWeeklyReportPdf(reportId: string, data: WeeklyReportPdfData): Promise<string> {
    const reportsDir = path.join(process.cwd(), 'uploads', 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filePath = path.join(reportsDir, `weekly_report_${reportId}.pdf`);

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
        const writeStream = fs.createWriteStream(filePath);

        doc.pipe(writeStream);

        // Styling Palette
        const primaryColor = '#7C3AED'; // Purple
        const darkTextColor = '#1E293B';
        const lightGrayColor = '#64748B';
        const accentBgColor = '#F8FAFC';
        const borderColor = '#E2E8F0';

        // 1. HEADER BRANDING
        doc.fillColor(primaryColor).fontSize(20).font('Helvetica-Bold').text('FITMIND AI', 40, 40);
        doc.fillColor(lightGrayColor).fontSize(10).font('Helvetica-Bold').text('INTELLIGENT COACH', 40, 62);

        doc.fillColor(darkTextColor).fontSize(14).font('Helvetica-Bold').text('WEEKLY FITNESS REPORT', 320, 40, { align: 'right' });
        doc.fillColor(lightGrayColor).fontSize(9).font('Helvetica').text(`Period: ${data.periodStartStr} - ${data.periodEndStr}`, 320, 58, { align: 'right' });
        doc.fillColor(lightGrayColor).fontSize(9).font('Helvetica').text(`Athlete: ${data.userName}`, 320, 70, { align: 'right' });

        doc.moveTo(40, 88).lineTo(555, 88).strokeColor(borderColor).lineWidth(1).stroke();

        let y = 100;

        // 2. WEEKLY PERFORMANCE METRICS SUMMARY (4 Cards)
        doc.fillColor(darkTextColor).fontSize(12).font('Helvetica-Bold').text('1. Weekly Performance Summary', 40, y);
        y += 18;

        const cardWidth = 120;
        const cardHeight = 46;
        const metrics = [
          { label: 'WORKOUTS', val: `${data.workoutSummary?.completedWorkouts ?? 0} / ${data.workoutSummary?.targetWorkouts ?? 4}` },
          { label: 'CONSISTENCY', val: `${data.workoutSummary?.consistencyPct ?? 0}%` },
          { label: 'TRAINING TIME', val: `${Math.floor((data.workoutSummary?.totalTrainingTimeMinutes ?? 0) / 60)}h ${(data.workoutSummary?.totalTrainingTimeMinutes ?? 0) % 60}m` },
          { label: 'TOTAL VOLUME', val: `${(data.workoutSummary?.totalVolumeKg ?? 0).toLocaleString()} kg` },
        ];

        metrics.forEach((m, idx) => {
          const x = 40 + idx * 130;
          doc.rect(x, y, cardWidth, cardHeight).fillAndStroke(accentBgColor, borderColor);
          doc.fillColor(lightGrayColor).fontSize(7).font('Helvetica-Bold').text(m.label, x + 8, y + 8);
          doc.fillColor(darkTextColor).fontSize(11).font('Helvetica-Bold').text(m.val, x + 8, y + 22);
        });

        y += 60;

        // 3. DAY-BY-DAY ACTIVITY (Previous 6 Days Table)
        doc.fillColor(darkTextColor).fontSize(12).font('Helvetica-Bold').text('2. Previous 6 Days Activity', 40, y);
        y += 18;

        // Table Header
        doc.rect(40, y, 515, 20).fill('#EDF2F7');
        doc.fillColor(darkTextColor).fontSize(8).font('Helvetica-Bold');
        doc.text('Day / Date', 48, y + 6, { width: 100 });
        doc.text('Workout Session', 150, y + 6, { width: 160 });
        doc.text('Duration', 310, y + 6, { width: 70 });
        doc.text('Sets / Exercises', 380, y + 6, { width: 90 });
        doc.text('Status', 470, y + 6, { width: 75, align: 'center' });
        y += 20;

        const daysList = data.dayByDay || [];
        daysList.forEach((day, idx) => {
          const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
          doc.rect(40, y, 515, 20).fillAndStroke(rowBg, borderColor);

          doc.fillColor(darkTextColor).fontSize(8).font('Helvetica-Bold').text(`${day.dayName || ''} (${day.dateStr || ''})`, 48, y + 6, { width: 100 });
          doc.fillColor(darkTextColor).fontSize(8).font('Helvetica').text(day.title || 'Session', 150, y + 6, { width: 160 });
          doc.text(day.durationMin > 0 ? `${day.durationMin} min` : '-', 310, y + 6, { width: 70 });
          doc.text(day.setsCount > 0 ? `${day.setsCount} sets (${day.exerciseCount || 0} ex)` : '-', 380, y + 6, { width: 90 });

          const statusColor = day.status === 'COMPLETED' ? '#10B981' : day.status === 'MISSED' ? '#EF4444' : '#64748B';
          doc.fillColor(statusColor).fontSize(8).font('Helvetica-Bold').text(day.status || 'REST', 470, y + 6, { width: 75, align: 'center' });

          y += 20;
        });

        y += 15;

        // 4. NUTRITION & PROGRESS SUMMARY
        doc.fillColor(darkTextColor).fontSize(12).font('Helvetica-Bold').text('3. Nutrition & Weight Progress', 40, y);
        y += 18;

        const nutText = data.nutritionSummary
          ? `Avg Calories: ${data.nutritionSummary.avgCalories || 0} kcal | Protein: ${data.nutritionSummary.avgProteinG || 0}g | Carbs: ${data.nutritionSummary.avgCarbsG || 0}g | Fat: ${data.nutritionSummary.avgFatG || 0}g | Fiber: ${data.nutritionSummary.avgFiberG || 0}g`
          : 'No detailed nutrition logs recorded for this period.';

        const startW = data.progressSummary?.startWeightKg ?? 70;
        const currW = data.progressSummary?.currentWeightKg ?? 70;
        const changeW = data.progressSummary?.weightChangeKg ?? 0;
        const weightText = `Weight: ${startW} kg -> ${currW} kg (${changeW >= 0 ? '+' : ''}${changeW} kg change)`;

        doc.rect(40, y, 515, 36).fillAndStroke(accentBgColor, borderColor);
        doc.fillColor(darkTextColor).fontSize(8).font('Helvetica').text(nutText, 50, y + 8);
        doc.fillColor(darkTextColor).fontSize(8).font('Helvetica-Bold').text(weightText, 50, y + 22);

        y += 50;

        // 5. AI PERFORMANCE ANALYSIS
        doc.fillColor(darkTextColor).fontSize(12).font('Helvetica-Bold').text('4. AI Performance Analysis', 40, y);
        y += 18;

        doc.fillColor('#059669').fontSize(9).font('Helvetica-Bold').text('WHAT WENT WELL:', 40, y);
        y += 14;
        const wellList = data.aiAnalysis?.whatWentWell || [];
        wellList.forEach((item) => {
          doc.fillColor(darkTextColor).fontSize(8.5).font('Helvetica').text(`• ${item}`, 50, y, { width: 500 });
          y += 14;
        });

        y += 4;
        doc.fillColor('#DC2626').fontSize(9).font('Helvetica-Bold').text('NEEDS IMPROVEMENT:', 40, y);
        y += 14;
        const improveList = data.aiAnalysis?.needsImprovement || [];
        improveList.forEach((item) => {
          doc.fillColor(darkTextColor).fontSize(8.5).font('Helvetica').text(`• ${item}`, 50, y, { width: 500 });
          y += 14;
        });

        y += 10;

        // 6. AI COACH'S WEEKLY INSIGHT
        doc.fillColor(darkTextColor).fontSize(12).font('Helvetica-Bold').text('5. AI Coach Weekly Insight', 40, y);
        y += 18;
        doc.rect(40, y, 515, 42).fillAndStroke('#F3E8FF', '#D8B4FE');
        doc.fillColor('#581C87').fontSize(8.5).font('Helvetica-Oblique').text(`"${data.aiInsight || ''}"`, 50, y + 8, { width: 495 });

        // Add New Page for Next 6 Days Plan & Goals
        doc.addPage();
        let page2Y = 40;

        doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('FITMIND AI - NEXT 6 DAYS ADAPTIVE PLAN', 40, page2Y);
        doc.moveTo(40, page2Y + 20).lineTo(555, page2Y + 20).strokeColor(borderColor).lineWidth(1).stroke();
        page2Y += 32;

        // 7. NEXT 6 DAYS PLAN
        doc.fillColor(darkTextColor).fontSize(12).font('Helvetica-Bold').text('6. Next 6 Days Personalized Schedule', 40, page2Y);
        page2Y += 18;

        const nextPlan = data.nextWeekPlan || [];
        nextPlan.forEach((planDay) => {
          doc.rect(40, page2Y, 515, 34).fillAndStroke(accentBgColor, borderColor);
          doc.fillColor(primaryColor).fontSize(9).font('Helvetica-Bold').text((planDay.dayName || '').toUpperCase(), 50, page2Y + 6);
          doc.fillColor(darkTextColor).fontSize(9).font('Helvetica-Bold').text(planDay.workoutTitle || '', 130, page2Y + 6);
          doc.fillColor(lightGrayColor).fontSize(8).font('Helvetica').text(`${planDay.durationMin || 45} min | Focus: ${planDay.focus || 'General'}`, 130, page2Y + 18);
          doc.fillColor(darkTextColor).fontSize(8).font('Helvetica').text(`Exercises: ${(planDay.exercises || []).join(', ')}`, 320, page2Y + 6, { width: 220 });

          page2Y += 40;
        });

        page2Y += 10;

        // 8. NEXT 6 DAYS GOALS
        doc.fillColor(darkTextColor).fontSize(12).font('Helvetica-Bold').text('7. Next 6 Days Action Goals', 40, page2Y);
        page2Y += 18;

        const nextGoals = data.nextWeekGoals || [];
        nextGoals.forEach((goal) => {
          doc.fillColor(darkTextColor).fontSize(8.5).font('Helvetica').text(`[  ] ${goal}`, 50, page2Y);
          page2Y += 16;
        });

        // Page Numbers Footer
        const totalPages = doc.bufferedPageRange().count;
        for (let i = 0; i < totalPages; i++) {
          doc.switchToPage(i);
          doc.fillColor(lightGrayColor).fontSize(8).font('Helvetica').text(`Page ${i + 1} of ${totalPages} • FitMind AI Confidential`, 40, 800, { align: 'center' });
        }

        doc.end();

        writeStream.on('finish', () => {
          resolve(filePath);
        });

        writeStream.on('error', (err) => {
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
}
