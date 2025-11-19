import { NextFunction, Request, Response } from "express";
import { CustomError } from "../utils/response";
import { devLooger } from "../utils/devLogger";
import { env } from "../config/env";
import { verifyJwtToken } from "../utils/jwt";
import { LoggedInAuth } from "../types/exprses";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies['__Host-atkn'] || req.headers.authorization?.split(" ")[1];
        devLooger.info('checking in middleware', 1)

        if (!token) {
            throw new CustomError("Unauthorized access", 401);
        }

        const decode = verifyJwtToken(token, env.JWT_ACCESS_SECRET)
        if (!decode) {
            throw new CustomError("Session has expire", 401);
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