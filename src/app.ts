import express, { Application, Request, Response } from 'express';
import cors from 'cors';

import authRoutes from './api/module/auth/auth.routes';
import { globalErrorHandler } from './api/middlewares/error.middleware';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// api routes
app.use('/api/auth', authRoutes)

// test route
app.get('/api/test', (req: Request, res: Response) => {
  res.send('I am just a guy who is hero for fun!');
});

// Global error handler
app.use(globalErrorHandler);

export default app;
