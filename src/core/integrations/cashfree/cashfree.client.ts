import axios from "axios";
import crypto from "crypto";
import { env } from "@core/config/env";

import { CashFreeCreateOrderPayload, CashFreeCreateOrderResponse } from "./type";
import { Log } from "@core/utils/log";
import { AppError } from "@api/utils/response";
import { getPaymentExpiryTime } from "@mod/order/order.utils";

const CASHFREE_API_KEY = env.CASHFREE_API_KEY;
const CASHFREE_API_SECRET = env.CASHFREE_API_SECRET;
const CASHFREE_API_VERSION = env.CASHFREE_API_VERSION;


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
        order_expiry_time: getPaymentExpiryTime(),
    }

    try {
        const res = await axios.post<CashFreeCreateOrderResponse>(URL, body, { headers });
        Log.info("Cashfree order created successfully:", res.data);
        return res.data;
    }
    catch (e: any) {
        Log.error("Error creating Cashfree Order:", {
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

    Log.info("Verifying Cashfree Signature:", {
        expectedSignature,
        signature
    });

    return expectedSignature === signature;
}