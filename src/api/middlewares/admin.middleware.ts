import { NextFunction, Request, Response } from "express";
import { adminRepository } from "@mod/admin/admin.repository";
import { env } from "@core/config/env";

import { verifyJwtToken } from "@core/lib/jwt";
import { AppError } from "@api/utils/response";
import { AUTH_CONFIG } from "@core/constants/authConfig";


export const adminMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const token = req.cookies[AUTH_CONFIG.adminCookiesName.accessToken];

        if (!token) {
            throw new AppError(401, "UNAUTHORIZED", "Unauthorized access. Token required.");
        }

        const decode = verifyJwtToken(token, env.ADMIN_ACCESS_SECRET)
        if (!decode || typeof decode.sub !== "string") {
            throw new AppError(401, "UNAUTHORIZED", "Session has expired");
        }

        const admin = await adminRepository.findById(decode.sub);

        if (!admin) {
            throw new AppError(401, "UNAUTHORIZED", "Admin not found.");
        }

        req.admin = admin;
        next();
    } catch (error) {
        next(error);
    }
};
