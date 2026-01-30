import { NextFunction, Request, Response } from "express";
import { AppError } from "../../../core/utils/response";
import { verifyCashfreeSignature } from "./payment.utils";
import { log } from "../../utils/log";


export const cashfreeWebhookController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rawBody = (req as any).rawBody;
        log.info('in webhook controller', {
            body: req.body,
            headers: req.headers,
            rawBody: rawBody
        });

        const signature = req.headers["x-webhook-signature"];
        const timestamp = req.headers["x-webhook-timestamp"];
        log.info("webhook signature", signature);

        if (!signature || typeof signature !== "string" || !timestamp || typeof timestamp !== "string") {
            throw new AppError(400, "BAD_REQUEST", "Missing webhook signature");
        }
        
        const isValid = verifyCashfreeSignature(rawBody, signature, timestamp);
        
        if (!isValid) {
            throw new AppError(400, "BAD_REQUEST", "Invalid webhook signature");
        }

        log.info('in webhook', req.body)

    }
    catch (error) {
        next(error)
    }
}