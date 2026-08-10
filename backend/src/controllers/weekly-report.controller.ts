import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { WeeklyReportService } from '../services/weekly-report.service';
import fs from 'fs';
import path from 'path';

export class WeeklyReportController {
  // GET /api/reports/weekly
  static async getUserReports(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const reports = await WeeklyReportService.getUserReports(req.user!.userId);
      return res.status(200).json({ success: true, data: reports });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/reports/weekly/:id
  static async getReportById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const report = await WeeklyReportService.getReportById(req.user!.userId, req.params.id);
      return res.status(200).json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/reports/weekly/generate
  static async generateReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const report = await WeeklyReportService.generateWeeklyReport(req.user!.userId, true);
      return res.status(201).json({
        success: true,
        data: report,
        message: 'Weekly fitness report generated successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/reports/weekly/:id/pdf
  static async downloadPdf(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const pdfPath = await WeeklyReportService.ensurePdfGenerated(req.user!.userId, req.params.id);
      const report = await WeeklyReportService.getReportById(req.user!.userId, req.params.id);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=FitMind_Weekly_Report_${report.periodLabel.replace(/\s+/g, '_')}.pdf`);

      const fileStream = fs.createReadStream(pdfPath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error generating/downloading PDF report:', error);
      next(error);
    }
  }
}
