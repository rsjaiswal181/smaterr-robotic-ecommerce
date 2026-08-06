"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFoundHandler = void 0;
const ApiError_1 = require("../utils/ApiError");
const logger_1 = require("../config/logger");
const env_1 = require("../config/env");
const notFoundHandler = (req, _res, next) => {
    next(ApiError_1.ApiError.notFound(`Route not found: ${req.originalUrl}`));
};
exports.notFoundHandler = notFoundHandler;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const errorHandler = (err, req, res, _next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';
    let errors = err.errors;
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid value for ${err.path}`;
    }
    // Mongoose duplicate key
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0];
        message = `${field ? field.charAt(0).toUpperCase() + field.slice(1) : 'Field'} already exists`;
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        errors = Object.values(err.errors).map((e) => e.message);
        message = 'Validation failed';
    }
    if (statusCode >= 500) {
        logger_1.logger.error(`${req.method} ${req.originalUrl} - ${err.stack || err.message}`);
    }
    else {
        logger_1.logger.warn(`${req.method} ${req.originalUrl} - ${message}`);
    }
    res.status(statusCode).json({
        success: false,
        message,
        errors: errors || undefined,
        stack: env_1.env.nodeEnv === 'development' ? err.stack : undefined,
    });
};
exports.errorHandler = errorHandler;
