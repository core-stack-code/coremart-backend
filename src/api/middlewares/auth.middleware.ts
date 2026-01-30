import { NextFunction, Request, Response } from "express";
import { AppError } from "../../core/utils/response";
import { log } from "../utils/log";
import { env } from "../config/env";
import { verifyJwtToken } from "../utils/jwt";
import { LoggedInAuth } from "../types/exprses";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies['__Host-atkn'] || req.headers.authorization?.split(" ")[1];
        log.info('checking in middleware', 1)

        if (!token) {
            throw new AppError(401, "UNAUTHORIZED", "Unauthorized access");
        }

        const decode = verifyJwtToken(token, env.JWT_ACCESS_SECRET)
        if (!decode) {
            throw new AppError(401, "UNAUTHORIZED", "Session has expire");
        }

        const auth: LoggedInAuth = {
            userId: decode.sub as string,
            email: decode.email,
            isGuest: false
        }
        
        req.auth = auth
        next();
    } catch (error) {
        next(error);
    }
}