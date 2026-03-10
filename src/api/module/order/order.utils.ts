import { QUEUE_JOBS, expirationQueue } from "@core/lib/jobs/queue";

export const ORDER_EXPIERY_TIME = 60 * 60 * 1000; // 60 minutes
export const PAYMENT_EXPIRY_TIME = 20 * 60 * 1000; // 20 minutes

export const getPaymentExpiryTime = () => {
    return new Date(Date.now() + PAYMENT_EXPIRY_TIME).toISOString();
}


export const addOrderExpirationJob = async (orderId: string) => {
    await expirationQueue.add(
        QUEUE_JOBS.EXPIRE_ORDER,
        { orderId: orderId },
        { 
            delay: ORDER_EXPIERY_TIME,
            jobId: `${QUEUE_JOBS.EXPIRE_ORDER}-${orderId}`
        }
    );
}

export const addPaymentExpirationJob = async (paymentId: string) => {
    await expirationQueue.add(
        QUEUE_JOBS.EXPIRE_PAYMENT,
        { paymentId: paymentId },
        { 
            delay: PAYMENT_EXPIRY_TIME,
            jobId: `${QUEUE_JOBS.EXPIRE_PAYMENT}-${paymentId}`
        }
    );
}