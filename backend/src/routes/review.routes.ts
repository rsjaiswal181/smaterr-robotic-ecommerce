import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.get('/product/:productId', reviewController.getProductReviews);
router.post('/product/:productId', protect, reviewController.createReview);
router.delete('/:id', protect, restrictTo('admin'), reviewController.deleteReview);

export default router;
