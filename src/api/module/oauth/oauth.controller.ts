import { Request, Response } from "express";
import { AppError, AppResponse } from "@core/utils/response";
import { oauthService } from "./oauth.service";
import { applyAuthCookies } from "@core/utils/cookies.helper";
import { log } from "@api/utils/log";
import { STATE_COOKIE_CONFIG } from "./oauth.utils";


class OauthController {
    public googleRedirect(_req: Request, res: Response) {
        const { url, state } = oauthService.getGoogleAuthUrl();

        res.cookie(STATE_COOKIE_CONFIG.name, state, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: STATE_COOKIE_CONFIG.age,
        });
        
        return res.redirect(url)
        
        // sending respone for testing purpose
        // AppResponse(res, 200, {
        //     code: "OK",
        //     message: "Success",
        //     data: { url }
        // });
    }


    public async googleCallback(req: Request, res: Response) {
        const { code, state } = req.query;

        if (!code || typeof code !== "string") {
            throw new AppError(
                400, 
                "BAD_REQUEST",
                "Authorization code is missing or invalid."
            );
        }

        if (!state || typeof state !== "string") {
            throw new AppError(400, "BAD_REQUEST", "Missing OAuth state");
        }

        const storedState = req.cookies[STATE_COOKIE_CONFIG.name];

        if (!storedState || storedState !== state) {
            throw new AppError(401, "UNAUTHORIZED", "Invalid OAuth state");
        }

        const userInfo =  await oauthService.handleGoogleCallback(code);

        const { accessToken, refreshToken } = await oauthService.loginWithOAuth(
            { ...userInfo, provider: "GOOGLE" }, 
            {
                ip: req.ip,
                userAgent: req.headers['user-agent'] || "",
            }
        );

        // Set cookies
        applyAuthCookies(res, { accessToken, refreshToken });

        AppResponse(res, 200, {
            code: "OK",
            message: "Google OAuth successful.",
        });
    }


    public githubRedirect(_req: Request, res: Response) {
        const { url, state } = oauthService.getGitHubAuthUrl();

        res.cookie(STATE_COOKIE_CONFIG.name, state, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: STATE_COOKIE_CONFIG.age,
        });
        
        return res.redirect(url)
    }

    public async githubCallback(req: Request, res: Response) {
        const { code, state } = req.query;

        if (!code || typeof code !== "string") {
            throw new AppError(
                400, 
                "BAD_REQUEST",
                "Authorization code is missing or invalid."
            );
        }

        if (!state || typeof state !== "string") {
            throw new AppError(400, "BAD_REQUEST", "Missing OAuth state");
        }

        const storedState = req.cookies[STATE_COOKIE_CONFIG.name];

        if (!storedState || storedState !== state) {
            throw new AppError(401, "UNAUTHORIZED", "Invalid OAuth state");
        }

        const userInfo = await oauthService.handleGitHubCallback(code);

        const { accessToken, refreshToken } = await oauthService.loginWithOAuth(
            { ...userInfo, provider: "GITHUB" }, 
            {
                ip: req.ip,
                userAgent: req.headers['user-agent'] || "",
            }
        );

        // Set cookies
        applyAuthCookies(res, { accessToken, refreshToken });

        AppResponse(res, 200, {
            code: "OK",
            message: "GitHub OAuth successful.",
        });
    }

}

export const oauthController = new OauthController();