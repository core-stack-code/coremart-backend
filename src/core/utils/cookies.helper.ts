import { CookieOptions, Response } from "express";
import { env } from "../config/env"
import { Log } from "@core/utils/log";
import { AUTH_CONFIG } from "@core/constants/authConfig";

type SameSiteType = boolean | "lax" | "strict" | "none" | undefined
type UserRole = 'user' | 'admin' | 'both';
const DOMAIN = env.DOMAIN;


export const getCookiesConfig = (): CookieOptions => {
    const environment = env.NODE_ENV || "development";

    const configs: Record<string, CookieOptions> = {
        development: {
            httpOnly: true,
            secure: true,
            sameSite: 'none' as SameSiteType,
        },
        production: {
            httpOnly: true,
            secure: true,
            sameSite: 'lax' as SameSiteType,
            domain: DOMAIN,
        }
    };

    Log.info(`Cookie Configs for ${environment}:`, configs[environment]);

    return configs[environment];
}

export const applyAuthCookies = (
    res: Response, 
    { accessToken, refreshToken }: {accessToken: string, refreshToken: string},
    type: UserRole = 'user'
) => {
    const accessCookieName = type === 'admin' 
        ? AUTH_CONFIG.adminCookiesName.accessToken
        : AUTH_CONFIG.cookieName.accessToken;

    const refreshCookieName = type === 'admin' 
        ? AUTH_CONFIG.adminCookiesName.refreshToken
        : AUTH_CONFIG.cookieName.refreshToken;

    res.cookie(accessCookieName, accessToken, {
        ...getCookiesConfig(),
        maxAge: AUTH_CONFIG.age.accessToken * 1000,
    });

    res.cookie(refreshCookieName, refreshToken, {
        ...getCookiesConfig(),
        maxAge: AUTH_CONFIG.age.refreshToken * 1000,
    });
}


export const clearAuthCookies = (res: Response, type: UserRole = 'user') => {
    const cookieConfig = getCookiesConfig();

    const cookieSets =
        type === 'both'
            ? [AUTH_CONFIG.adminCookiesName, AUTH_CONFIG.cookieName]
            : [type === 'admin' ? AUTH_CONFIG.adminCookiesName : AUTH_CONFIG.cookieName];

    for (const cookieNames of cookieSets) {
        res.clearCookie(cookieNames.accessToken, { ...cookieConfig });
        res.clearCookie(cookieNames.refreshToken, { ...cookieConfig });
    }
}