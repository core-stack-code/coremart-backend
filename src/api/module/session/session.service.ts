import { prisma } from "@core/config/prisma";
import { sessionRepository } from "./session.repository";
import { getDeviceInfo, MAX_SESSION_PER_USER } from "./session.utils";

import { env } from "@core/config/env";
import { getExpiryTime, getUuid } from "@core/utils/db.helper";
import { DeviceInfo, TokensResponse } from "@core/types/common";
import { AUTH_CONFIG } from "@core/constants/authConfig";
import { generateJwtToken, verifyJwtToken } from "@core/lib/jwt";
import { AppError } from "@core/utils/response";
import { randomUUID } from "crypto";


class SessionService {
    public async createSession(userId: string, deviceInfo: DeviceInfo): Promise<TokensResponse> {
        const expiresAt = getExpiryTime(AUTH_CONFIG.age.refreshToken);
        const { deviceName, deviceType } = getDeviceInfo(deviceInfo.userAgent);
        const tokens = sessionService.generateTokens(userId);

        await prisma.$transaction(async (tx) => {
            await sessionRepository.revokeOverflow(
                userId,
                MAX_SESSION_PER_USER - 1,
                tx
            );

            await sessionRepository.create({
                id: getUuid(),
                userId,
                expiresAt,
                refreshToken: tokens.refreshToken,
                ip: deviceInfo.ip || "",
                deviceType: deviceType || "DESKTOP",
                deviceName,
            }, tx);
        });

        return tokens;
    }

    public generateTokens(userId: string) {
        const accessToken = generateJwtToken({
            sub: userId,
        }, env.JWT_ACCESS_SECRET, AUTH_CONFIG.jwtExpiry.accessToken);
        
        const refreshToken = generateJwtToken({
            sub: userId,
            jti: randomUUID(),
        }, env.JWT_REFRESH_SECRET, AUTH_CONFIG.jwtExpiry.refreshToken);
        
        return { accessToken, refreshToken };
    }

    public async revokeByRefreshToken(refreshToken: string) {
        await prisma.$transaction(async (tx) => {
            const session = await sessionRepository.findByRefreshToken(refreshToken, tx);

            if (session) {
                await sessionRepository.revokeById(session.id, tx);
            }
        });
    }

    public async revokeAllSession(userId: string) {
       await sessionRepository.revokeAllByUserId(userId);
    }

    public async refreshSession(oldRefreshToken: string): Promise<TokensResponse> {
        return await prisma.$transaction(async (tx) => {
            const session = await sessionRepository.findByRefreshToken(oldRefreshToken, tx);

            if (!session) {
                throw new AppError(401, "UNAUTHORIZED", "Invalid token.");
            }

            const isValidToken = verifyJwtToken(
                oldRefreshToken,
                env.JWT_REFRESH_SECRET
            );

            if (!isValidToken) {
                throw new AppError(401, "UNAUTHORIZED", "Invalid token.");
            }

            const accessToken = generateJwtToken({
                sub: session.userId,
            }, env.JWT_ACCESS_SECRET, AUTH_CONFIG.jwtExpiry.accessToken);


            return {
                accessToken,
                refreshToken: oldRefreshToken,
            }
        });
    }
}

export const sessionService = new SessionService();