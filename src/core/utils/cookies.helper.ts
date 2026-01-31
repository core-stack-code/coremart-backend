import { CookieOptions, Response } from "express";
import { env } from "../config/env"
import { log } from "@api/utils/log";
import { AUTH_CONFIG } from "@core/constants/authConfig";

type SameSiteType = boolean | "lax" | "strict" | "none" | undefined
const DOMAIN = ".coremart.com";


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

    log.info(`Cookie Configs for ${environment}:`, configs[environment]);

    return configs[environment];
}

export const applyAuthCookies = (
    res: Response, 
    {accessToken, refreshToken}: {accessToken: string, refreshToken: string}
) => {
    res.cookie(AUTH_CONFIG.cookieName.accessToken, accessToken, {
        ...getCookiesConfig(),
        maxAge: AUTH_CONFIG.age.accessToken * 1000,
    });

    res.cookie(AUTH_CONFIG.cookieName.refreshToken, refreshToken, {
        ...getCookiesConfig(),
        maxAge: AUTH_CONFIG.age.refreshToken * 1000,
    });
}