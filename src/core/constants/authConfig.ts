
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