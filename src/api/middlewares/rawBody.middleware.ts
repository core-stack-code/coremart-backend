import { Request, Response, NextFunction } from "express";

export const rawBodyMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.originalUrl.includes("/cashfree/webhook")) {
        req.setEncoding("utf8");

        let data = "";
        req.on("data", chunk => {
            data += chunk;
        });

        req.on("end", () => {
            (req as any).rawBody = data;
            next();
        });
    } else {
        next();
    }
};
