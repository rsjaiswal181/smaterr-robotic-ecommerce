import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthPayload } from '../middleware/auth.middleware';

export const generateAccessToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: env.jwtAccessExpires } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.jwtRefreshExpires } as jwt.SignOptions);
};

export const verifyRefreshToken = (token: string): AuthPayload => {
  return jwt.verify(token, env.jwtRefreshSecret) as AuthPayload;
};
