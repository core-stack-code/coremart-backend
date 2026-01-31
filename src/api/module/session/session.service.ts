import { DeviceInfo } from "@core/types/common";
import { sessionRepository } from "./session.repository";
import { getDeviceInfo, getTokenExpiryDate, MAX_SESSION_PER_USER } from "./session.utils";
import { getUuid } from "@core/utils/db.helper";
import { AUTH_CONFIG } from "@core/constants/authConfig";
import { generateJwtToken } from "@core/lib/jwt";
import { env } from "@core/config/env";


class SessionService {
    public async createSession(userId: string, deviceInfo: DeviceInfo) {
        const sessoinCount = await sessionRepository.countActive(userId);

        if (sessoinCount >= MAX_SESSION_PER_USER) {
            await sessionRepository.revokeOldest(userId);
        }

        const expiresAt = getTokenExpiryDate(AUTH_CONFIG.age.refreshToken);
        const { deviceName, deviceType } = getDeviceInfo(deviceInfo.userAgent);
        const { accessToken, refreshToken } = sessionService.generateTokens(userId);

        await sessionRepository.create({
            id: getUuid(),
            userId,
            expiresAt,
            refreshTokenHash: refreshToken,
            ip: deviceInfo.ip || "",
            deviceType: deviceType || "DESKTOP",
            deviceName,
        });

        return { accessToken, refreshToken };
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
}

export const sessionService = new SessionService();