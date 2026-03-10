import { Request, Response, NextFunction } from 'express';
import { checkRateLimit } from '@core/lib/redis/rateLimit';
import { getRedisKeys } from '@core/utils/gerRedisKeys';
import { AppError } from '@core/utils/response';


class RateLimitMiddleware {
    public async publicAPiRateLimit(req: Request, res: Response, next: NextFunction) {
        try {
            const ip = req.ip;
            const key = getRedisKeys("ratelimit", "public:ip", ip as string);
    
            // limit to 100 requests per minute
            const allowed = await checkRateLimit(key, 100, 60);
    
            if (!allowed) {
                throw new AppError(
                    429,
                    "TOO_MANY_REQUESTS",
                    "You have exceeded the request limit. Please try again later."
                );
            }
    
            next();
        }
        catch (error) {
            next(error);
        }
    }

    public async otpRateLimit(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user;
            const key = getRedisKeys("ratelimit", "otp:user", user!.id);

            // 5 requests per minute
            const allowed = await checkRateLimit(key, 5, 60);
    
            if (!allowed) {
                throw new AppError(
                    429,
                    "TOO_MANY_REQUESTS",
                    "You have exceeded the OTP request limit. Please try again later."
                );
            }
    
            next();
        }
        catch (error) {
            next(error);
        }
    }
}

export const rateLimitMiddleware = new RateLimitMiddleware();