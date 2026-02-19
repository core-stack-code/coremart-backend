import axios from "axios";
import crypto from "crypto";
import { env } from "@core/config/env";

import { CashFreeCreateOrderPayload, CashFreeCreateOrderResponse } from "./type";
import { log } from "@api/utils/log";
import { AppError } from "@core/utils/response";

const CASHFREE_API_KEY = env.CASHFREE_API_KEY;
const CASHFREE_API_SECRET = env.CASHFREE_API_SECRET;
const CASHFREE_API_VERSION = env.CASHFREE_API_VERSION;

const PAYMENT_EXPIRY_TIME = 20 * 60 * 1000; // 20 minutes


export const createCashfreeOrder = async (data: CashFreeCreateOrderPayload) => {
    const URL = "https://sandbox.cashfree.com/pg/orders";

    const headers = {
        'x-api-version': CASHFREE_API_VERSION,
        'x-client-id': CASHFREE_API_KEY,
        'x-client-secret': CASHFREE_API_SECRET,
        'Content-Type': 'application/json'
    }

    const body = {
        ...data,
        order_expiry_time: new Date(Date.now() + PAYMENT_EXPIRY_TIME).toISOString(),
    }

    try {
        const res = await axios.post<CashFreeCreateOrderResponse>(URL, body, { headers });
        return res.data;
    }
    catch (e: any) {
        log.error("Error creating Cashfree Order:", {
            message: e.message,
            response: e.response?.data,
        });

        throw new AppError(
            500,
            "INTERNAL_SERVER_ERROR",
            "Failed to create order. Please try again later."
        );
    }
}


export const verifyCashFreeWebhookSignature = (rawBody: any, signature: string, timestamp: string): boolean => {
    const message = timestamp + rawBody

    const expectedSignature = crypto
        .createHmac("sha256", CASHFREE_API_SECRET)
        .update(message)
        .digest("base64");

    log.info("Verifying Cashfree Signature:", {
        expectedSignature,
        signature
    });

    return expectedSignature === signature;
}