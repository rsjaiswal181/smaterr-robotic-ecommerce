import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import User from '../models/User.model';

export interface AuthPayload {
  id: string;
  role: 'customer' | 'admin';
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export const protect = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    const token = header && header.startsWith('Bearer ') ? header.split(' ')[1] : null;
    if (!token) throw ApiError.unauthorized('Not authenticated. Please login.');

    const decoded = jwt.verify(token, env.jwtAccessSecret) as AuthPayload;
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) throw ApiError.unauthorized('User no longer exists or is inactive.');

    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(ApiError.unauthorized('Invalid or expired token.'));
  }
};

export const restrictTo = (...roles: Array<'customer' | 'admin'>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action.'));
    }
    next();
  };
};

// Attaches req.user if a valid token is present, but does not fail if absent.
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    const token = header && header.startsWith('Bearer ') ? header.split(' ')[1] : null;
    if (!token) return next();
    const decoded = jwt.verify(token, env.jwtAccessSecret) as AuthPayload;
    req.user = decoded;
  } catch {
    // ignore invalid token for optional auth
  }
  next();
};
