"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const Order_model_1 = __importDefault(require("../models/Order.model"));
const Product_model_1 = __importDefault(require("../models/Product.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const Inquiry_model_1 = __importDefault(require("../models/Inquiry.model"));
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.getDashboardStats = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const [totalOrders, totalCustomers, totalProducts, totalInquiries, openInquiries, revenueAgg, lowStock, recentOrders, topProducts] = await Promise.all([
        Order_model_1.default.countDocuments(),
        User_model_1.default.countDocuments({ role: 'customer' }),
        Product_model_1.default.countDocuments(),
        Inquiry_model_1.default.countDocuments(),
        Inquiry_model_1.default.countDocuments({ status: { $in: ['new', 'contacted', 'quoted'] } }),
        Order_model_1.default.aggregate([
            { $match: { status: { $nin: ['cancelled', 'returned'] } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]),
        Product_model_1.default.find({ stock: { $lte: 5 } }).select('name stock sku').limit(10),
        Order_model_1.default.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
        Product_model_1.default.find().sort({ soldCount: -1 }).limit(5).select('name soldCount images'),
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailySales = await Order_model_1.default.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $nin: ['cancelled', 'returned'] } } },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                revenue: { $sum: '$totalPrice' },
                orders: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);
    const orderStatusBreakdown = await Order_model_1.default.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    return ApiResponse_1.ApiResponse.success(res, {
        totalOrders,
        totalCustomers,
        totalProducts,
        totalInquiries,
        openInquiries,
        totalRevenue,
        lowStock,
        recentOrders,
        topProducts,
        dailySales,
        orderStatusBreakdown,
    });
});
