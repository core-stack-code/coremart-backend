import e, { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { errorResponse } from '../utils/response';

export const validateRequest = (schema: ZodSchema<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } 
        catch (error) {
            if (error instanceof ZodError) {
                if( error.errors[0].code === 'invalid_type' || 
                    error.errors[0].code === 'unrecognized_keys'
                ){
                    errorResponse(res, { status: 400, message: 'Invalid payload data' });
                    return;
                }
                errorResponse(res, { status: 400, message: error.errors[0].message });
            }
            next(error);
        }
    };
};
