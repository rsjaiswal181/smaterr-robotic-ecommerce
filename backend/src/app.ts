import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from './config/env';
import { logger } from './config/logger';
import routes from './routes';
import { notFoundHandler, errorHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimiter.middleware';

const app: Application = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(
  morgan('combined', {
    stream: { write: (message: string) => logger.info(message.trim()) },
  })
);

// Static file serving for locally-stored uploads (used when Cloudinary is not configured)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'API is healthy', timestamp: new Date().toISOString() });
});

app.use('/api', apiLimiter, routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
