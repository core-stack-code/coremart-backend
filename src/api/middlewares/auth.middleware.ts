import { NextFunction, Request, Response } from "express";
import { userRepository } from "@mod/users/user.repository";
import { env } from "@core/config/env";

import { verifyJwtToken } from "@core/lib/jwt";
import { AppError } from "@core/utils/response";
import { AUTH_CONFIG } from "@core/constants/authConfig";

type AuthMiddlewareOptions = {
    requireEmailVerified?: boolean;
};


export const authMiddleware = 
    (options: AuthMiddlewareOptions = { requireEmailVerified: true }) =>
    async (req: Request, _res: Response, next: NextFunction) => {
        try {
            const token = 
                req.cookies[AUTH_CONFIG.cookieName.accessToken] 
                || req.headers.authorization?.split(" ")[1];

            if (!token) {
                throw new AppError(401, "UNAUTHORIZED", "Unauthorized access. Token required.");
            }

            const decode = verifyJwtToken(token, env.JWT_ACCESS_SECRET)
            if (!decode) {
                throw new AppError(401, "UNAUTHORIZED", "Session has expire");
            }

            const user = await userRepository.findById(decode.sub as string);

            if (!user) {
                throw new AppError(401, "UNAUTHORIZED", "User not found.");
            }

            if (options.requireEmailVerified && !user.isEmailVerified) {
                throw new AppError(403, "FORBIDDEN", "Email verification required.");
            }

            req.user = user;
            next();
        } catch (error) {
            next(error);
        }
    };