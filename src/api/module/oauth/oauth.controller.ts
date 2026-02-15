import { Request, Response } from "express";
import { oauthService } from "./oauth.service";
import { STATE_COOKIE_CONFIG } from "./oauth.utils";
import { applyAuthCookies } from "@core/utils/cookies.helper";
import { AppResponse } from "@core/utils/response";


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
    }

    public async googleCallback(req: Request, res: Response) {
        const { code, state } = req.query;

        const storedState = req.cookies[STATE_COOKIE_CONFIG.name];

        const { 
            code: validCode,
        } = oauthService.validateRedirectionQuery(code, state, storedState)

        const userInfo =  await oauthService.handleGoogleCallback(validCode);

        const { accessToken, refreshToken } = await oauthService.loginWithOAuth(
            { ...userInfo, provider: "GOOGLE" }, 
            {
                ip: req.ip,
                userAgent: req.headers['user-agent'] || "",
            }
        );

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

        const storedState = req.cookies[STATE_COOKIE_CONFIG.name];

        const { 
            code: validCode,
        } = oauthService.validateRedirectionQuery(code, state, storedState)

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

        AppResponse(res, 200, {
            code: "OK",
            message: "GitHub OAuth successful.",
        });
    }
    
    public linkGoogleRedirect(req: Request, res: Response) {
        const { url, state } = oauthService.getGoogleLinkingUrl(req.user!.id);

        res.cookie(STATE_COOKIE_CONFIG.name, state, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: STATE_COOKIE_CONFIG.age,
        });
        
        return res.redirect(url);
    }


    public async linkGoogleCallback(req: Request, res: Response) {
        const { code, state } = req.query;

        const storedState = req.cookies[STATE_COOKIE_CONFIG.name];

        const { 
            code: validCode,
            state: validState
        } = oauthService.validateRedirectionQuery(code, state, storedState)

        const userInfo = await oauthService.handleGoogleCallback(validCode);

        await oauthService.linkOAuthAccount(validState, {
            ...userInfo,
            provider: "GOOGLE",
        });

        AppResponse(res, 200, {
            code: "OK",
            message: "Google account linked successfully.",
        });
    }


    public linkGithubRedirect(req: Request, res: Response) {
        const { url, state } = oauthService.getGitHubLinkingUrl(req.user!.id);

        res.cookie(STATE_COOKIE_CONFIG.name, state, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: STATE_COOKIE_CONFIG.age,
        });
        
        return res.redirect(url);
    }


    public async linkGithubCallback(req: Request, res: Response) {
        const { code, state } = req.query;

        const storedState = req.cookies[STATE_COOKIE_CONFIG.name];

        const { 
            code: validCode,
            state: validState
        } = oauthService.validateRedirectionQuery(code, state, storedState)

        const userInfo = await oauthService.handleGitHubCallback(validCode);

        await oauthService.linkOAuthAccount(validState, {
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