import { Queue } from "bullmq";
import { QUEUE_NAMES, redisConnection } from "./config";

export const expirationQueue = new Queue(QUEUE_NAMES.EXPIRATION, redisConnection);

export const emailQueue = new Queue(QUEUE_NAMES.EMAIL, redisConnection);

export const cleanupQueue = new Queue(QUEUE_NAMES.CLEANUP, redisConnection);