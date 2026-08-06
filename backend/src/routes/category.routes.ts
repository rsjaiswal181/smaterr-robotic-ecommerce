import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategoryBySlug);
router.post('/', protect, restrictTo('admin'), categoryController.createCategory);
router.put('/:id', protect, restrictTo('admin'), categoryController.updateCategory);
router.delete('/:id', protect, restrictTo('admin'), categoryController.deleteCategory);

export default router;
