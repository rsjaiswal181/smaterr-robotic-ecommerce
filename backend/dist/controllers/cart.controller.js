"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyCoupon = exports.clearCart = exports.removeFromCart = exports.updateCartItem = exports.addToCart = exports.getCart = void 0;
const Cart_model_1 = __importDefault(require("../models/Cart.model"));
const Product_model_1 = __importDefault(require("../models/Product.model"));
const Coupon_model_1 = __importDefault(require("../models/Coupon.model"));
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const getOrCreateCart = async (userId) => {
    let cart = await Cart_model_1.default.findOne({ user: userId });
    if (!cart)
        cart = await Cart_model_1.default.create({ user: userId, items: [] });
    return cart;
};
exports.getCart = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const cart = await getOrCreateCart(req.user.id);
    await cart.populate('items.product', 'name slug images price salePrice stock');
    return ApiResponse_1.ApiResponse.success(res, cart);
});
exports.addToCart = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { productId, quantity = 1 } = req.body;
    const product = await Product_model_1.default.findById(productId);
    if (!product || product.status !== 'active')
        throw ApiError_1.ApiError.notFound('Product not available.');
    if (product.stock < quantity)
        throw ApiError_1.ApiError.badRequest('Not enough stock available.');
    const cart = await getOrCreateCart(req.user.id);
    const price = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
    const existingItem = cart.items.find((i) => i.product.toString() === productId);
    if (existingItem) {
        existingItem.quantity += Number(quantity);
        existingItem.price = price;
    }
    else {
        cart.items.push({ product: product._id, quantity: Number(quantity), price });
    }
    await cart.save();
    await cart.populate('items.product', 'name slug images price salePrice stock');
    return ApiResponse_1.ApiResponse.success(res, cart, 'Item added to cart');
});
exports.updateCartItem = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    const cart = await getOrCreateCart(req.user.id);
    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item)
        throw ApiError_1.ApiError.notFound('Item not found in cart.');
    if (quantity <= 0) {
        cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    }
    else {
        item.quantity = quantity;
    }
    await cart.save();
    await cart.populate('items.product', 'name slug images price salePrice stock');
    return ApiResponse_1.ApiResponse.success(res, cart, 'Cart updated');
});
exports.removeFromCart = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { productId } = req.params;
    const cart = await getOrCreateCart(req.user.id);
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
    await cart.save();
    await cart.populate('items.product', 'name slug images price salePrice stock');
    return ApiResponse_1.ApiResponse.success(res, cart, 'Item removed from cart');
});
exports.clearCart = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = [];
    cart.coupon = null;
    await cart.save();
    return ApiResponse_1.ApiResponse.success(res, cart, 'Cart cleared');
});
exports.applyCoupon = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { code } = req.body;
    const coupon = await Coupon_model_1.default.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon)
        throw ApiError_1.ApiError.notFound('Invalid coupon code.');
    if (coupon.expiresAt < new Date())
        throw ApiError_1.ApiError.badRequest('This coupon has expired.');
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        throw ApiError_1.ApiError.badRequest('This coupon has reached its usage limit.');
    }
    const cart = await getOrCreateCart(req.user.id);
    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    if (subtotal < coupon.minPurchase) {
        throw ApiError_1.ApiError.badRequest(`Minimum purchase of ₹${coupon.minPurchase} required for this coupon.`);
    }
    cart.coupon = { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue };
    await cart.save();
    await cart.populate('items.product', 'name slug images price salePrice stock');
    return ApiResponse_1.ApiResponse.success(res, cart, 'Coupon applied');
});
