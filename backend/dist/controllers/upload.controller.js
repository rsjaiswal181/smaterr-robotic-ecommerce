"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMultiple = exports.uploadSingle = void 0;
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const upload_service_1 = require("../services/upload.service");
exports.uploadSingle = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file)
        throw ApiError_1.ApiError.badRequest('No file uploaded.');
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const result = await (0, upload_service_1.processUploadedFile)(req.file, baseUrl);
    return ApiResponse_1.ApiResponse.success(res, result, 'File uploaded', 201);
});
exports.uploadMultiple = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const files = req.files;
    if (!files || files.length === 0)
        throw ApiError_1.ApiError.badRequest('No files uploaded.');
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const results = await Promise.all(files.map((f) => (0, upload_service_1.processUploadedFile)(f, baseUrl)));
    return ApiResponse_1.ApiResponse.success(res, results, 'Files uploaded', 201);
});
