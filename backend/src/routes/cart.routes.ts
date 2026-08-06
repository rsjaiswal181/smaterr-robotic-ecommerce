import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.get('/', cartController.getCart);
router.post('/items', cartController.addToCart);
router.put('/items/:productId', cartController.updateCartItem);
router.delete('/items/:productId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);
router.post('/coupon', cartController.applyCoupon);

export default router;
