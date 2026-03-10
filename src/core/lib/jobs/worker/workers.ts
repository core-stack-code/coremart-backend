import { Worker } from "bullmq";
import { QUEUE_NAMES, QUEUE_JOBS, redisConnection } from "../queue";
import { handleOrderExpiration, handlePaymentExpiration } from "../handler/expiration.handler";
import { handleEmailVerification, handlePasswordReset, handleOrderConfirm } from "../handler/email.handler";
import { handleOtpCleanup, handleSessionCleanup } from "../handler/cleanup.handler";
import { log } from "@api/utils/log";


new Worker(QUEUE_NAMES.EXPIRATION,
    async (job) => {
        try {
            switch (job.name) {
                case QUEUE_JOBS.EXPIRE_ORDER:
                    await handleOrderExpiration(job.data);
                    break;

                case QUEUE_JOBS.EXPIRE_PAYMENT:
                    await handlePaymentExpiration(job.data);
                    break;
            }
        }
        catch (e) {
            log.error(`Expiratoin job failed: ${job.name}`, e);
            throw e;
        }
    },
    redisConnection
);


new Worker(QUEUE_NAMES.EMAIL, 
    async (job) => {
        try {
            switch (job.name) {
                case QUEUE_JOBS.EMAIL_VERIFICATION:
                    await handleEmailVerification(job.data);
                    break;

                case QUEUE_JOBS.PASSWORD_RESET:
                    await handlePasswordReset(job.data);
                    break;

                case QUEUE_JOBS.ORDER_CONFIRM:
                    await handleOrderConfirm(job.data);
                    break;
            }
        }
        catch (e) {
            log.error(`Email job failed: ${job.name}`, e);
            throw e;
        }
        
    },
    redisConnection
);


new Worker(QUEUE_NAMES.CLEANUP,
    async (job) => {
        try {
            switch (job.name) {
            case QUEUE_JOBS.SESSION_CLEANUP:
                await handleSessionCleanup();
                break;

            case QUEUE_JOBS.OTP_CLEANUP:
                await handleOtpCleanup();
                break;
        }
        }
        catch (e) {
            log.error(`Cleanup job failed: ${job.name}`, e);
            throw e;
        }
    },
    redisConnection
);