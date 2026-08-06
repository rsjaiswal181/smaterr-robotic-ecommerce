import { Request, Response } from 'express';
import Inquiry from '../models/Inquiry.model';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError } from '../utils/ApiError';

export const createInquiry = asyncHandler(async (req: Request, res: Response) => {
  const inquiry = await Inquiry.create(req.body);
  return ApiResponse.success(res, inquiry, 'Request submitted. Our team will contact you shortly.', 201);
});

export const getInquiries = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 25);
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;

  const filter: Record<string, unknown> = {};
  if (status) filter.status = status;
  if (search) filter.$text = { $search: search };

  const [items, total] = await Promise.all([
    Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Inquiry.countDocuments(filter),
  ]);

  return ApiResponse.paginated(res, items, page, limit, total);
});

export const updateInquiry = asyncHandler(async (req: Request, res: Response) => {
  const allowed = ['status', 'adminNote'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));

  const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!inquiry) throw ApiError.notFound('Request not found');

  return ApiResponse.success(res, inquiry, 'Request updated');
});
