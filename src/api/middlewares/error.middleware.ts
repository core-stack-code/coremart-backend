import { Request, Response, NextFunction } from 'express';
import { CustomError, errorResponse } from '../utils/response';
import { devLooger } from '../utils/devLogger';
import { logger } from '../utils/logger';

export const globalErrorHandler  = (err: any, req: Request, res: Response, next: NextFunction) => {
    let status = 500;
    let message = 'Internal Server Error';

    if (err instanceof CustomError) {
        status = err.statusCode;
        message = err.message;
    }
    else if (err.name === 'MongoServerError' && err.code === 11000) {
        status = 400;
        message = 'Duplicate field value entered.';
    }
    else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        status = 401;
        message = 'Invalid or expired token.';
    }

    logger.error(`${req.method} ${req.originalUrl} - ${status} - ${message}`);

    devLooger.error('Global Error Handler:', {
        message: err.message,
        code: status,
        stack: err.stack,
    });

    errorResponse(res, { status, message });
};