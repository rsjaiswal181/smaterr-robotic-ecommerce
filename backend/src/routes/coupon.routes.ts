import { Router } from 'express';
import * as couponController from '../controllers/coupon.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();
router.use(protect, restrictTo('admin'));

router.get('/', couponController.getCoupons);
router.post('/', couponController.createCoupon);
router.put('/:id', couponController.updateCoupon);
router.delete('/:id', couponController.deleteCoupon);

export default router;
