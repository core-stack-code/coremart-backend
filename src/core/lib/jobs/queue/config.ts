import { env } from "@core/config/env";

export const redisConnection = {
    connection: {
        url: env.REDIS_URL
    }
}

export const QUEUE_NAMES = {
    EXPIRATION: "expiration-queue",
    EMAIL: "email-queue",
    CLEANUP: "cleanup-queue"
}

export const QUEUE_JOBS = {
    EXPIRE_ORDER: "expire-order",
    EXPIRE_PAYMENT: "expire-payment",
    EMAIL_VERIFICATION: "email-verification",
    PASSWORD_RESET: "password-reset",
    ORDER_CONFIRM: "order-confirm",
    SESSION_CLEANUP: "session-cleanup",
    OTP_CLEANUP: "otp-cleanup"
}