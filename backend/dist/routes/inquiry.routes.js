"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const inquiryController = __importStar(require("../controllers/inquiry.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const router = (0, express_1.Router)();
const inquiryValidator = [
    (0, express_validator_1.body)('requestType').optional().isIn(['product', 'project', 'consulting']),
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Name is required'),
    (0, express_validator_1.body)('phone').trim().notEmpty().withMessage('Phone is required'),
    (0, express_validator_1.body)('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('subject').trim().notEmpty().withMessage('Subject is required'),
    (0, express_validator_1.body)('details').trim().notEmpty().withMessage('Details are required'),
];
router.post('/', inquiryValidator, validate_middleware_1.validate, inquiryController.createInquiry);
router.get('/', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('admin'), inquiryController.getInquiries);
router.put('/:id', auth_middleware_1.protect, (0, auth_middleware_1.restrictTo)('admin'), inquiryController.updateInquiry);
exports.default = router;
