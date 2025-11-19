import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import authRoutes from './api/module/auth/auth.routes';
import productRoutes from './api/module/products/products.routes'
import reviewRoutes from './api/module/reviews/reviews.routes'
import favoriteRoutes from './api/module/favorites/favorites.routes';
import saveForLaterRoutes from './api/module/save-for-later/saveForLater.routes';
import cartRoutes from './api/module/cart/cart.routes';
import checoutRoutes from './api/module/checkout/checkout.routes'
import addressRoutes from './api/module/address/address.routes'

import { globalErrorHandler } from './api/middlewares/error.middleware';
import { authMiddleware } from './api/middlewares/auth.middleware';
import { env } from './api/config/env';

const app: Application = express();


// Middleware
app.use(cors({
  origin: env.CLIENT_DOMAIN_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use(morgan('dev'));


// Security Middlewares
app.use(helmet());
app.use(hpp());


// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 150,
  message: {
    status: 429,
    message: 'Too many requests, please try again later.'
  }
});
app.use('/api', apiLimiter);

// api routes
app.use('/api/auth', authRoutes)
app.use('/api/product', productRoutes)
app.use('/api/review', reviewRoutes)
app.use('/api/favorite', favoriteRoutes)
app.use('/api/save-for-later', saveForLaterRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/checkout', checoutRoutes)
app.use('/api/address', addressRoutes)


// test route
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'I am just a guy who is hero for fun!'});
});

app.get('/api/protected_test', authMiddleware, (req: Request, res: Response) => {
  res.send({ message: 'This is a protected route, you are authenticated!' });
})


// 404 handler for undefined routes
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: 404,
    message: 'Request not found.',
  });
});

// Global error handler
app.use(globalErrorHandler);

export default app;