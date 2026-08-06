"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.resetPassword = exports.forgotPassword = exports.logout = exports.refresh = exports.adminLogin = exports.login = exports.register = void 0;
const crypto_1 = __importDefault(require("crypto"));
const User_model_1 = __importDefault(require("../models/User.model"));
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const token_service_1 = require("../services/token.service");
const email_service_1 = require("../services/email.service");
const REFRESH_COOKIE = 'refreshToken';
const setRefreshCookie = (res, token) => {
    res.cookie(REFRESH_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/auth',
    });
};
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, email, password, phone } = req.body;
    const existing = await User_model_1.default.findOne({ email });
    if (existing)
        throw ApiError_1.ApiError.conflict('An account with this email already exists.');
    const user = await User_model_1.default.create({ name, email, password, phone });
    const payload = { id: user.id, role: user.role };
    const accessToken = (0, token_service_1.generateAccessToken)(payload);
    const refreshToken = (0, token_service_1.generateRefreshToken)(payload);
    user.refreshTokens.push(refreshToken);
    await user.save();
    setRefreshCookie(res, refreshToken);
    (0, email_service_1.sendEmail)({ to: user.email, subject: 'Welcome!', html: email_service_1.emailTemplates.welcome(user.name) }).catch(() => undefined);
    return ApiResponse_1.ApiResponse.success(res, { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken }, 'Registered successfully', 201);
});
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const user = await User_model_1.default.findOne({ email }).select('+password +refreshTokens');
    if (!user || !(await user.comparePassword(password))) {
        throw ApiError_1.ApiError.unauthorized('Invalid email or password.');
    }
    if (!user.isActive)
        throw ApiError_1.ApiError.forbidden('This account has been deactivated.');
    const payload = { id: user.id, role: user.role };
    const accessToken = (0, token_service_1.generateAccessToken)(payload);
    const refreshToken = (0, token_service_1.generateRefreshToken)(payload);
    user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
    await user.save();
    setRefreshCookie(res, refreshToken);
    return ApiResponse_1.ApiResponse.success(res, { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken }, 'Logged in successfully');
});
exports.adminLogin = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const user = await User_model_1.default.findOne({ email, role: 'admin' }).select('+password +refreshTokens');
    if (!user || !(await user.comparePassword(password))) {
        throw ApiError_1.ApiError.unauthorized('Invalid admin credentials.');
    }
    const payload = { id: user.id, role: user.role };
    const accessToken = (0, token_service_1.generateAccessToken)(payload);
    const refreshToken = (0, token_service_1.generateRefreshToken)(payload);
    user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
    await user.save();
    setRefreshCookie(res, refreshToken);
    return ApiResponse_1.ApiResponse.success(res, { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken }, 'Admin logged in successfully');
});
exports.refresh = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token)
        throw ApiError_1.ApiError.unauthorized('No refresh token provided.');
    let decoded;
    try {
        decoded = (0, token_service_1.verifyRefreshToken)(token);
    }
    catch {
        throw ApiError_1.ApiError.unauthorized('Invalid or expired refresh token.');
    }
    const user = await User_model_1.default.findById(decoded.id).select('+refreshTokens');
    if (!user || !user.refreshTokens.includes(token)) {
        throw ApiError_1.ApiError.unauthorized('Refresh token not recognized. Please login again.');
    }
    const payload = { id: user.id, role: user.role };
    const accessToken = (0, token_service_1.generateAccessToken)(payload);
    const newRefreshToken = (0, token_service_1.generateRefreshToken)(payload);
    user.refreshTokens = [...user.refreshTokens.filter((t) => t !== token), newRefreshToken];
    await user.save();
    setRefreshCookie(res, newRefreshToken);
    return ApiResponse_1.ApiResponse.success(res, { accessToken }, 'Token refreshed');
});
exports.logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
        await User_model_1.default.updateOne({ refreshTokens: token }, { $pull: { refreshTokens: token } });
    }
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    return ApiResponse_1.ApiResponse.success(res, null, 'Logged out successfully');
});
exports.forgotPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    const user = await User_model_1.default.findOne({ email });
    // Always respond success to avoid leaking which emails are registered
    if (!user)
        return ApiResponse_1.ApiResponse.success(res, null, 'If that email exists, a reset link has been sent.');
    const resetToken = crypto_1.default.randomBytes(32).toString('hex');
    user.otp = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
    user.otpExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    await (0, email_service_1.sendEmail)({ to: user.email, subject: 'Reset your password', html: email_service_1.emailTemplates.forgotPassword(resetLink) });
    return ApiResponse_1.ApiResponse.success(res, null, 'If that email exists, a reset link has been sent.');
});
exports.resetPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { token, password } = req.body;
    const hashed = crypto_1.default.createHash('sha256').update(token).digest('hex');
    const user = await User_model_1.default.findOne({ otp: hashed, otpExpires: { $gt: new Date() } }).select('+otp +otpExpires');
    if (!user)
        throw ApiError_1.ApiError.badRequest('Reset link is invalid or has expired.');
    user.password = password;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.refreshTokens = [];
    await user.save();
    return ApiResponse_1.ApiResponse.success(res, null, 'Password reset successfully. Please login.');
});
exports.getMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_model_1.default.findById(req.user.id);
    if (!user)
        throw ApiError_1.ApiError.notFound('User not found');
    return ApiResponse_1.ApiResponse.success(res, user);
});
