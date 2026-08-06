import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();
router.use(protect);

router.put('/profile', userController.updateProfile);
router.post('/addresses', userController.addAddress);
router.put('/addresses/:addressId', userController.updateAddress);
router.delete('/addresses/:addressId', userController.deleteAddress);
router.get('/wishlist', userController.getWishlist);
router.post('/wishlist', userController.toggleWishlist);

// Admin
router.get('/', restrictTo('admin'), userController.getAllUsers);
router.put('/:id/toggle-status', restrictTo('admin'), userController.toggleUserStatus);

export default router;
