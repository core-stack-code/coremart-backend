import { PaymentStatus } from "generated/prisma/enums";

export type CashFreeCreateOrderPayload = {
    order_amount: number,
    order_currency: string,
    customer_details: {
        customer_id: string,
        customer_phone: string,
        customer_name: string,
    },
    order_id: string,
    order_meta: {
        return_url: string,
    },
}

export type CashFreeCreateOrderResponse = {
    cf_order_id: number;
    order_id: string;
    order_amount: number;
    order_currency: string;

    order_status: PaymentStatus;

    payment_session_id: string;

    created_at: string;
    order_expiry_time?: string;

    customer_details: {
        customer_id: string;
        customer_name: string;
        customer_phone: string;
        customer_email: string | null;
        customer_uid: string | null;
    }

    order_meta: {
        notify_url: string | null;
        return_url: string | null;
    }
}

export type CashfreePaymentWebhookPayload = {
    type: "PAYMENT_SUCCESS_WEBHOOK" | "PAYMENT_FAILED_WEBHOOK" | string;
    event_time: string;

    data: {
        order: {
            order_id: string;
            order_amount: number;
            order_currency: string;
            order_tags: Record<string, unknown> | null;
        };

        payment: {
            cf_payment_id: string;
            payment_status: "SUCCESS" | "FAILED" | "PENDING" | string;
            payment_amount: number;
            payment_currency: string;
            payment_message: string;
            payment_time: string;

            bank_reference: string | null;
            auth_id: string | null;

            // payment method can vary
            payment_method: Record<string, unknown>;

            payment_group: string | null;
            international_payment: boolean | null;

            payment_surcharge: {
                payment_surcharge_service_charge: number;
                payment_surcharge_service_tax: number;
            };
        };

        customer_details: {
            customer_name: string;
            customer_id: string;
            customer_email: string | null;
            customer_phone: string;
        };

        payment_gateway_details: {
            gateway_name: string;
            gateway_order_id: string;
            gateway_payment_id: string;
            gateway_status_code: string | null;
            gateway_order_reference_id: string | null;
            gateway_settlement: string;
            gateway_reference_name: string | null;
        };

        payment_offers: unknown | null;
        terminal_details: unknown | null;
    };
}