import { Router } from 'express';
import { WeeklyReportController } from '../controllers/weekly-report.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/', WeeklyReportController.getUserReports);
router.post('/generate', WeeklyReportController.generateReport);
router.get('/:id/pdf', WeeklyReportController.downloadPdf);
router.get('/:id', WeeklyReportController.getReportById);

export default router;
