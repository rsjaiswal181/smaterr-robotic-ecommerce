"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getCategoryBySlug = exports.getCategories = exports.createCategory = void 0;
const slugify_1 = __importDefault(require("slugify"));
const Category_model_1 = __importDefault(require("../models/Category.model"));
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.createCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, parent, image, banner, description, seoTitle, seoDescription } = req.body;
    const slug = (0, slugify_1.default)(name, { lower: true, strict: true });
    const exists = await Category_model_1.default.findOne({ slug });
    if (exists)
        throw ApiError_1.ApiError.conflict('A category with this name already exists.');
    const category = await Category_model_1.default.create({
        name,
        slug,
        parent: parent || null,
        image,
        banner,
        description,
        seoTitle,
        seoDescription,
    });
    return ApiResponse_1.ApiResponse.success(res, category, 'Category created', 201);
});
exports.getCategories = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { tree } = req.query;
    const categories = await Category_model_1.default.find({ isActive: true }).sort({ name: 1 });
    if (tree === 'true') {
        const byId = {};
        categories.forEach((c) => (byId[c.id] = { ...c.toObject(), children: [] }));
        const roots = [];
        categories.forEach((c) => {
            if (c.parent) {
                byId[c.parent.toString()]?.children.push(byId[c.id]);
            }
            else {
                roots.push(byId[c.id]);
            }
        });
        return ApiResponse_1.ApiResponse.success(res, roots);
    }
    return ApiResponse_1.ApiResponse.success(res, categories);
});
exports.getCategoryBySlug = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const category = await Category_model_1.default.findOne({ slug: req.params.slug, isActive: true });
    if (!category)
        throw ApiError_1.ApiError.notFound('Category not found');
    return ApiResponse_1.ApiResponse.success(res, category);
});
exports.updateCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const updates = { ...req.body };
    if (updates.name)
        updates.slug = (0, slugify_1.default)(updates.name, { lower: true, strict: true });
    const category = await Category_model_1.default.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!category)
        throw ApiError_1.ApiError.notFound('Category not found');
    return ApiResponse_1.ApiResponse.success(res, category, 'Category updated');
});
exports.deleteCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const category = await Category_model_1.default.findByIdAndDelete(req.params.id);
    if (!category)
        throw ApiError_1.ApiError.notFound('Category not found');
    return ApiResponse_1.ApiResponse.success(res, null, 'Category deleted');
});
