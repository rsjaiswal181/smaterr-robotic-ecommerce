import { Request, Response } from 'express';
import Order from '../models/Order.model';
import Product from '../models/Product.model';
import User from '../models/User.model';
import Inquiry from '../models/Inquiry.model';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';

export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalOrders, totalCustomers, totalProducts, totalInquiries, openInquiries, revenueAgg, lowStock, recentOrders, topProducts] =
    await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments(),
      Inquiry.countDocuments(),
      Inquiry.countDocuments({ status: { $in: ['new', 'contacted', 'quoted'] } }),
      Order.aggregate([
        { $match: { status: { $nin: ['cancelled', 'returned'] } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Product.find({ stock: { $lte: 5 } }).select('name stock sku').limit(10),
      Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(5),
      Product.find().sort({ soldCount: -1 }).limit(5).select('name soldCount images'),
    ]);

  const totalRevenue = revenueAgg[0]?.total || 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailySales = await Order.aggregate([
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

  const orderStatusBreakdown = await Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);

  return ApiResponse.success(res, {
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
