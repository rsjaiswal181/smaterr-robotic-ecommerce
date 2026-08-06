"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUploadedFile = exports.processUploadedFile = void 0;
const fs_1 = __importDefault(require("fs"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const env_1 = require("../config/env");
/**
 * Takes a locally-saved multer file and returns a public URL.
 * If Cloudinary credentials are configured, the file is pushed there and removed locally.
 * Otherwise, it is served directly from /uploads via the static file route.
 */
const processUploadedFile = async (file, baseUrl) => {
    if (env_1.env.useCloudinary) {
        const result = await cloudinary_1.default.uploader.upload(file.path, {
            folder: 'ecommerce',
            resource_type: 'auto',
        });
        fs_1.default.unlink(file.path, () => undefined);
        return { url: result.secure_url, publicId: result.public_id };
    }
    return { url: `${baseUrl}/uploads/${file.filename}` };
};
exports.processUploadedFile = processUploadedFile;
const deleteUploadedFile = async (publicId, localFilename) => {
    if (env_1.env.useCloudinary && publicId) {
        await cloudinary_1.default.uploader.destroy(publicId);
    }
    else if (localFilename) {
        const filePath = `${__dirname}/../../uploads/${localFilename}`;
        fs_1.default.unlink(filePath, () => undefined);
    }
};
exports.deleteUploadedFile = deleteUploadedFile;
