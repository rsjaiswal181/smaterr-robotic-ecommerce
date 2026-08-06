"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getAllOrders = exports.cancelOrder = exports.getOrderById = exports.getMyOrders = exports.placeOrder = void 0;
const Order_model_1 = __importDefault(require("../models/Order.model"));
const Cart_model_1 = __importDefault(require("../models/Cart.model"));
const Product_model_1 = __importDefault(require("../models/Product.model"));
const Coupon_model_1 = __importDefault(require("../models/Coupon.model"));
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const email_service_1 = require("../services/email.service");
const User_model_1 = __importDefault(require("../models/User.model"));
const generateOrderNumber = () => `ORD-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`;
const SHIPPING_FLAT_RATE = 49;
const FREE_SHIPPING_THRESHOLD = 999;
const TAX_RATE = 0.05; // 5%
exports.placeOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { shippingAddress, paymentMethod = 'cod' } = req.body;
    const cart = await Cart_model_1.default.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0)
        throw ApiError_1.ApiError.badRequest('Your cart is empty.');
    // Validate stock and lock in current prices
    const orderItems = [];
    for (const item of cart.items) {
        const product = item.product;
        if (!product || product.status !== 'active')
            throw ApiError_1.ApiError.badRequest(`${product?.name || 'A product'} is no longer available.`);
        if (product.stock < item.quantity)
            throw ApiError_1.ApiError.badRequest(`Not enough stock for ${product.name}.`);
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
    let couponCode;
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
    const order = await Order_model_1.default.create({
        orderNumber: generateOrderNumber(),
        user: req.user.id,
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
        await Product_model_1.default.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity, soldCount: item.quantity },
        });
    }
    if (couponCode) {
        await Coupon_model_1.default.updateOne({ code: couponCode }, { $inc: { usedCount: 1 } });
    }
    // Clear cart
    cart.items = [];
    cart.coupon = null;
    await cart.save();
    const user = await User_model_1.default.findById(req.user.id);
    if (user) {
        (0, email_service_1.sendEmail)({
            to: user.email,
            subject: `Order Confirmed - ${order.orderNumber}`,
            html: email_service_1.emailTemplates.orderConfirmation(order.orderNumber, order.totalPrice),
        }).catch(() => undefined);
    }
    return ApiResponse_1.ApiResponse.success(res, order, 'Order placed successfully', 201);
});
exports.getMyOrders = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const orders = await Order_model_1.default.find({ user: req.user.id }).sort({ createdAt: -1 });
    return ApiResponse_1.ApiResponse.success(res, orders);
});
exports.getOrderById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const order = await Order_model_1.default.findById(req.params.id).populate('user', 'name email');
    if (!order)
        throw ApiError_1.ApiError.notFound('Order not found');
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
        throw ApiError_1.ApiError.forbidden('You do not have access to this order.');
    }
    return ApiResponse_1.ApiResponse.success(res, order);
});
exports.cancelOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const order = await Order_model_1.default.findById(req.params.id);
    if (!order)
        throw ApiError_1.ApiError.notFound('Order not found');
    if (order.user.toString() !== req.user.id)
        throw ApiError_1.ApiError.forbidden('You cannot cancel this order.');
    if (!['pending', 'confirmed'].includes(order.status)) {
        throw ApiError_1.ApiError.badRequest('This order can no longer be cancelled.');
    }
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.statusHistory.push({ status: 'cancelled', date: new Date() });
    await order.save();
    for (const item of order.items) {
        await Product_model_1.default.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, soldCount: -item.quantity } });
    }
    return ApiResponse_1.ApiResponse.success(res, order, 'Order cancelled');
});
// ----- Admin -----
exports.getAllOrders = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { status, page = '1', limit = '20' } = req.query;
    const filter = {};
    if (status)
        filter.status = status;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const [orders, total] = await Promise.all([
        Order_model_1.default.find(filter)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum),
        Order_model_1.default.countDocuments(filter),
    ]);
    return ApiResponse_1.ApiResponse.paginated(res, orders, pageNum, limitNum, total);
});
exports.updateOrderStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { status, note } = req.body;
    const order = await Order_model_1.default.findById(req.params.id).populate('user', 'name email');
    if (!order)
        throw ApiError_1.ApiError.notFound('Order not found');
    order.status = status;
    order.statusHistory.push({ status, date: new Date(), note });
    if (status === 'delivered') {
        order.deliveredAt = new Date();
        order.paymentStatus = order.paymentMethod === 'cod' ? 'paid' : order.paymentStatus;
    }
    await order.save();
    const user = order.user;
    (0, email_service_1.sendEmail)({
        to: user.email,
        subject: `Order Update - ${order.orderNumber}`,
        html: email_service_1.emailTemplates.orderStatus(order.orderNumber, status),
    }).catch(() => undefined);
    return ApiResponse_1.ApiResponse.success(res, order, 'Order status updated');
});
