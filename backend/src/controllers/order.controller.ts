import { Request, Response } from 'express';
import Order, { OrderStatus, IOrderItem } from '../models/Order.model';
import Cart from '../models/Cart.model';
import Product from '../models/Product.model';
import Coupon from '../models/Coupon.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { sendEmail, emailTemplates } from '../services/email.service';
import User from '../models/User.model';

const generateOrderNumber = () => `ORD-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`;

const SHIPPING_FLAT_RATE = 49;
const FREE_SHIPPING_THRESHOLD = 999;
const TAX_RATE = 0.05; // 5%

export const placeOrder = asyncHandler(async (req: Request, res: Response) => {
  const { shippingAddress, paymentMethod = 'cod' } = req.body;

  const cart = await Cart.findOne({ user: req.user!.id }).populate('items.product');
  if (!cart || cart.items.length === 0) throw ApiError.badRequest('Your cart is empty.');

  // Validate stock and lock in current prices
  const orderItems: IOrderItem[] = [];
  for (const item of cart.items) {
    const product = item.product as any;
    if (!product || product.status !== 'active') throw ApiError.badRequest(`${product?.name || 'A product'} is no longer available.`);
    if (product.stock < item.quantity) throw ApiError.badRequest(`Not enough stock for ${product.name}.`);
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0] || '',
      price: item.price,
      quantity: item.quantity,
    });
  }

  const itemsPrice = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  let discount = 0;
  let couponCode: string | undefined;

  if (cart.coupon) {
    discount =
      cart.coupon.discountType === 'percentage'
        ? (itemsPrice * cart.coupon.discountValue) / 100
        : cart.coupon.discountValue;
    couponCode = cart.coupon.code;
  }

  const shippingPrice = itemsPrice - discount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const taxPrice = Math.round((itemsPrice - discount) * TAX_RATE * 100) / 100;
  const totalPrice = Math.max(0, itemsPrice - discount) + shippingPrice + taxPrice;

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user!.id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
    itemsPrice,
    taxPrice,
    shippingPrice,
    discount,
    couponCode,
    totalPrice,
    status: 'pending',
    statusHistory: [{ status: 'pending', date: new Date() }],
  });

  // Decrement stock & bump soldCount
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, soldCount: item.quantity },
    });
  }

  if (couponCode) {
    await Coupon.updateOne({ code: couponCode }, { $inc: { usedCount: 1 } });
  }

  // Clear cart
  cart.items = [];
  cart.coupon = null;
  await cart.save();

  const user = await User.findById(req.user!.id);
  if (user) {
    sendEmail({
      to: user.email,
      subject: `Order Confirmed - ${order.orderNumber}`,
      html: emailTemplates.orderConfirmation(order.orderNumber, order.totalPrice),
    }).catch(() => undefined);
  }

  return ApiResponse.success(res, order, 'Order placed successfully', 201);
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ user: req.user!.id }).sort({ createdAt: -1 });
  return ApiResponse.success(res, orders);
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw ApiError.notFound('Order not found');

  if (req.user!.role !== 'admin' && order.user._id.toString() !== req.user!.id) {
    throw ApiError.forbidden('You do not have access to this order.');
  }
  return ApiResponse.success(res, order);
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.user.toString() !== req.user!.id) throw ApiError.forbidden('You cannot cancel this order.');
  if (!['pending', 'confirmed'].includes(order.status)) {
    throw ApiError.badRequest('This order can no longer be cancelled.');
  }

  order.status = 'cancelled';
  order.cancelledAt = new Date();
  order.statusHistory.push({ status: 'cancelled', date: new Date() });
  await order.save();

  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, soldCount: -item.quantity } });
  }

  return ApiResponse.success(res, order, 'Order cancelled');
});

// ----- Admin -----

export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Order.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, orders, pageNum, limitNum, total);
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, note } = req.body as { status: OrderStatus; note?: string };
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) throw ApiError.notFound('Order not found');

  order.status = status;
  order.statusHistory.push({ status, date: new Date(), note });
  if (status === 'delivered') {
    order.deliveredAt = new Date();
    order.paymentStatus = order.paymentMethod === 'cod' ? 'paid' : order.paymentStatus;
  }
  await order.save();

  const user = order.user as any;
  sendEmail({
    to: user.email,
    subject: `Order Update - ${order.orderNumber}`,
    html: emailTemplates.orderStatus(order.orderNumber, status),
  }).catch(() => undefined);

  return ApiResponse.success(res, order, 'Order status updated');
});
