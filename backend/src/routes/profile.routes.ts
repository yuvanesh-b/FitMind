import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateToken);
router.get('/', ProfileController.getProfile);
router.put('/', ProfileController.updateProfile);

export default router;
