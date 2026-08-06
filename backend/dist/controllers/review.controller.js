"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.getProductReviews = exports.createReview = void 0;
const Review_model_1 = __importDefault(require("../models/Review.model"));
const Product_model_1 = __importDefault(require("../models/Product.model"));
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const recalcRating = async (productId) => {
    const stats = await Review_model_1.default.aggregate([
        { $match: { product: new (require('mongoose').Types.ObjectId)(productId), isApproved: true } },
        { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const { avg = 0, count = 0 } = stats[0] || {};
    await Product_model_1.default.findByIdAndUpdate(productId, { ratingsAverage: Math.round(avg * 10) / 10, ratingsCount: count });
};
exports.createReview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;
    const product = await Product_model_1.default.findById(productId);
    if (!product)
        throw ApiError_1.ApiError.notFound('Product not found');
    const existing = await Review_model_1.default.findOne({ product: productId, user: req.user.id });
    if (existing)
        throw ApiError_1.ApiError.conflict('You have already reviewed this product.');
    const review = await Review_model_1.default.create({ product: productId, user: req.user.id, rating, title, comment });
    await recalcRating(productId);
    return ApiResponse_1.ApiResponse.success(res, review, 'Review submitted', 201);
});
exports.getProductReviews = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const reviews = await Review_model_1.default.find({ product: req.params.productId, isApproved: true })
        .populate('user', 'name')
        .sort({ createdAt: -1 });
    return ApiResponse_1.ApiResponse.success(res, reviews);
});
exports.deleteReview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const review = await Review_model_1.default.findByIdAndDelete(req.params.id);
    if (!review)
        throw ApiError_1.ApiError.notFound('Review not found');
    await recalcRating(review.product.toString());
    return ApiResponse_1.ApiResponse.success(res, null, 'Review deleted');
});
