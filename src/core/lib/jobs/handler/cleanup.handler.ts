import { otpSessionRepository } from "@mod/otp-session/otpSession.repository";
import { sessionRepository } from "@mod/session/session.repository";
import { Log } from "@core/utils/log";


export const handleOtpCleanup = async () => {
    const cleanupDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const result = await otpSessionRepository.cleanupExpiredSessions(cleanupDate);

    Log.info(`OTP Cleanup Job: Deleted ${result.count} expired/used OTP sessions.`);
}


export const handleSessionCleanup = async () => {
    const cleanupDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
    const result = await sessionRepository.cleanupExpiredSessions(cleanupDate);

    Log.info(`Session Cleanup Job: Deleted ${result.count} expired/revoked sessions.`);
}