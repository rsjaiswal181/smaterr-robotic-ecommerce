import { Request, Response } from 'express';
import Coupon from '../models/Coupon.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body;
  const exists = await Coupon.findOne({ code: code.toUpperCase() });
  if (exists) throw ApiError.conflict('A coupon with this code already exists.');

  const coupon = await Coupon.create({ ...req.body, code: code.toUpperCase() });
  return ApiResponse.success(res, coupon, 'Coupon created', 201);
});

export const getCoupons = asyncHandler(async (_req: Request, res: Response) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  return ApiResponse.success(res, coupons);
});

export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const updates = { ...req.body };
  if (updates.code) updates.code = updates.code.toUpperCase();
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!coupon) throw ApiError.notFound('Coupon not found');
  return ApiResponse.success(res, coupon, 'Coupon updated');
});

export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw ApiError.notFound('Coupon not found');
  return ApiResponse.success(res, null, 'Coupon deleted');
});
