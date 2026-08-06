import { body } from 'express-validator';

export const placeOrderValidator = [
  body('shippingAddress.fullName').notEmpty().withMessage('Full name is required'),
  body('shippingAddress.phone').notEmpty().withMessage('Phone is required'),
  body('shippingAddress.addressLine1').notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.postalCode').notEmpty().withMessage('Postal code is required'),
  body('shippingAddress.country').notEmpty().withMessage('Country is required'),
  body('paymentMethod').isIn(['cod']).withMessage('Only Cash on Delivery is supported currently'),
];

export const updateOrderStatusValidator = [
  body('status')
    .isIn(['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'])
    .withMessage('Invalid order status'),
];
