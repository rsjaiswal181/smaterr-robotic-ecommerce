import { Router } from 'express';
import { body } from 'express-validator';
import * as inquiryController from '../controllers/inquiry.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const inquiryValidator = [
  body('requestType').optional().isIn(['product', 'project', 'consulting']),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('details').trim().notEmpty().withMessage('Details are required'),
];

router.post('/', inquiryValidator, validate, inquiryController.createInquiry);
router.get('/', protect, restrictTo('admin'), inquiryController.getInquiries);
router.put('/:id', protect, restrictTo('admin'), inquiryController.updateInquiry);

export default router;
