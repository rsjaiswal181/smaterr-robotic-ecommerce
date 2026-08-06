"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.restrictTo = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const ApiError_1 = require("../utils/ApiError");
const User_model_1 = __importDefault(require("../models/User.model"));
const protect = async (req, _res, next) => {
    try {
        const header = req.headers.authorization;
        const token = header && header.startsWith('Bearer ') ? header.split(' ')[1] : null;
        if (!token)
            throw ApiError_1.ApiError.unauthorized('Not authenticated. Please login.');
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtAccessSecret);
        const user = await User_model_1.default.findById(decoded.id);
        if (!user || !user.isActive)
            throw ApiError_1.ApiError.unauthorized('User no longer exists or is inactive.');
        req.user = { id: decoded.id, role: decoded.role };
        next();
    }
    catch (err) {
        if (err instanceof ApiError_1.ApiError)
            return next(err);
        next(ApiError_1.ApiError.unauthorized('Invalid or expired token.'));
    }
};
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, _res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(ApiError_1.ApiError.forbidden('You do not have permission to perform this action.'));
        }
        next();
    };
};
exports.restrictTo = restrictTo;
// Attaches req.user if a valid token is present, but does not fail if absent.
const optionalAuth = async (req, _res, next) => {
    try {
        const header = req.headers.authorization;
        const token = header && header.startsWith('Bearer ') ? header.split(' ')[1] : null;
        if (!token)
            return next();
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.jwtAccessSecret);
        req.user = decoded;
    }
    catch {
        // ignore invalid token for optional auth
    }
    next();
};
exports.optionalAuth = optionalAuth;
