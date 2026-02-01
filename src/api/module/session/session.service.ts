import { prisma } from "@core/config/prisma";
import { sessionRepository } from "./session.repository";
import { getDeviceInfo, getTokenExpiryDate, MAX_SESSION_PER_USER } from "./session.utils";

import { env } from "@core/config/env";
import { getUuid } from "@core/utils/db.helper";
import { DeviceInfo, TokensResponse } from "@core/types/common";
import { AUTH_CONFIG } from "@core/constants/authConfig";
import { generateJwtToken } from "@core/lib/jwt";


class SessionService {
    public async createSession(userId: string, deviceInfo: DeviceInfo): Promise<TokensResponse> {
        const expiresAt = getTokenExpiryDate(AUTH_CONFIG.age.refreshToken);
        const { deviceName, deviceType } = getDeviceInfo(deviceInfo.userAgent);
        const tokens = sessionService.generateTokens(userId);

        await prisma.$transaction(async (tx) => {
            const sessoinCount = await sessionRepository.countActive(userId, tx);

            if (sessoinCount >= MAX_SESSION_PER_USER) {
                await sessionRepository.revokeOldest(userId, tx);
            }

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
}

export const sessionService = new SessionService();