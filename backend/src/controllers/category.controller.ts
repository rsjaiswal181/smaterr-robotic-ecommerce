import { Request, Response } from 'express';
import slugify from 'slugify';
import Category from '../models/Category.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, parent, image, banner, description, seoTitle, seoDescription } = req.body;
  const slug = slugify(name, { lower: true, strict: true });

  const exists = await Category.findOne({ slug });
  if (exists) throw ApiError.conflict('A category with this name already exists.');

  const category = await Category.create({
    name,
    slug,
    parent: parent || null,
    image,
    banner,
    description,
    seoTitle,
    seoDescription,
  });
  return ApiResponse.success(res, category, 'Category created', 201);
});

export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const { tree } = req.query;
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });

  if (tree === 'true') {
    const byId: Record<string, any> = {};
    categories.forEach((c) => (byId[c.id] = { ...c.toObject(), children: [] }));
    const roots: any[] = [];
    categories.forEach((c) => {
      if (c.parent) {
        byId[c.parent.toString()]?.children.push(byId[c.id]);
      } else {
        roots.push(byId[c.id]);
      }
    });
    return ApiResponse.success(res, roots);
  }

  return ApiResponse.success(res, categories);
});

export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) throw ApiError.notFound('Category not found');
  return ApiResponse.success(res, category);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const updates = { ...req.body };
  if (updates.name) updates.slug = slugify(updates.name, { lower: true, strict: true });

  const category = await Category.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!category) throw ApiError.notFound('Category not found');
  return ApiResponse.success(res, category, 'Category updated');
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  return ApiResponse.success(res, null, 'Category deleted');
});
