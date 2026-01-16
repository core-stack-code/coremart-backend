import crypto from "crypto";
import { env } from "../../config/env";
import { devLooger } from "../../utils/devLogger";

const secret = env.CASHFREE_API_SECRET;

export const verifyCashfreeSignature = (rawBody: any, signature: string, timestamp: string): boolean => {
    const message = timestamp + rawBody

    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(message)
        .digest("base64");

    devLooger.info("expected signature", expectedSignature);
    devLooger.info("signature", signature);

    return expectedSignature === signature;
};