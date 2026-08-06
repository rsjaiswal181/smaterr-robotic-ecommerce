import { Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { processUploadedFile } from '../services/upload.service';

export const uploadSingle = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest('No file uploaded.');
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const result = await processUploadedFile(req.file, baseUrl);
  return ApiResponse.success(res, result, 'File uploaded', 201);
});

export const uploadMultiple = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) throw ApiError.badRequest('No files uploaded.');
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const results = await Promise.all(files.map((f) => processUploadedFile(f, baseUrl)));
  return ApiResponse.success(res, results, 'Files uploaded', 201);
});
