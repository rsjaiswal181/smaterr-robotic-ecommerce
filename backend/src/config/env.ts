import dotenv from 'dotenv';
dotenv.config();

const required = (name: string, fallback?: string): string => {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    // eslint-disable-next-line no-console
    console.warn(`[env] Missing environment variable: ${name}`);
    return '';
  }
  return value;
};

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  mongoUri: required('MONGO_URI', 'mongodb://127.0.0.1:27017/ecommerce'),

  jwtAccessSecret: required('JWT_ACCESS_SECRET', 'dev_access_secret'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET', 'dev_refresh_secret'),
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
  jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  get useCloudinary() {
    return !!(this.cloudinary.cloudName && this.cloudinary.apiKey && this.cloudinary.apiSecret);
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@example.com',
  },
  get useSmtp() {
    return !!(this.smtp.host && this.smtp.user && this.smtp.pass);
  },

  adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@123',
};
