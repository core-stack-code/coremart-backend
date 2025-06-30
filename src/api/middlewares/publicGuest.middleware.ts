import { NextFunction, Request, Response } from "express";
import { verifyJwtToken } from "../utils/jwt";
import { env } from "../config/env";
import { AuthType } from "../types/exprses";

export const publicGuestMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies['__Host-atkn'] || req.headers.authorization?.split(" ")[1];
        
        let auth: AuthType = { isGuest: true };

        if (token) {
            const decode = verifyJwtToken(token, env.JWT_ACCESS_SECRET);
            if (decode) {
                auth = {
                    userId: decode.sub as string,
                    email: decode.email,
                    isGuest: false,
                };
            }
        }

        req.auth = auth;
        next();
    }
    catch (error) {
        next(error)
    }
}