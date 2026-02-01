import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';
import { AppError } from '@core/utils/response';
import { log } from '../utils/log';

class ValidationMiddleware {
    public validateRequest = (schema: ZodType<any>) => {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                schema.parse(req.body);
                next();
            } 
            catch (error) {
                if (error instanceof ZodError) {
                    log.error("in validate middleware", error.issues[0].message);
                    
                    if( error.issues[0].code === 'invalid_type' || 
                        error.issues[0].code === 'unrecognized_keys'
                    ){
                        throw new AppError(400, "BAD_REQUEST", "Invalid payload data");
                    }
                    throw new AppError(400, "BAD_REQUEST", error.issues[0].message);
                }
                next(error);
            }
        };
    };


    public validateQuery = (schema: ZodType<any>) => {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                const validated = schema.parse(req.query);
                req.localsQuery = validated;              
                next();
            }
            catch (error) {
                if (error instanceof ZodError) {
                    throw new AppError(400, "BAD_REQUEST", error.issues[0].message);
                }
                next(error);
            }
        }
    }
}

export const validationMiddleware = new ValidationMiddleware();




// will remove old way after refactoring
export const validateRequest = (schema: ZodType<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } 
        catch (error) {
            if (error instanceof ZodError) {
                log.info('in validation middleware', error.issues[0].message)
                if( error.issues[0].code === 'invalid_type' || 
                    error.issues[0].code === 'unrecognized_keys'
                ){
                    throw new AppError(400, "BAD_REQUEST", "Invalid payload data");
                }
                throw new AppError(400, "BAD_REQUEST", error.issues[0].message);
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
                throw new AppError(400, "BAD_REQUEST", error.issues[0].message);
            }
            next(error);
        }
    }
}
