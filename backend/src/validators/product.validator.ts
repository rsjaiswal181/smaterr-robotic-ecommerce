import { body } from 'express-validator';

export const productValidator = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('sku').trim().notEmpty().withMessage('SKU is required'),
  body('category').isMongoId().withMessage('Valid category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('description').trim().notEmpty().withMessage('Description is required'),
];
