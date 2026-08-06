import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { productValidator } from '../validators/product.validator';

const router = Router();

router.get('/', productController.getProducts);
router.get('/search/suggestions', productController.getSearchSuggestions);
router.get('/slug/:slug', productController.getProductBySlug);
router.get('/:id', protect, restrictTo('admin'), productController.getProductById);

router.post('/', protect, restrictTo('admin'), productValidator, validate, productController.createProduct);
router.put('/:id', protect, restrictTo('admin'), productController.updateProduct);
router.delete('/:id', protect, restrictTo('admin'), productController.deleteProduct);
router.post('/bulk-delete', protect, restrictTo('admin'), productController.bulkDeleteProducts);

export default router;
