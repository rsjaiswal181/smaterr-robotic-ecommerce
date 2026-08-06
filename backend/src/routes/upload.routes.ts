import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();
router.use(protect, restrictTo('admin'));

router.post('/single', upload.single('file'), uploadController.uploadSingle);
router.post('/multiple', upload.array('files', 10), uploadController.uploadMultiple);

export default router;
