import { NextFunction, Request, Response } from "express";
import { CustomError } from "../utils/response";
import { logger } from "../utils/logger";

const clinetMap = {
    'W-95W11L': 'web',
    'M-23JCR7': 'mobile',
}

export const detectClient = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers["x-app-client"];
    const clinetType = clinetMap[header as keyof typeof clinetMap];
    logger.info('clinetType', clinetType)

    if (!clinetType) {
        throw new CustomError("Invalid or mission app identifier", 400);
    }

    req.clinetType = clinetType;
    next();
}