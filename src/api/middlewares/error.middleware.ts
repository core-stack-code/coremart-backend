import { Request, Response, NextFunction } from 'express';
import { AppError, errorResponse } from '../../core/utils/response';
import { log } from '../utils/log';
import { logger } from '../utils/logger';
import { HttpStatusType } from '@/core/constants/httpStatusCode';

export const globalErrorHandler  = (err: any, req: Request, res: Response, next: NextFunction) => {
    let status = 500;
    let message = 'Internal Server Error';
    let code: HttpStatusType = 'INTERNAL_SERVER_ERROR';

    if (err instanceof AppError) {
        status = err.statusCode;
        code = err.code;
        message = err.message;
    }
    else if (err.name === 'ValidationError') {
        status = 400;
        code = "BAD_REQUEST"
        message = 'Invalid input data';
    }
    else if (err.name === 'MongoServerError' && err.code === 11000) {
        status = 409;
        code = "CONFLICT"
        message = 'Duplicate field value entered.';
    }
    else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        status = 401;
        code = "UNAUTHORIZED"
        message = 'Invalid or expired token.';
    }

    logger.error(`${req.method} ${req.originalUrl} - ${status} - ${message}`);

    log.error('Global Error Handler:', {
        message: err.message,
        code: code,
        status: status,
        // stack: err.stack,
    });

    errorResponse(res, status, { code, message });
};