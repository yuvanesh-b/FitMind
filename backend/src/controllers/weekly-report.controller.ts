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

      if (!fs.existsSync(pdfPath)) {
        throw new Error('PDF file not found at generated path');
      }

      const pdfBuffer = fs.readFileSync(pdfPath);
      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('PDF buffer is empty or corrupted');
      }

      const dateStr = report.periodStart
        ? new Date(report.periodStart).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      const rawFilename = `weekly-fitness-report-${dateStr}.pdf`;
      const safeFilename = rawFilename
        .normalize('NFKD')
        .replace(/[^\x20-\x7E]/g, '')
        .replace(/["\\\r\n/]/g, '-')
        .replace(/\s+/g, '-');

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);

      return res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating/downloading PDF report:', error);
      next(error);
    }
  }
}
