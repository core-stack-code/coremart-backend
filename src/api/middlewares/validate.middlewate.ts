import { Request, Response, NextFunction } from 'express';
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

export const validateQuery = (schema: ZodSchema<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = schema.parse(req.query);
        res.locals.query = validated;              
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                errorResponse(res, { status: 400, message: error.errors[0].message });
            }
            next(error);
        }
    }
}
