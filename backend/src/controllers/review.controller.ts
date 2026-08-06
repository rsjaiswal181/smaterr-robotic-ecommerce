import { Request, Response } from 'express';
import Review from '../models/Review.model';
import Product from '../models/Product.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

const recalcRating = async (productId: string) => {
  const stats = await Review.aggregate([
    { $match: { product: new (require('mongoose').Types.ObjectId)(productId), isApproved: true } },
    { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Product.findByIdAndUpdate(productId, { ratingsAverage: Math.round(avg * 10) / 10, ratingsCount: count });
};

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { rating, title, comment } = req.body;

  const product = await Product.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');

  const existing = await Review.findOne({ product: productId, user: req.user!.id });
  if (existing) throw ApiError.conflict('You have already reviewed this product.');

  const review = await Review.create({ product: productId, user: req.user!.id, rating, title, comment });
  await recalcRating(productId);

  return ApiResponse.success(res, review, 'Review submitted', 201);
});

export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await Review.find({ product: req.params.productId, isApproved: true })
    .populate('user', 'name')
    .sort({ createdAt: -1 });
  return ApiResponse.success(res, reviews);
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');
  await recalcRating(review.product.toString());
  return ApiResponse.success(res, null, 'Review deleted');
});
