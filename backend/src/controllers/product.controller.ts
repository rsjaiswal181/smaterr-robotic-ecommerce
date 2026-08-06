import { Request, Response } from 'express';
import slugify from 'slugify';
import Product from '../models/Product.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body;
  const slug = slugify(body.name, { lower: true, strict: true });

  const exists = await Product.findOne({ $or: [{ slug }, { sku: body.sku }] });
  if (exists) throw ApiError.conflict('A product with this name or SKU already exists.');

  const product = await Product.create({ ...body, slug });
  return ApiResponse.success(res, product, 'Product created', 201);
});

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = '1',
    limit = '12',
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    sort = 'newest',
    featured,
    trending,
    bestSeller,
    newArrival,
  } = req.query as Record<string, string>;

  const filter: Record<string, unknown> = { status: 'active' };

  if (search) filter.$text = { $search: search };
  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (featured === 'true') filter.isFeatured = true;
  if (trending === 'true') filter.isTrending = true;
  if (bestSeller === 'true') filter.isBestSeller = true;
  if (newArrival === 'true') filter.isNewArrival = true;
  if (minPrice || maxPrice) {
    filter.price = {
      ...(minPrice ? { $gte: Number(minPrice) } : {}),
      ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
    };
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    popular: { soldCount: -1 },
    priceLowToHigh: { price: 1 },
    priceHighToLow: { price: -1 },
    rating: { ratingsAverage: -1 },
  };

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug')
      .populate('brand', 'name slug')
      .sort(sortMap[sort] || sortMap.newest)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, products, pageNum, limitNum, total);
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({ slug: req.params.slug, status: 'active' })
    .populate('category', 'name slug')
    .populate('brand', 'name slug');
  if (!product) throw ApiError.notFound('Product not found');

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product.id },
    status: 'active',
  }).limit(8);

  return ApiResponse.success(res, { product, related });
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id).populate('category').populate('brand');
  if (!product) throw ApiError.notFound('Product not found');
  return ApiResponse.success(res, product);
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const updates = { ...req.body };
  if (updates.name) updates.slug = slugify(updates.name, { lower: true, strict: true });

  const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!product) throw ApiError.notFound('Product not found');
  return ApiResponse.success(res, product, 'Product updated');
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  return ApiResponse.success(res, null, 'Product deleted');
});

export const bulkDeleteProducts = asyncHandler(async (req: Request, res: Response) => {
  const { ids } = req.body as { ids: string[] };
  if (!Array.isArray(ids) || ids.length === 0) throw ApiError.badRequest('No product ids provided.');
  const result = await Product.deleteMany({ _id: { $in: ids } });
  return ApiResponse.success(res, { deletedCount: result.deletedCount }, 'Products deleted');
});

export const getSearchSuggestions = asyncHandler(async (req: Request, res: Response) => {
  const q = (req.query.q as string) || '';
  if (!q.trim()) return ApiResponse.success(res, []);
  const suggestions = await Product.find({ name: { $regex: q, $options: 'i' }, status: 'active' })
    .select('name slug images price salePrice')
    .limit(8);
  return ApiResponse.success(res, suggestions);
});
