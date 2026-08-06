"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSearchSuggestions = exports.bulkDeleteProducts = exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getProductBySlug = exports.getProducts = exports.createProduct = void 0;
const slugify_1 = __importDefault(require("slugify"));
const Product_model_1 = __importDefault(require("../models/Product.model"));
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.createProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = req.body;
    const slug = (0, slugify_1.default)(body.name, { lower: true, strict: true });
    const exists = await Product_model_1.default.findOne({ $or: [{ slug }, { sku: body.sku }] });
    if (exists)
        throw ApiError_1.ApiError.conflict('A product with this name or SKU already exists.');
    const product = await Product_model_1.default.create({ ...body, slug });
    return ApiResponse_1.ApiResponse.success(res, product, 'Product created', 201);
});
exports.getProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { page = '1', limit = '12', search, category, brand, minPrice, maxPrice, sort = 'newest', featured, trending, bestSeller, newArrival, } = req.query;
    const filter = { status: 'active' };
    if (search)
        filter.$text = { $search: search };
    if (category)
        filter.category = category;
    if (brand)
        filter.brand = brand;
    if (featured === 'true')
        filter.isFeatured = true;
    if (trending === 'true')
        filter.isTrending = true;
    if (bestSeller === 'true')
        filter.isBestSeller = true;
    if (newArrival === 'true')
        filter.isNewArrival = true;
    if (minPrice || maxPrice) {
        filter.price = {
            ...(minPrice ? { $gte: Number(minPrice) } : {}),
            ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
        };
    }
    const sortMap = {
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
        Product_model_1.default.find(filter)
            .populate('category', 'name slug')
            .populate('brand', 'name slug')
            .sort(sortMap[sort] || sortMap.newest)
            .skip(skip)
            .limit(limitNum),
        Product_model_1.default.countDocuments(filter),
    ]);
    return ApiResponse_1.ApiResponse.paginated(res, products, pageNum, limitNum, total);
});
exports.getProductBySlug = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const product = await Product_model_1.default.findOne({ slug: req.params.slug, status: 'active' })
        .populate('category', 'name slug')
        .populate('brand', 'name slug');
    if (!product)
        throw ApiError_1.ApiError.notFound('Product not found');
    const related = await Product_model_1.default.find({
        category: product.category,
        _id: { $ne: product.id },
        status: 'active',
    }).limit(8);
    return ApiResponse_1.ApiResponse.success(res, { product, related });
});
exports.getProductById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const product = await Product_model_1.default.findById(req.params.id).populate('category').populate('brand');
    if (!product)
        throw ApiError_1.ApiError.notFound('Product not found');
    return ApiResponse_1.ApiResponse.success(res, product);
});
exports.updateProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const updates = { ...req.body };
    if (updates.name)
        updates.slug = (0, slugify_1.default)(updates.name, { lower: true, strict: true });
    const product = await Product_model_1.default.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!product)
        throw ApiError_1.ApiError.notFound('Product not found');
    return ApiResponse_1.ApiResponse.success(res, product, 'Product updated');
});
exports.deleteProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const product = await Product_model_1.default.findByIdAndDelete(req.params.id);
    if (!product)
        throw ApiError_1.ApiError.notFound('Product not found');
    return ApiResponse_1.ApiResponse.success(res, null, 'Product deleted');
});
exports.bulkDeleteProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
        throw ApiError_1.ApiError.badRequest('No product ids provided.');
    const result = await Product_model_1.default.deleteMany({ _id: { $in: ids } });
    return ApiResponse_1.ApiResponse.success(res, { deletedCount: result.deletedCount }, 'Products deleted');
});
exports.getSearchSuggestions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const q = req.query.q || '';
    if (!q.trim())
        return ApiResponse_1.ApiResponse.success(res, []);
    const suggestions = await Product_model_1.default.find({ name: { $regex: q, $options: 'i' }, status: 'active' })
        .select('name slug images price salePrice')
        .limit(8);
    return ApiResponse_1.ApiResponse.success(res, suggestions);
});
