import { prisma } from "@core/config/prisma";
import { OtpSessionType, User } from "generated/prisma/client";

import { otpSessionRepository } from "@mod/otp-session/otpSession.repository";
import { passwordRepository } from "@mod/password/password.repository";
import { userRepository } from "@mod/users/user.repository";
import { passwordService } from "@mod/password/password.service";
import { VerifyOtpPayload } from "./auth.validator";

import { sendEmail } from "@core/lib/snedEmail";
import { compareOtpHash, genrateOtpHash } from "@core/lib/crypto";
import { getExpiryTime, getUuid } from "@core/utils/db.helper";
import { OTP_CONFIG } from "@core/constants/authConfig";
import { AppError } from "@core/utils/response";
import { log } from "@api/utils/log";


class OtpService {
    public async handleGenerateOtp(user: User, sessionType: OtpSessionType): Promise<void> {
        if (sessionType === "EMAIL_VERIFICATION" && user.isEmailVerified) {
            throw new AppError(400, "BAD_REQUEST", "Email is already verified.");
        }

        if (sessionType === "PASSWORD_RESET") {
            const passwordCredential = await passwordRepository.findByUserId(user.id);

            if (!passwordCredential) {
                throw new AppError(
                    400,
                    "BAD_REQUEST",
                    "You have not set a password. Cannot reset password."
                );
            }
        }

        const now = new Date();
        const windowStart = new Date(
            now.getTime() - OTP_CONFIG.newOtpIntervalMs
        );

        const resentCunt = await otpSessionRepository.countRecentByUserAndType(
            user.id,
            sessionType,
            windowStart
        );

        if (resentCunt >= OTP_CONFIG.maxAttempts) {
            throw new AppError(
                429, 
                "TOO_MANY_REQUESTS",
                "Too many OTP requests. Please try again later."
            );
        }

        const { otp, hash } = genrateOtpHash()

        log.info("generated otp", otp);

        await prisma.$transaction(async (tx) => {
            await otpSessionRepository.invalidateActiveByUserAndType(
                user.id,
                sessionType,
                now, 
                tx
            );

            await otpSessionRepository.create({
                id: getUuid(),
                userId: user.id,
                sessionType,
                otpHash: hash,
                expiresAt: getExpiryTime(OTP_CONFIG.otpExpiry),
                lastResendAt: now
            }, tx);
        });


        await sendEmail(
            user.email, 
            { otp, name: user.name || "User" }, 
            sessionType
        )
    }


    public async handleVerifyOtp(
        user: User, 
        payload: VerifyOtpPayload
    ): Promise<void> {
        if (payload.sessionType === "EMAIL_VERIFICATION" && user.isEmailVerified) {
            throw new AppError(400, "BAD_REQUEST", "Email is already verified.");
        }

        if (payload.sessionType === "PASSWORD_RESET" && !payload.newPassword) {
            throw new AppError(400, "BAD_REQUEST", "New password is required for password reset.");
        }

        const otpSession = await otpSessionRepository.findActiveByUserAndType(
            user.id,
            payload.sessionType
        );

        if (!otpSession) {
            // No active OTP session found.
            log.info("No active OTP session found for user:", user.id);
            throw new AppError(400, "BAD_REQUEST", "Invalid OTP. Please check OTP or generate a new one.");
        }
        
        if (otpSession.sessionType !== payload.sessionType) {
            // OTP session type mismatch.
            log.info("OTP session type mismatch for user:", user.id);
            throw new AppError(400, "BAD_REQUEST", "Invalid OTP. Please check OTP or generate a new one.");
        }

        if (payload.sessionType === "PASSWORD_RESET") {
            const passwordCredential = await passwordService.findPasswordByUserId(user.id);
    
            await passwordService.isSamePassword(
                payload.newPassword!, 
                passwordCredential.passwordHash
            )
        }

        if (otpSession.otpExpiresAt.getTime() < new Date().getTime()) {
            // OTP has expired.
            log.info("OTP has expired for user:", user.id);
            throw new AppError(400, "BAD_REQUEST", "Invalid OTP. Please check OTP or generate a new one.");
        }

        const isValidOtp = compareOtpHash(
            payload.otp, 
            otpSession.otpHash
        );

        if (!isValidOtp) {
            // Invalid OTP
            log.info("Invalid OTP provided by user:", user.id);
            throw new AppError(400, "BAD_REQUEST", "Invalid OTP. Please check OTP or generate a new one.");
        }

        await prisma.$transaction(async (tx) => {
            await otpSessionRepository.updateById(otpSession.id, { isUsed: true }, tx);

            if (payload.sessionType === "EMAIL_VERIFICATION") {
                await userRepository.updateById(user.id, { isEmailVerified: true }, tx);
            }
            else if (payload.sessionType === "PASSWORD_RESET") {
                await passwordService.updatePassword(
                    user.id, 
                    payload.newPassword!, 
                    tx
                );
            }
        });
    }


    public async handleResendOtp(user: User, sessionType: OtpSessionType): Promise<void> {
        if (sessionType === "EMAIL_VERIFICATION" && user.isEmailVerified) {
            throw new AppError(400, "BAD_REQUEST", "Email is already verified.");
        }

        if (sessionType === "PASSWORD_RESET") {
            await passwordService.findPasswordByUserId(user.id);
        }

        const otpSession = await otpSessionRepository.findActiveByUserAndType(
            user.id,
            sessionType
        );

        if (!otpSession) {
            throw new AppError(
                400,
                "BAD_REQUEST",
                "No active OTP found. Please generate a new OTP."
            );
        }

        const now = new Date();

        if (
            otpSession.lastResendAt &&
            now.getTime() - otpSession.lastResendAt.getTime() <
            OTP_CONFIG.resendCooldownMs
        ) {
            throw new AppError(
                429,
                "TOO_MANY_REQUESTS",
                "Please wait before resending OTP."
            );
        }

        if (otpSession.resendCount >= OTP_CONFIG.maxAttempts) {
            throw new AppError(
                429,
                "TOO_MANY_REQUESTS",
                "Maximum OTP resend attempts reached."
            );
        }

        const { otp, hash } = genrateOtpHash();

        log.info("resent otp", otp);

        await otpSessionRepository.updateById(
            otpSession.id,
            {
                otpHash: hash,
                otpExpiresAt: getExpiryTime(OTP_CONFIG.otpExpiry),
                resendCount: { increment: 1 },
                lastResendAt: now
            }
        );

        await sendEmail(
            user.email,
            { otp, name: user.name || "User" },
            sessionType
        );
    }
}

export const otpService = new OtpService();