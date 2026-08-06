"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary_1 = require("cloudinary");
const env_1 = require("./env");
if (env_1.env.useCloudinary) {
    cloudinary_1.v2.config({
        cloud_name: env_1.env.cloudinary.cloudName,
        api_key: env_1.env.cloudinary.apiKey,
        api_secret: env_1.env.cloudinary.apiSecret,
    });
}
exports.default = cloudinary_1.v2;
