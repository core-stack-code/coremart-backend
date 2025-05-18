import { Response } from 'express';

interface IApiResponse<T> {
    status: number;
    message: string;
    data?: T | null;
}

interface IApiError {
    status: number;
    message: string;
}

export const successResponse = <T>(
    res: Response ,
    {status = 200, message = 'Success', data = null,}: IApiResponse<T>
) => {
    return res.status(status).json({
        status,
        message,
        data,
    });
}

export const errorResponse = (
    res: Response,
    { status = 500, message = "Internal Server error" } : IApiError
) => {
    return res.status(status).json({
        status,
        message
    })
}

export class CustomError extends Error {
    public statusCode: number;
  
    constructor(message: string, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        
        Object.setPrototypeOf(this, CustomError.prototype);
    }
}