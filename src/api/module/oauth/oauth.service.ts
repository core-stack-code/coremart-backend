import QueryString from "qs";
import { OAuthProvider } from "generated/prisma/enums";


import { oauthRepository } from "./oauth.repository";
import { OauthLoginData } from "./oauth.utils";
import { userRepository } from "@mod/users/user.repository";
import { sessionService } from "@mod/session/session.service";

import { env } from "@core/config/env";
import { DeviceInfo, TokensResponse } from "@core/types/common";
import { getState } from "@core/lib/crypto";
import { AppError } from "@api/utils/response";
import { exchangeGoogleCode, fetchGoogleProfile, GOOGLE_OAUTH } from "@core/integrations/oauth/google.client";
import { exchangeGitHubCode, fetchGithubProfile, GITHUB_OAUTH } from "@core/integrations/oauth/github.client";
import { getRedisTemp, setRedisTemp } from "@core/lib/redis/tempStore";
import { getRedisKeys, RedisKeyEntity } from "@core/utils/gerRedisKeys";
import { REDIS_TTL } from "@core/constants/redisTtl";

type QyeryParam = string | QueryString.ParsedQs | (string | QueryString.ParsedQs)[] | undefined
type RedisKeyType = Extract<RedisKeyEntity, "state:google" | "state:github" | "link:google" | "link:github">;


class OAuthService {
    public async getGoogleAuthUrl() {
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

        const key = getRedisKeys("oauth", "state:google", state);
        await setRedisTemp(key, "1", REDIS_TTL.OAUTH_TEMP);

        return `${GOOGLE_OAUTH.authUrl}?${query}`
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

    public async getGitHubAuthUrl() {
        const state = getState();

        const query = QueryString.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            redirect_uri: env.GITHUB_REDIRECT_URI,
            scope: "read:user user:email",
            state,
        });

        const key = getRedisKeys("oauth", "state:github", state);
        await setRedisTemp(key, "1", REDIS_TTL.OAUTH_TEMP);

        return `${GITHUB_OAUTH.authUrl}?${query}`
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
            provider,
            providerAccountId: oauthProviderId,
            email,
        });

        // Create session for new user
        return await sessionService.createSession(userId, deviceInfo);
    }

    public async getGoogleLinkingUrl(userId: string) {
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

        const key = getRedisKeys("oauth", "link:google", state);
        await setRedisTemp(key, { userId }, REDIS_TTL.OAUTH_TEMP);

        return `${GOOGLE_OAUTH.authUrl}?${query}`
    }

    public async getGitHubLinkingUrl(userId: string) {
        const state = getState();

        const query = QueryString.stringify({
            client_id: env.GITHUB_CLIENT_ID,
            redirect_uri: env.GITHUB_REDIRECT_URI,
            scope: "read:user user:email",
            state,
        });

        const key = getRedisKeys("oauth", "link:github", state);
        await setRedisTemp(key, { userId }, REDIS_TTL.OAUTH_TEMP);

        return `${GITHUB_OAUTH.authUrl}?${query}`
    }

    public async linkOAuthAccount(
        userId: string | null,
        userInfo: OauthLoginData & { provider: OAuthProvider }
    ): Promise<void> {
        if (!userId) {
            throw new AppError(401, "UNAUTHORIZED", "Invalid linking state");
        }

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
            provider,
            providerAccountId: oauthProviderId,
            email,
        });
    }

    public async validateRedirectionQuery(
        code: QyeryParam,
        state: QyeryParam,
        redisKeyType: RedisKeyType,
    ) {
        let userId: string | null = null;

        if (!code || typeof code !== "string") {
            throw new AppError(
                400, 
                "BAD_REQUEST",
                "Authorization code is missing or invalid."
            );
        }

        const storedValue = await getRedisTemp(
            getRedisKeys("oauth", redisKeyType, state as string)
        );

        if (!state || typeof state !== "string") {
            throw new AppError(400, "BAD_REQUEST", "Missing OAuth state");
        }

        if (!storedValue) {
            throw new AppError(404, "RESOURCE_NOT_FOUND", "Invalid state, please try again later");
        }

        if ((redisKeyType.startsWith("state") && typeof storedValue !== "string") ||
            (redisKeyType.startsWith("link") && typeof storedValue !== "object")) {
            throw new AppError(401, "UNAUTHORIZED", "Invalid OAuth state");
        }

        if (redisKeyType.startsWith("link") && typeof storedValue === "object" && "userId" in storedValue) {
            userId = storedValue.userId as string;
        }

        return { code,  state, userId };
    }

    public getLinkedOAuthAccounts(userId: string) {
        return oauthRepository.getOauthByUserId(userId);
    }
}

export const oauthService = new OAuthService();