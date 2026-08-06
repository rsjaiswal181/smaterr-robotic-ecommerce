"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateInquiry = exports.getInquiries = exports.createInquiry = void 0;
const Inquiry_model_1 = __importDefault(require("../models/Inquiry.model"));
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
exports.createInquiry = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const inquiry = await Inquiry_model_1.default.create(req.body);
    return ApiResponse_1.ApiResponse.success(res, inquiry, 'Request submitted. Our team will contact you shortly.', 201);
});
exports.getInquiries = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 25);
    const status = req.query.status;
    const search = req.query.search;
    const filter = {};
    if (status)
        filter.status = status;
    if (search)
        filter.$text = { $search: search };
    const [items, total] = await Promise.all([
        Inquiry_model_1.default.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit),
        Inquiry_model_1.default.countDocuments(filter),
    ]);
    return ApiResponse_1.ApiResponse.paginated(res, items, page, limit, total);
});
exports.updateInquiry = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const allowed = ['status', 'adminNote'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    const inquiry = await Inquiry_model_1.default.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!inquiry)
        throw ApiError_1.ApiError.notFound('Request not found');
    return ApiResponse_1.ApiResponse.success(res, inquiry, 'Request updated');
});
