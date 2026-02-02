import { ClientType } from "@core/types/common";

export const CLIENT_MAP: Record<string, ClientType> = {
    'W-95W11L': 'web',
    'M-23JCR7': 'mobile',
}

export const AUTH_CONFIG = {
    age: {
        accessToken: 15 * 60, // 15 minutes
        refreshToken: 30 * 24 * 3600, // 30 days
    },
    cookieName: {
        accessToken: "__secure-atkn",
        refreshToken: "__secure-rtkn",
    },
    jwtExpiry: {
        accessToken: '15m',
        refreshToken: '30d',
    }
} as const;

export const OTP_CONFIG = {
    maxAttempts: 3,
    otpExpiry: 5 * 60, // 5 minutes
    resendCooldownMs: 2 * 60 * 1000, // 2 minutes
    newOtpIntervalMs: 5 * 60 * 1000, // 5 minutes
} as const;