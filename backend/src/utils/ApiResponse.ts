import { Response } from 'express';

export class ApiResponse {
  static success(res: Response, data: unknown = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  static paginated(
    res: Response,
    data: unknown[],
    page: number,
    limit: number,
    total: number,
    message = 'Success'
  ) {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
}
