import { Request, Response } from 'express';
import User from '../models/User.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone } = req.body;
  const user = await User.findByIdAndUpdate(req.user!.id, { name, phone }, { new: true, runValidators: true });
  return ApiResponse.success(res, user, 'Profile updated');
});

export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found');

  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  user.addresses.push(req.body);
  await user.save();
  return ApiResponse.success(res, user.addresses, 'Address added', 201);
});

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found');

  const address = user.addresses.id(req.params.addressId);
  if (!address) throw ApiError.notFound('Address not found');

  if (req.body.isDefault) user.addresses.forEach((a) => (a.isDefault = false));
  Object.assign(address, req.body);
  await user.save();
  return ApiResponse.success(res, user.addresses, 'Address updated');
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found');
  user.addresses = user.addresses.filter((a) => a._id?.toString() !== req.params.addressId) as any;
  await user.save();
  return ApiResponse.success(res, user.addresses, 'Address removed');
});

export const toggleWishlist = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.body;
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found');

  const idx = user.wishlist.findIndex((id) => id.toString() === productId);
  if (idx > -1) {
    user.wishlist.splice(idx, 1);
  } else {
    user.wishlist.push(productId);
  }
  await user.save();
  return ApiResponse.success(res, user.wishlist, idx > -1 ? 'Removed from wishlist' : 'Added to wishlist');
});

export const getWishlist = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id).populate('wishlist');
  return ApiResponse.success(res, user?.wishlist || []);
});

// ----- Admin -----

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page = '1', limit = '20', search } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = { role: 'customer' };
  if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    User.countDocuments(filter),
  ]);
  return ApiResponse.paginated(res, users, pageNum, limitNum, total);
});

export const toggleUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  user.isActive = !user.isActive;
  await user.save();
  return ApiResponse.success(res, user, `User ${user.isActive ? 'activated' : 'deactivated'}`);
});
