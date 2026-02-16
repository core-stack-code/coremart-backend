import { NextFunction, Request, Response } from "express";
import { userRepository } from "@mod/users/user.repository";
import { env } from "@core/config/env";

import { verifyJwtToken } from "@core/lib/jwt";
import { AppError } from "@core/utils/response";
import { AUTH_CONFIG } from "@core/constants/authConfig";

type AuthMiddlewareOptions = {
    requireEmailVerified?: boolean;
    isGuestRoute?: boolean;
};


async function validateToken (token: string) {
    const decode = verifyJwtToken(token, env.JWT_ACCESS_SECRET)
    if (!decode) {
        throw new AppError(401, "UNAUTHORIZED", "Session has expire");
    }

    const user = await userRepository.findById(decode.sub as string);

    if (!user) {
        throw new AppError(401, "UNAUTHORIZED", "User not found.");
    }

    return user;
}


export const authMiddleware = 
    (options: AuthMiddlewareOptions = { requireEmailVerified: true, isGuestRoute: false }) =>
    async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const token = 
                req.cookies[AUTH_CONFIG.cookieName.accessToken] 
                || req.headers.authorization?.split(" ")[1];

            // auth routes
            if (!options.isGuestRoute) {
                if (!token) {
                    throw new AppError(401, "UNAUTHORIZED", "Invalid or missing token.");
                }

                const user = await validateToken(token);
    
                if (options.requireEmailVerified && !user.isEmailVerified) {
                    throw new AppError(403, "FORBIDDEN", "Email verification required.");
                }

                req.user = user;
                req.isGuest = false;

                next();
                return;
            }

            // guest routes
            if (!token) {
                req.user = undefined;
                req.isGuest = true;

                next();
                return;
            }

            try {
                const user = await validateToken(token);
    
                if (options.requireEmailVerified && !user.isEmailVerified) {
                    req.user = undefined;
                    req.isGuest = true;
                } else {
                    req.user = user;
                    req.isGuest = false;
                }
            } catch (error) {
                req.user = undefined;
                req.isGuest = true;
            }

            next();
           
        } catch (error) {
            // Only non-guest routes throw errors
            next(error);
        }
    };