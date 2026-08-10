import { Router } from 'express';
import { ProgressController } from '../controllers/progress.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.get('/', ProgressController.getProgress);
router.post('/measurements', ProgressController.logMeasurement);

export default router;
