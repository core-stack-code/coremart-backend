import { NextFunction, Request, Response } from "express";
import { AppError } from "../../core/utils/response";
import { CLIENT_MAP } from "@core/constants/authConfig";
import { ClientType } from "@core/types/common";


class IdentityMiddleware {
    public detectClient(req: Request, _res: Response, next: NextFunction) {
        const header = req.headers["x-app-client"] as ClientType;
        const clientType = CLIENT_MAP[header];

        if (!clientType) {
            throw new AppError(400, "BAD_REQUEST" ,"Invalid or missing identifier");
        }

        req.clientType = clientType;
        next();
    }
}

export const identityMiddleware = new IdentityMiddleware();