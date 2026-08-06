import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User.model';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { asyncHandler } from '../utils/asyncHandler';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../services/token.service';
import { sendEmail, emailTemplates } from '../services/email.service';

const REFRESH_COOKIE = 'refreshToken';

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('An account with this email already exists.');

  const user = await User.create({ name, email, password, phone });

  const payload = { id: user.id, role: user.role as 'customer' | 'admin' };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  user.refreshTokens.push(refreshToken);
  await user.save();

  setRefreshCookie(res, refreshToken);
  sendEmail({ to: user.email, subject: 'Welcome!', html: emailTemplates.welcome(user.name) }).catch(() => undefined);

  return ApiResponse.success(
    res,
    { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken },
    'Registered successfully',
    201
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +refreshTokens');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid email or password.');
  }
  if (!user.isActive) throw ApiError.forbidden('This account has been deactivated.');

  const payload = { id: user.id, role: user.role as 'customer' | 'admin' };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
  await user.save();

  setRefreshCookie(res, refreshToken);

  return ApiResponse.success(
    res,
    { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken },
    'Logged in successfully'
  );
});

export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, role: 'admin' }).select('+password +refreshTokens');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Invalid admin credentials.');
  }

  const payload = { id: user.id, role: user.role as 'customer' | 'admin' };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  user.refreshTokens = [...(user.refreshTokens || []).slice(-4), refreshToken];
  await user.save();

  setRefreshCookie(res, refreshToken);
  return ApiResponse.success(
    res,
    { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken },
    'Admin logged in successfully'
  );
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw ApiError.unauthorized('No refresh token provided.');

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token.');
  }

  const user = await User.findById(decoded.id).select('+refreshTokens');
  if (!user || !user.refreshTokens.includes(token)) {
    throw ApiError.unauthorized('Refresh token not recognized. Please login again.');
  }

  const payload = { id: user.id, role: user.role as 'customer' | 'admin' };
  const accessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  user.refreshTokens = [...user.refreshTokens.filter((t) => t !== token), newRefreshToken];
  await user.save();

  setRefreshCookie(res, newRefreshToken);
  return ApiResponse.success(res, { accessToken }, 'Token refreshed');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    await User.updateOne({ refreshTokens: token }, { $pull: { refreshTokens: token } });
  }
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  return ApiResponse.success(res, null, 'Logged out successfully');
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  // Always respond success to avoid leaking which emails are registered
  if (!user) return ApiResponse.success(res, null, 'If that email exists, a reset link has been sent.');

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.otp = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.otpExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
  await sendEmail({ to: user.email, subject: 'Reset your password', html: emailTemplates.forgotPassword(resetLink) });

  return ApiResponse.success(res, null, 'If that email exists, a reset link has been sent.');
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  const hashed = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({ otp: hashed, otpExpires: { $gt: new Date() } }).select('+otp +otpExpires');
  if (!user) throw ApiError.badRequest('Reset link is invalid or has expired.');

  user.password = password;
  user.otp = undefined;
  user.otpExpires = undefined;
  user.refreshTokens = [];
  await user.save();

  return ApiResponse.success(res, null, 'Password reset successfully. Please login.');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound('User not found');
  return ApiResponse.success(res, user);
});
