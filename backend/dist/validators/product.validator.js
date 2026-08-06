"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productValidator = void 0;
const express_validator_1 = require("express-validator");
exports.productValidator = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Product name is required'),
    (0, express_validator_1.body)('sku').trim().notEmpty().withMessage('SKU is required'),
    (0, express_validator_1.body)('category').isMongoId().withMessage('Valid category is required'),
    (0, express_validator_1.body)('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    (0, express_validator_1.body)('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    (0, express_validator_1.body)('description').trim().notEmpty().withMessage('Description is required'),
];
