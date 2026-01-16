import { NextFunction, Request, Response } from "express";
import { CustomError } from "../../utils/response";
import { verifyCashfreeSignature } from "./payment.utils";
import { devLooger } from "../../utils/devLogger";


export const cashfreeWebhookController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const rawBody = (req as any).rawBody;
        devLooger.info('in webhook controller', {
            body: req.body,
            headers: req.headers,
            rawBody: rawBody
        });

        const signature = req.headers["x-webhook-signature"];
        const timestamp = req.headers["x-webhook-timestamp"];
        devLooger.info("webhook signature", signature);

        if (!signature || typeof signature !== "string" || !timestamp || typeof timestamp !== "string") {
            throw new CustomError("Missing webhook signature", 400)
        }
        
        const isValid = verifyCashfreeSignature(rawBody, signature, timestamp);
        
        if (!isValid) {
            throw new CustomError("Invalid webhook signature", 400)
        }

        devLooger.info('in webhook', req.body)

    }
    catch (error) {
        next(error)
    }
}