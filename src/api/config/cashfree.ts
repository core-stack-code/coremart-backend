import axios from "axios";
import { env } from "process";

const CASHFREE_APP_ID = env.CASHFREE_APP_ID!;
const CASHFREE_SECRET_KEY = env.CASHFREE_SECRET_KEY!;
const CASHFREE_API_URL = env.CASHFREE_API_URL!;

export async function createCashfreeOrder(orderId: string, amount: number) {
  const headers = {
    "x-client-id": CASHFREE_APP_ID,
    "x-client-secret": CASHFREE_SECRET_KEY,
    "x-api-version": "2025-01-01",
  };

  const body = {
    order_amount: amount,
    order_currency: "INR",
    customer_details: {
      customer_id: "7112AAA812234",
      customer_phone: "9898989898",
    },
  };

  console.log("check", {
    CASHFREE_API_URL, body, headers
  })

  const response = await axios.post(CASHFREE_API_URL, body, { headers });
  console.log("response", response)
  return response.data;
}
