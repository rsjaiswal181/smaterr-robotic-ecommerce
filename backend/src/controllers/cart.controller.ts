import { Request, Response } from 'express';
import Cart from '../models/Cart.model';
import Product from '../models/Product.model';
import Coupon from '../models/Coupon.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

const getOrCreateCart = async (userId: string) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await getOrCreateCart(req.user!.id);
  await cart.populate('items.product', 'name slug images price salePrice stock');
  return ApiResponse.success(res, cart);
});

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || product.status !== 'active') throw ApiError.notFound('Product not available.');
  if (product.stock < quantity) throw ApiError.badRequest('Not enough stock available.');

  const cart = await getOrCreateCart(req.user!.id);
  const price = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;

  const existingItem = cart.items.find((i) => i.product.toString() === productId);
  if (existingItem) {
    existingItem.quantity += Number(quantity);
    existingItem.price = price;
  } else {
    cart.items.push({ product: product._id as any, quantity: Number(quantity), price });
  }

  await cart.save();
  await cart.populate('items.product', 'name slug images price salePrice stock');
  return ApiResponse.success(res, cart, 'Item added to cart');
});

export const updateCartItem = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await getOrCreateCart(req.user!.id);
  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) throw ApiError.notFound('Item not found in cart.');

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.product.toString() !== productId) as any;
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate('items.product', 'name slug images price salePrice stock');
  return ApiResponse.success(res, cart, 'Cart updated');
});

export const removeFromCart = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const cart = await getOrCreateCart(req.user!.id);
  cart.items = cart.items.filter((i) => i.product.toString() !== productId) as any;
  await cart.save();
  await cart.populate('items.product', 'name slug images price salePrice stock');
  return ApiResponse.success(res, cart, 'Item removed from cart');
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await getOrCreateCart(req.user!.id);
  cart.items = [];
  cart.coupon = null;
  await cart.save();
  return ApiResponse.success(res, cart, 'Cart cleared');
});

export const applyCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) throw ApiError.notFound('Invalid coupon code.');
  if (coupon.expiresAt < new Date()) throw ApiError.badRequest('This coupon has expired.');
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw ApiError.badRequest('This coupon has reached its usage limit.');
  }

  const cart = await getOrCreateCart(req.user!.id);
  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  if (subtotal < coupon.minPurchase) {
    throw ApiError.badRequest(`Minimum purchase of ₹${coupon.minPurchase} required for this coupon.`);
  }

  cart.coupon = { code: coupon.code, discountType: coupon.discountType, discountValue: coupon.discountValue };
  await cart.save();
  await cart.populate('items.product', 'name slug images price salePrice stock');
  return ApiResponse.success(res, cart, 'Coupon applied');
});
