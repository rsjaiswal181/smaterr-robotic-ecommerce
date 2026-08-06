import { Request, Response } from 'express';
import slugify from 'slugify';
import Brand from '../models/Brand.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const createBrand = asyncHandler(async (req: Request, res: Response) => {
  const { name, logo, description } = req.body;
  const slug = slugify(name, { lower: true, strict: true });

  const exists = await Brand.findOne({ slug });
  if (exists) throw ApiError.conflict('A brand with this name already exists.');

  const brand = await Brand.create({ name, slug, logo, description });
  return ApiResponse.success(res, brand, 'Brand created', 201);
});

export const getBrands = asyncHandler(async (_req: Request, res: Response) => {
  const brands = await Brand.find({ isActive: true }).sort({ name: 1 });
  return ApiResponse.success(res, brands);
});

export const updateBrand = asyncHandler(async (req: Request, res: Response) => {
  const updates = { ...req.body };
  if (updates.name) updates.slug = slugify(updates.name, { lower: true, strict: true });

  const brand = await Brand.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!brand) throw ApiError.notFound('Brand not found');
  return ApiResponse.success(res, brand, 'Brand updated');
});

export const deleteBrand = asyncHandler(async (req: Request, res: Response) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);
  if (!brand) throw ApiError.notFound('Brand not found');
  return ApiResponse.success(res, null, 'Brand deleted');
});
