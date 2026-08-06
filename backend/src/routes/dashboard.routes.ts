import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();
router.use(protect, restrictTo('admin'));

router.get('/stats', dashboardController.getDashboardStats);

export default router;
