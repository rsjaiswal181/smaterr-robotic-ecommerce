import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import brandRoutes from './brand.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import couponRoutes from './coupon.routes';
import reviewRoutes from './review.routes';
import userRoutes from './user.routes';
import uploadRoutes from './upload.routes';
import dashboardRoutes from './dashboard.routes';
import inquiryRoutes from './inquiry.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/coupons', couponRoutes);
router.use('/reviews', reviewRoutes);
router.use('/users', userRoutes);
router.use('/upload', uploadRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/admin/dashboard', dashboardRoutes);

export default router;
