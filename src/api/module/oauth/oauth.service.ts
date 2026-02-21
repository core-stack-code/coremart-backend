import QueryString from "qs";
import { OAuthProvider } from "generated/prisma/enums";

import { oauthRepository } from "./oauth.repository";
import { userRepository } from "@mod/users/user.repository";
import { sessionService } from "@mod/session/session.service";

import { env } from "@core/config/env";
import { DeviceInfo, TokensResponse } from "@core/types/common";
import { OauthLoginData } from "./oauth.utils";
import { getUuid } from "@core/utils/db.helper";
import { getState, encryptLinkingState, decryptLinkingState } from "@core/lib/crypto";
import { AppError } from "@core/utils/response";
import { exchangeGoogleCode, fetchGoogleProfile, GOOGLE_OAUTH } from "@core/integrations/oauth/google.client";
import { exchangeGitHubCode, fetchGithubProfile, GITHUB_OAUTH } from "@core/integrations/oauth/github.client";

type QyeryParam = string | QueryString.ParsedQs | (string | QueryString.ParsedQs)[] | undefined


class OAuthService {
    public getGoogleAuthUrl(): { url: string; state: string } {
        const state = getState();

        const query = QueryString.stringify({
            client_id: env.GOOGLE_CLIENT_ID,
            redirect_uri: env.GOOGLE_REDIRECT_URI,
            response_type: "code",
            scope: "openid email profile",
            state,
            access_type: "offline",
            prompt: "consent",
        });

        return {
            url: `${GOOGLE_OAUTH.authUrl}?${query}`,
            state,
        }
    }

    public async handleGoogleCallback(code: string): Promise<OauthLoginData> {
        const tokens = await exchangeGoogleCode(code);
        const profile = await fetchGoogleProfile(tokens.access_token);

        return {
            email: profile.email,
            name: profile.name,
            oauthProviderId: profile.sub,
            isEmailVerified: profile.email_verified,
            profileUrl: profile.picture || null,
        };
    }

    public getGitHubAuthUrl(): { url: string; state: string } {
        const state = getState();

        const query = QueryString.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            redirect_uri: env.GITHUB_REDIRECT_URI,
            scope: "read:user user:email",
            state,
        });

        return {
            url: `${GITHUB_OAUTH.authUrl}?${query}`,
            state,
        }
    }

    
    public async handleGitHubCallback(code: string): Promise<OauthLoginData> {
        const tokenRes = await exchangeGitHubCode(code);
        const profile = await fetchGithubProfile(tokenRes.access_token);
       
        return profile;
    }

    public async loginWithOAuth(
        userInfo: OauthLoginData & { provider: OAuthProvider }, 
        deviceInfo: DeviceInfo
    ): Promise<TokensResponse> {
        const { email, name, isEmailVerified, oauthProviderId, provider } = userInfo;

        const existingOauth = await oauthRepository.findOauth(provider, oauthProviderId);

        if (existingOauth) {
            // User already exists, create session
            return await sessionService.createSession(existingOauth.userId, deviceInfo);
        }

        let userId: string;
        const user = await userRepository.findByEmail(email);

        if (!user) {
            const newUser = await userRepository.create({
                name,
                email,
                isEmailVerified,
                profilePictureUrl: userInfo.profileUrl,
            });
            userId = newUser.id;
        }
        else {
            userId = user.id;
        }

        await oauthRepository.create(userId, {
            id: getUuid(),
            provider,
            providerAccountId: oauthProviderId,
            email,
        });

        // Create session for new user
        return await sessionService.createSession(userId, deviceInfo);
    }

    public getGoogleLinkingUrl(userId: string): { url: string; state: string } {
        const state = encryptLinkingState(userId);

        const query = QueryString.stringify({
            client_id: env.GOOGLE_CLIENT_ID,
            redirect_uri: env.GOOGLE_REDIRECT_URI,
            response_type: "code",
            scope: "openid email profile",
            state,
            access_type: "offline",
            prompt: "consent",
        });

        return {
            url: `${GOOGLE_OAUTH.authUrl}?${query}`,
            state,
        }
    }

    public getGitHubLinkingUrl(userId: string): { url: string; state: string } {
        const state = encryptLinkingState(userId);

        const query = QueryString.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            redirect_uri: env.GITHUB_REDIRECT_URI,
            scope: "read:user user:email",
            state,
        });

        return {
            url: `${GITHUB_OAUTH.authUrl}?${query}`,
            state,
        }
    }

    public async linkOAuthAccount(
        state: string,
        userInfo: OauthLoginData & { provider: OAuthProvider }
    ): Promise<void> {
        const stateData = decryptLinkingState(state);
        const userId = stateData.userId;

        const { email, oauthProviderId, provider } = userInfo;

        const existingOauth = await oauthRepository.findOauth(
            provider,
            oauthProviderId
        );

        if (existingOauth) {
            if (existingOauth.userId === userId) {
                throw new AppError(
                    409,
                    "CONFLICT",
                    "This OAuth account is already linked to your account"
                );
            } else {
                throw new AppError(
                    409,
                    "CONFLICT",
                    "This OAuth account is already linked to another account"
                );
            }
        }

        const userExistingOauth = await oauthRepository.findByUserAndProvider(userId, provider);
        if (userExistingOauth) {
            throw new AppError(
                409, 
                "CONFLICT",
                `You already have a ${provider} account linked. Unlink it first`
            );
        }

        // Create the OAuth link
        await oauthRepository.create(userId, {
            id: getUuid(),
            provider,
            providerAccountId: oauthProviderId,
            email,
        });
    }

    public validateRedirectionQuery(code: QyeryParam, state: QyeryParam, storedState: any): { code: string; state: string } {
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

        if (!storedState || storedState !== state) {
            throw new AppError(401, "UNAUTHORIZED", "Invalid OAuth state");
        }

        return { code, state }
    }

    public getLinkedOAuthAccounts(userId: string) {
        return oauthRepository.getOauthByUserId(userId);
    }
}

export const oauthService = new OAuthService();