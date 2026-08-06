import { Router } from 'express';
import * as brandController from '../controllers/brand.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';

const router = Router();

router.get('/', brandController.getBrands);
router.post('/', protect, restrictTo('admin'), brandController.createBrand);
router.put('/:id', protect, restrictTo('admin'), brandController.updateBrand);
router.delete('/:id', protect, restrictTo('admin'), brandController.deleteBrand);

export default router;
