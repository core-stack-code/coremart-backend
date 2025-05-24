import { NextFunction, Request, Response } from "express";
import { CustomError } from "../utils/response";
import { logger } from "../utils/logger";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies['__Host-atkn'] || req.headers.authorization?.split(" ")[1];

        if (!token) {
            throw new CustomError("Unauthorized access", 401);
        }

        // Here you would typically verify the token and attach user info to the request
        next();
    } catch (error) {
        next(error);
    }
}