import { Request, Response } from "express";
import { AppError, AppResponse } from "@core/utils/response";
import { oauthService } from "./oauth.service";
import { applyAuthCookies } from "@core/utils/cookies.helper";
import { log } from "@api/utils/log";


class OauthController {
    public googleRedirect(_req: Request, res: Response) {
        const { url, state } = oauthService.getGoogleAuthUrl();

        res.cookie("oauth_state", state, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 5 * 60 * 1000,
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

        const storedState = req.cookies["oauth_state"];

        log.info("Stored State:", {storedState, check: req.cookies});

        if (!storedState || storedState !== state) {
            throw new AppError(401, "UNAUTHORIZED", "Invalid OAuth state");
        }

        const userInfo =  await oauthService.handleGoogleCallback(code);

        const { accessToken, refreshToken } = await oauthService.loginWithGoogleOAuth(
            userInfo, 
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
}

export const oauthController = new OauthController();