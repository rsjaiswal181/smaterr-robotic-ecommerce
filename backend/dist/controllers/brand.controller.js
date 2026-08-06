"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBrand = exports.updateBrand = exports.getBrands = exports.createBrand = void 0;
const slugify_1 = __importDefault(require("slugify"));
const Brand_model_1 = __importDefault(require("../models/Brand.model"));
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.createBrand = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, logo, description } = req.body;
    const slug = (0, slugify_1.default)(name, { lower: true, strict: true });
    const exists = await Brand_model_1.default.findOne({ slug });
    if (exists)
        throw ApiError_1.ApiError.conflict('A brand with this name already exists.');
    const brand = await Brand_model_1.default.create({ name, slug, logo, description });
    return ApiResponse_1.ApiResponse.success(res, brand, 'Brand created', 201);
});
exports.getBrands = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const brands = await Brand_model_1.default.find({ isActive: true }).sort({ name: 1 });
    return ApiResponse_1.ApiResponse.success(res, brands);
});
exports.updateBrand = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const updates = { ...req.body };
    if (updates.name)
        updates.slug = (0, slugify_1.default)(updates.name, { lower: true, strict: true });
    const brand = await Brand_model_1.default.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!brand)
        throw ApiError_1.ApiError.notFound('Brand not found');
    return ApiResponse_1.ApiResponse.success(res, brand, 'Brand updated');
});
exports.deleteBrand = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const brand = await Brand_model_1.default.findByIdAndDelete(req.params.id);
    if (!brand)
        throw ApiError_1.ApiError.notFound('Brand not found');
    return ApiResponse_1.ApiResponse.success(res, null, 'Brand deleted');
});
