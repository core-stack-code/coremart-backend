import { Request, Response, NextFunction } from 'express';
import { HttpStatusType } from '@/core/constants/httpStatusCode';
import { clearAuthCookies } from '@core/utils/cookies.helper';
import { AppError, errorResponse } from '@api/utils/response';

import { Log } from '../../core/utils/log';
import { logger } from '../../core/utils/logger';
import { env } from '@core/config/env';


export const globalErrorHandler  = (err: any, req: Request, res: Response, _next: NextFunction) => {
    let status: number = 500;
    let message: string = 'Internal Server Error';
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
    else if (err.code === "P2002" || (err.name === 'MongoServerError' && err.code === 11000)) {
        status = 409;
        code = "CONFLICT"
        message = 'Data already exists.';
    }
    else if (err.code === "P2003") {
        status = 400;
        code = "BAD_REQUEST"
        message = 'Foreign key constraint failed.';
    }
    else if (err.code === "P2025") {
        status = 404;
        code = "RESOURCE_NOT_FOUND"
        message = 'Resource not found.';
    }
    else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        status = 401;
        code = "UNAUTHORIZED"
        message = 'Invalid or expired token.';
    }

    logger.error(`${req.method} ${req.originalUrl} - ${status} - ${message}`);

    Log.error('Global Error Handler:', {
        message: err.message,
        code: code,
        status: status,
        // stack: err.stack,
    });

    Log.error('Error data:', err.code);

    if (status === 401 && env.NODE_ENV === 'production') {
        clearAuthCookies(res);
    }

    errorResponse(res, status, { code, message });
};