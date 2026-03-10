import { QUEUE_JOBS } from "../queue";
import { cleanupQueue } from "../queue/queues";

export const registerCleanupJobs = async () => {
    await cleanupQueue.add(
        QUEUE_JOBS.OTP_CLEANUP,
        {},
        {
            repeat: {
                pattern: "0 3 * * *",
            },
            jobId: "cleanup-expired-otp",
            removeOnComplete: true
        }
    );

    await cleanupQueue.add(
        QUEUE_JOBS.SESSION_CLEANUP,
        {},
        {
            repeat: {
                pattern: "0 4 * * *",
            },
            jobId: "cleanup-expired-session",
            removeOnComplete: true
        }
    );
}