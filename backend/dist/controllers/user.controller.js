"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleUserStatus = exports.getAllUsers = exports.getWishlist = exports.toggleWishlist = exports.deleteAddress = exports.updateAddress = exports.addAddress = exports.updateProfile = void 0;
const User_model_1 = __importDefault(require("../models/User.model"));
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.updateProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, phone } = req.body;
    const user = await User_model_1.default.findByIdAndUpdate(req.user.id, { name, phone }, { new: true, runValidators: true });
    return ApiResponse_1.ApiResponse.success(res, user, 'Profile updated');
});
exports.addAddress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_model_1.default.findById(req.user.id);
    if (!user)
        throw ApiError_1.ApiError.notFound('User not found');
    if (req.body.isDefault)
        user.addresses.forEach((a) => (a.isDefault = false));
    user.addresses.push(req.body);
    await user.save();
    return ApiResponse_1.ApiResponse.success(res, user.addresses, 'Address added', 201);
});
exports.updateAddress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_model_1.default.findById(req.user.id);
    if (!user)
        throw ApiError_1.ApiError.notFound('User not found');
    const address = user.addresses.id(req.params.addressId);
    if (!address)
        throw ApiError_1.ApiError.notFound('Address not found');
    if (req.body.isDefault)
        user.addresses.forEach((a) => (a.isDefault = false));
    Object.assign(address, req.body);
    await user.save();
    return ApiResponse_1.ApiResponse.success(res, user.addresses, 'Address updated');
});
exports.deleteAddress = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_model_1.default.findById(req.user.id);
    if (!user)
        throw ApiError_1.ApiError.notFound('User not found');
    user.addresses = user.addresses.filter((a) => a._id?.toString() !== req.params.addressId);
    await user.save();
    return ApiResponse_1.ApiResponse.success(res, user.addresses, 'Address removed');
});
exports.toggleWishlist = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { productId } = req.body;
    const user = await User_model_1.default.findById(req.user.id);
    if (!user)
        throw ApiError_1.ApiError.notFound('User not found');
    const idx = user.wishlist.findIndex((id) => id.toString() === productId);
    if (idx > -1) {
        user.wishlist.splice(idx, 1);
    }
    else {
        user.wishlist.push(productId);
    }
    await user.save();
    return ApiResponse_1.ApiResponse.success(res, user.wishlist, idx > -1 ? 'Removed from wishlist' : 'Added to wishlist');
});
exports.getWishlist = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_model_1.default.findById(req.user.id).populate('wishlist');
    return ApiResponse_1.ApiResponse.success(res, user?.wishlist || []);
});
// ----- Admin -----
exports.getAllUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { page = '1', limit = '20', search } = req.query;
    const filter = { role: 'customer' };
    if (search)
        filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const [users, total] = await Promise.all([
        User_model_1.default.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
        User_model_1.default.countDocuments(filter),
    ]);
    return ApiResponse_1.ApiResponse.paginated(res, users, pageNum, limitNum, total);
});
exports.toggleUserStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_model_1.default.findById(req.params.id);
    if (!user)
        throw ApiError_1.ApiError.notFound('User not found');
    user.isActive = !user.isActive;
    await user.save();
    return ApiResponse_1.ApiResponse.success(res, user, `User ${user.isActive ? 'activated' : 'deactivated'}`);
});
