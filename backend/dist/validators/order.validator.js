"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatusValidator = exports.placeOrderValidator = void 0;
const express_validator_1 = require("express-validator");
exports.placeOrderValidator = [
    (0, express_validator_1.body)('shippingAddress.fullName').notEmpty().withMessage('Full name is required'),
    (0, express_validator_1.body)('shippingAddress.phone').notEmpty().withMessage('Phone is required'),
    (0, express_validator_1.body)('shippingAddress.addressLine1').notEmpty().withMessage('Address is required'),
    (0, express_validator_1.body)('shippingAddress.city').notEmpty().withMessage('City is required'),
    (0, express_validator_1.body)('shippingAddress.state').notEmpty().withMessage('State is required'),
    (0, express_validator_1.body)('shippingAddress.postalCode').notEmpty().withMessage('Postal code is required'),
    (0, express_validator_1.body)('shippingAddress.country').notEmpty().withMessage('Country is required'),
    (0, express_validator_1.body)('paymentMethod').isIn(['cod']).withMessage('Only Cash on Delivery is supported currently'),
];
exports.updateOrderStatusValidator = [
    (0, express_validator_1.body)('status')
        .isIn(['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'])
        .withMessage('Invalid order status'),
];
