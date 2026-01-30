import { NextFunction, Request, Response } from "express";
import { AppError } from "../../core/utils/response";
import { log } from "../utils/log";

const clinetMap = {
    'W-95W11L': 'web',
    'M-23JCR7': 'mobile',
}

export const detectClient = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers["x-app-client"];
    const clinetType = clinetMap[header as keyof typeof clinetMap];
    log.info('clinetType', clinetType)

    if (!clinetType) {
        throw new AppError(400, "BAD_REQUEST" ,"Invalid or mission app identifier");
    }

    req.clinetType = clinetType;
    next();
}