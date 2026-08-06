import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { placeOrderValidator, updateOrderStatusValidator } from '../validators/order.validator';

const router = Router();
router.use(protect);

router.post('/', placeOrderValidator, validate, orderController.placeOrder);
router.get('/my-orders', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/cancel', orderController.cancelOrder);

// Admin
router.get('/', restrictTo('admin'), orderController.getAllOrders);
router.put('/:id/status', restrictTo('admin'), updateOrderStatusValidator, validate, orderController.updateOrderStatus);

export default router;
