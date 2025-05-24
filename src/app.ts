import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './api/module/auth/auth.routes';
import { globalErrorHandler } from './api/middlewares/error.middleware';
import { authMiddleware } from './api/middlewares/auth.middleware';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// api routes
app.use('/api/auth', authRoutes)

// test route
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'I am just a guy who is hero for fun!'});
});

app.get('/api/protected_test', authMiddleware, (req: Request, res: Response) => {
  res.send({ message: 'This is a protected route, you are authenticated!' });
})

// Global error handler
app.use(globalErrorHandler);

export default app;
