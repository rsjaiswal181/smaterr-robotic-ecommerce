"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCoupon = exports.updateCoupon = exports.getCoupons = exports.createCoupon = void 0;
const Coupon_model_1 = __importDefault(require("../models/Coupon.model"));
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.createCoupon = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { code } = req.body;
    const exists = await Coupon_model_1.default.findOne({ code: code.toUpperCase() });
    if (exists)
        throw ApiError_1.ApiError.conflict('A coupon with this code already exists.');
    const coupon = await Coupon_model_1.default.create({ ...req.body, code: code.toUpperCase() });
    return ApiResponse_1.ApiResponse.success(res, coupon, 'Coupon created', 201);
});
exports.getCoupons = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const coupons = await Coupon_model_1.default.find().sort({ createdAt: -1 });
    return ApiResponse_1.ApiResponse.success(res, coupons);
});
exports.updateCoupon = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const updates = { ...req.body };
    if (updates.code)
        updates.code = updates.code.toUpperCase();
    const coupon = await Coupon_model_1.default.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!coupon)
        throw ApiError_1.ApiError.notFound('Coupon not found');
    return ApiResponse_1.ApiResponse.success(res, coupon, 'Coupon updated');
});
exports.deleteCoupon = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const coupon = await Coupon_model_1.default.findByIdAndDelete(req.params.id);
    if (!coupon)
        throw ApiError_1.ApiError.notFound('Coupon not found');
    return ApiResponse_1.ApiResponse.success(res, null, 'Coupon deleted');
});
