import axios from "axios";
import { env } from "../../config/env";
import { OrderLean } from "../order/order.model";

const CASHFREE_API_KEY = env.CASHFREE_API_KEY;
const CASHFREE_API_SECRET = env.CASHFREE_API_SECRET;
const CASHFREE_API_VERSION = "2025-01-01";

export const cashfreeCreateOrder = async (order: OrderLean) => {
    const url = "https://sandbox.cashfree.com/pg/orders";
    const headers = {
        'x-api-version': CASHFREE_API_VERSION,
        'x-client-id': CASHFREE_API_KEY,
        'x-client-secret': CASHFREE_API_SECRET,
        'Content-Type': 'application/json'
    }

    const body = {
        order_amount: order.order_amount,
        order_currency: order.order_currency,
        customer_details: {
            customer_id: order.userId.toString(),
            customer_phone: order.cutomerDetails.phone,
            customer_name: order.cutomerDetails.fullName,
        },
        order_id: order._id.toString(),
    }

    const response = await axios.post(url, body, { headers });
    return response.data;
}