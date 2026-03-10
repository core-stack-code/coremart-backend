import { Request, Response } from "express";
import { oauthService } from "./oauth.service";

import { env } from "@core/config/env";
import { applyAuthCookies } from "@core/utils/cookies.helper";
import { AppResponse } from "@core/utils/response";
import { log } from "@api/utils/log";


class OauthController {
    public async googleRedirect(_req: Request, res: Response) {
        const url = await oauthService.getGoogleAuthUrl();
        log.info("Redirecting to Google OAuth URL:", url);

        return res.redirect(url)
    }

    public async googleCallback(req: Request, res: Response) {
        const { code, state } = req.query;

        const { code: validCode } = await oauthService.validateRedirectionQuery(code, state, "state:google");

        const userInfo =  await oauthService.handleGoogleCallback(validCode);

        const { accessToken, refreshToken } = await oauthService.loginWithOAuth(
            { ...userInfo, provider: "GOOGLE" }, 
            {
                ip: req.ip,
                userAgent: req.headers['user-agent'] || "",
            }
        );

        applyAuthCookies(res, { accessToken, refreshToken });

        return res.redirect(env.CLIENT_DOMAIN_URL);
    }

    public async githubRedirect(_req: Request, res: Response) {
        const url = await oauthService.getGitHubAuthUrl();
        log.info("Redirecting to GitHub OAuth URL:", url);
        
        return res.redirect(url)
    }

    public async githubCallback(req: Request, res: Response) {
        const { code, state } = req.query;

        const { code: validCode } = await oauthService.validateRedirectionQuery(code, state, "state:github");

        const userInfo = await oauthService.handleGitHubCallback(validCode);

        const { accessToken, refreshToken } = await oauthService.loginWithOAuth(
            { ...userInfo, provider: "GITHUB" }, 
            {
                ip: req.ip,
                userAgent: req.headers['user-agent'] || "",
            }
        );

        // Set cookies
        applyAuthCookies(res, { accessToken, refreshToken });

        return res.redirect(env.CLIENT_DOMAIN_URL);
    }
    
    public async linkGoogleRedirect(req: Request, res: Response) {
        const url = await oauthService.getGoogleLinkingUrl(req.user!.id);
        log.info("Redirecting to Google OAuth URL for linking:", url);
       
        return res.redirect(url);
    }


    public async linkGoogleCallback(req: Request, res: Response) {
        const { code, state } = req.query;

        const { 
            code: validCode,
            userId
        } = await oauthService.validateRedirectionQuery(code, state, "link:google")

        const userInfo = await oauthService.handleGoogleCallback(validCode);

        await oauthService.linkOAuthAccount(userId, {
            ...userInfo,
            provider: "GOOGLE",
        });

        AppResponse(res, 200, {
            code: "OK",
            message: "Google account linked successfully.",
        });
    }


    public async linkGithubRedirect(req: Request, res: Response) {
        const url = await oauthService.getGitHubLinkingUrl(req.user!.id);
        log.info("Redirecting to GitHub OAuth URL for linking:", url);

        return res.redirect(url);
    }


    public async linkGithubCallback(req: Request, res: Response) {
        const { code, state } = req.query;

        const { 
            code: validCode,
            userId
        } = await oauthService.validateRedirectionQuery(code, state, "link:github")

        const userInfo = await oauthService.handleGitHubCallback(validCode);

        await oauthService.linkOAuthAccount(userId, {
            ...userInfo,
            provider: "GITHUB",
        });

        AppResponse(res, 200, {
            code: "OK",
            message: "GitHub account linked successfully.",
        });
    }
}

export const oauthController = new OauthController();