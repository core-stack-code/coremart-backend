import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';
import { errorResponse } from '../utils/response';
import { devLooger } from '../utils/devLogger';

export const validateRequest = (schema: ZodType<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } 
        catch (error) {
            if (error instanceof ZodError) {
                devLooger.info('in validation middleware', error.issues[0].message)
                if( error.issues[0].code === 'invalid_type' || 
                    error.issues[0].code === 'unrecognized_keys'
                ){
                    errorResponse(res, { status: 400, message: 'Invalid payload data' });
                    return;
                }
                errorResponse(res, { status: 400, message: error.issues[0].message });
            }
            next(error);
        }
    };
};

export const validateQuery = (schema: ZodType<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = schema.parse(req.query);
            res.locals.query = validated;              
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                errorResponse(res, { status: 400, message: error.issues[0].message });
            }
            next(error);
        }
    }
}
