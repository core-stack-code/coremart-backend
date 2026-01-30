import { Response } from 'express';
import { HttpStatusType } from '../constants/httpStatusCode';

interface IApiResponse<T> {
    success?: boolean;
    code: HttpStatusType;
    message: string;
    data?: T | null;
}

interface IApiError {
    success?: boolean;
    code: HttpStatusType;
    message: string;
}

export const AppResponse = <T>(
    res: Response ,
    statusCode: number,
    {
        success = true,
        code,
        message = 'Success',
        data = null
    }: IApiResponse<T>
) => {
    return res.status(statusCode).json({
        success,
        code,
        message,
        data,
    });
}

export const errorResponse = (
    res: Response,
    statusCode: number,
    { 
        success = false,
        code = "INTERNAL_SERVER_ERROR", 
        message = "Internal Server error"
    } : IApiError
) => {
    return res.status(statusCode).json({
        success,
        code,
        message
    })
}

export class AppError extends Error {
    public statusCode: number;
    public code: HttpStatusType;
  
    constructor(statusCode = 400, code: HttpStatusType, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        
        Object.setPrototypeOf(this, AppError.prototype);
    }
}